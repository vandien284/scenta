import { head, put } from "@vercel/blob";
import path from "path";
import { readFile, writeFile } from "fs/promises";
import crypto from "crypto";
import {
  VerificationRecord,
  VerificationStoreSchema,
} from "@/types/OrderType";

const VERIFICATION_BLOB_SOURCE = process.env.VERIFICATIONS_BLOB_URL;
const VERIFICATION_BLOB_PATH = process.env.VERIFICATIONS_BLOB_PATH;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const LOCAL_VERIFICATION_PATH = path.join(
  process.cwd(),
  "data",
  "verificationCodes.json"
);

const CACHE_TTL = 10_000;
const CODE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

let cachedStore: VerificationStoreSchema | null = null;
let lastFetch = 0;

const globalScope = globalThis as unknown as {
  __VERIFICATION_MEMORY__?: Map<string, VerificationRecord>;
};

function getMemoryStore() {
  if (!globalScope.__VERIFICATION_MEMORY__) {
    globalScope.__VERIFICATION_MEMORY__ = new Map<string, VerificationRecord>();
  }
  return globalScope.__VERIFICATION_MEMORY__;
}

function syncMemory(records: VerificationRecord[]) {
  const memory = getMemoryStore();
  memory.clear();
  for (const record of records) {
    memory.set(record.id, record);
  }
}

function now() {
  return new Date().toISOString();
}

function isExpired(record: VerificationRecord) {
  const expiresAt = new Date(record.expiresAt).getTime();
  return expiresAt < Date.now();
}

