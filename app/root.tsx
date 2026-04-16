import { AuthProvider } from "./context/AuthContext";
import { Outlet } from "react-router";
import type { Route } from "./+types/root";
import "./app.css"; // Global styles (if any)

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap",
  },
];

// ... existing meta/links/Layout code ...

export default function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}