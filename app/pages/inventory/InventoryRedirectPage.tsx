import { Navigate } from "react-router";

export default function InventoryRedirectPage() {
  return <Navigate to="/inventory/catalog" replace />;
}