async function fetchFromBlob(): Promise<VerificationStoreSchema | null> {
  if (!VERIFICATION_BLOB_SOURCE) {
    return null;
  }

  try {
    if (VERIFICATION_BLOB_SOURCE.startsWith("http")) {
      const response = await fetch(VERIFICATION_BLOB_SOURCE, {
        headers: BLOB_TOKEN
          ? {
            Authorization: `Bearer ${BLOB_TOKEN}`,
          }
          : undefined,
        next: { revalidate: 0 },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch verification store: ${response.statusText}`);
      }
      return (await response.json()) as VerificationStoreSchema;
    }

    const blob = await head(VERIFICATION_BLOB_SOURCE, {
      token: BLOB_TOKEN,
    });
    const response = await fetch(blob.downloadUrl, { next: { revalidate: 0 } });
    if (!response.ok) {
      throw new Error(`Failed to download verification blob: ${response.statusText}`);
    }
    return (await response.json()) as VerificationStoreSchema;
  } catch (error) {
    console.warn("[verificationStore] Unable to load blob store:", error);
    return null;
  }
}

async function readLocalStore(): Promise<VerificationStoreSchema> {
  try {
    const raw = await readFile(LOCAL_VERIFICATION_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<VerificationStoreSchema> | null;
    if (!parsed || !Array.isArray(parsed.records)) {
      return { records: [] };
    }
    return { records: parsed.records };
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return { records: [] };
    }
    console.error("[verificationStore] Unable to read local store:", err);
    return { records: [] };
  }
}

async function loadStore(options?: { forceReload?: boolean }): Promise<VerificationStoreSchema> {
  const nowMs = Date.now();
  const forceReload = options?.forceReload ?? false;
  if (!forceReload && cachedStore && nowMs - lastFetch < CACHE_TTL) {
    return cachedStore;
  }

  const blobStore = await fetchFromBlob();
  const sourceStore = blobStore ?? (await readLocalStore());
  const filteredRecords = sourceStore.records.filter(
    (record) => !isExpired(record) && !record.consumedAt
  );

  const needsCleanup = filteredRecords.length !== sourceStore.records.length;

  const store: VerificationStoreSchema = {
    records: filteredRecords,
  };

  cachedStore = store;
  lastFetch = nowMs;
  syncMemory(store.records);

  if (needsCleanup) {
    await persistStore(store);
  }

  return store;
}

async function writeLocal(store: VerificationStoreSchema) {
  await writeFile(
    LOCAL_VERIFICATION_PATH,
    JSON.stringify(store, null, 2),
    "utf-8"
  );
}

async function persistStore(store: VerificationStoreSchema) {
  await writeLocal(store);

  cachedStore = { records: [...store.records] };
  lastFetch = Date.now();
  syncMemory(cachedStore.records);

  if (VERIFICATION_BLOB_PATH) {
    void put(
      VERIFICATION_BLOB_PATH,
      JSON.stringify(store, null, 2),
      {
        access: "public",
        token: BLOB_TOKEN,
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      }
    ).catch((error) => {
      console.error("[verificationStore] Unable to persist to blob:", error);
    });
  }
}

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createVerificationRecord(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const store = await loadStore();

  const code = crypto.randomInt(100000, 999999).toString();
  const record: VerificationRecord = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    codeHash: hashCode(code),
    createdAt: now(),
    expiresAt: new Date(Date.now() + CODE_TTL).toISOString(),
    attempts: 0,
  };

  const records = [
    ...store.records.filter((item) => item.email !== normalizedEmail),
    record,
  ];
  const nextStore: VerificationStoreSchema = { records };
  getMemoryStore().set(record.id, record);
  await persistStore(nextStore);

  return { record, code };
}

export async function verifyRecordCode(id: string, code: string) {
  const memory = getMemoryStore();
  let record = memory.get(id);

  if (!record) {
    const store = await loadStore({ forceReload: true });
    record = store.records.find((item) => item.id === id);
    if (record) {
      memory.set(id, record);
    }
  }

  if (!record) {
    return { ok: false as const, reason: "not_found" as const };
  }

  if (record.consumedAt) {
    return { ok: false as const, reason: "consumed" as const };
  }

  if (isExpired(record)) {
    await removeRecord(id);
    return { ok: false as const, reason: "expired" as const };
  }

  const hashed = hashCode(code);

  if (record.codeHash !== hashed) {
    record.attempts += 1;
    const locked = record.attempts >= MAX_ATTEMPTS;

    if (locked) {
      await removeRecord(id);
      return { ok: false as const, reason: "locked" as const };
    }

    await persistStore({ records: Array.from(getMemoryStore().values()) });
    return { ok: false as const, reason: "mismatch" as const };
  }

  if (!record.verifiedAt) {
    record.verifiedAt = now();
  }

  record.attempts = Math.min(record.attempts, MAX_ATTEMPTS);
  await persistStore({ records: Array.from(getMemoryStore().values()) });

  return { ok: true as const, record };
}

export async function consumeVerifiedRecord(id: string) {
  const memory = getMemoryStore();
  let record = memory.get(id);

  if (!record) {
    const store = await loadStore({ forceReload: true });
    record = store.records.find((item) => item.id === id);
    if (record) {
      memory.set(id, record);
    }
  }

  if (!record) {
    throw new Error("Verification record không tồn tại.");
  }

  if (record.consumedAt) {
    throw new Error("Mã xác thực đã được sử dụng.");
  }

  if (isExpired(record)) {
    await removeRecord(id);
    throw new Error("Mã xác thực đã hết hạn.");
  }

  if (!record.verifiedAt) {
    throw new Error("Mã xác thực chưa được xác nhận.");
  }

  record.consumedAt = now();
  memory.set(id, record);
  await persistStore({ records: Array.from(memory.values()) });
  return record;
}

export async function removeRecord(id: string) {
  const store = await loadStore({ forceReload: true });
  const nextRecords = store.records.filter((item) => item.id !== id);
  getMemoryStore().delete(id);
  await persistStore({ records: nextRecords });
}

export async function getRecord(id: string): Promise<VerificationRecord | null> {
  const memory = getMemoryStore();
  const record = memory.get(id);
  if (record) return record;
  const store = await loadStore({ forceReload: true });
  const found = store.records.find((item) => item.id === id) ?? null;
  if (found) {
    memory.set(id, found);
  }
  return found;
}

export async function ensureVerifiedRecord(id: string) {
  const record = await getRecord(id);

  if (!record) {
    throw new Error("Mã xác thực không tồn tại.");
  }

  if (record.consumedAt) {
    throw new Error("Mã xác thực đã được sử dụng.");
  }

  if (isExpired(record)) {
    await removeRecord(id);
    throw new Error("Mã xác thực đã hết hạn.");
  }

  if (!record.verifiedAt) {
    throw new Error("Mã xác thực chưa được xác nhận.");
  }

  return record;
}
