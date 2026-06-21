export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "RM 0.00";
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(amount);
}

export function formatRoleLabel(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function formatStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function getStatusBadgeColor(status: string): "success" | "warning" | "info" | "danger" {
  switch (status) {
    case "COMPLETED":
    case "SERVED":
      return "success";
    case "CANCELLED":
      return "danger";
    case "PREPARING":
    case "READY":
      return "warning";
    default:
      return "info";
  }
}