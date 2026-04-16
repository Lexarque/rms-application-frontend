import { C, font } from "../theme/tokens";

export default function UnauthorizedPage() {
  return (
    <div style={{ textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <h2 style={{ fontFamily: font.display, color: C.text, marginBottom: 8 }}>
        Access Restricted
      </h2>
      <p style={{ color: C.muted, fontFamily: font.body, fontSize: 14 }}>
        You don't have permission to view this page.
      </p>
    </div>
  );
}