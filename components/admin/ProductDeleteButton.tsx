"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "@/app/actions/adminProductsActions";

interface ProductDeleteButtonProps {
  productId: number;
  productName: string;
  className?: string;
}

export default function ProductDeleteButton({ productId, productName, className }: ProductDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Bạn chắc chắn muốn xóa "${productName}"?`)) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", String(productId));
      await deleteProductAction(formData);
      router.refresh();
    });
  };

  return (
    <button type="button" className={className} onClick={handleDelete} disabled={isPending}>
      {isPending ? "Đang xóa..." : "Xóa"}
    </button>
  );
}
