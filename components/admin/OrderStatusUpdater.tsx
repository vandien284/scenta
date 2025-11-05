"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/app/actions/updateOrderStatusAction";
import { OrderSchema } from "@/types/OrderType";

interface StatusOption {
  value: OrderSchema["status"];
  label: string;
}

interface OrderStatusUpdaterProps {
  orderId: string;
  defaultStatus: OrderSchema["status"];
  options: StatusOption[];
  className?: string;
  selectClassName: string;
  buttonClassName: string;
  buttonLabel?: string;
  disabled?: boolean;
}

export default function OrderStatusUpdater({
  orderId,
  defaultStatus,
  options,
  className,
  selectClassName,
  buttonClassName,
  buttonLabel = "Lưu",
  disabled,
}: OrderStatusUpdaterProps) {
  const [status, setStatus] = useState<OrderSchema["status"]>(defaultStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("orderId", orderId);
      formData.set("status", status);
      await updateOrderStatusAction(formData);
      router.refresh();
    });
  };

  return (
    <form className={className} onSubmit={handleSubmit}>
      <select
        className={selectClassName}
        value={status}
        onChange={(event) => setStatus(event.target.value as OrderSchema["status"])}
        disabled={disabled || isPending}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button type="submit" className={buttonClassName} disabled={disabled || isPending}>
        {isPending ? "Đang lưu..." : buttonLabel}
      </button>
    </form>
  );
}
