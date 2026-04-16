import { C, font } from "../../theme/tokens";
import { Badge } from "../ui/Badge";
import { Btn } from "../ui/Button";

interface TopbarProps {
  title: string;
  user: {
    name: string;
    role: string;
  };
  onLogout: () => void;
}

export function Topbar({ title, user, onLogout }: TopbarProps) {
  const now = new Date().toLocaleDateString("en-MY", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <header
      style={{
        background: C.surface,
        borderBottom: `0.5px solid ${C.border}`,
        padding: "0 28px",
        height: 58,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: font.display,
          fontSize: 16,
          fontWeight: 600,
          color: C.text,
        }}
      >
        {title}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 12, color: C.muted, fontFamily: font.body }}>
          {now}
        </span>
        <Badge label={user.role} color="gold" />
        <Btn variant="ghost" size="sm" onClick={onLogout}>
          Sign out
        </Btn>
      </div>
    </header>
  );
}