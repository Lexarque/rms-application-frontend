import { C, font } from "../../theme/tokens";
import { Avatar } from "../ui/Avatar";
import { NAV_ITEMS, ROLE_ACCESS } from "../../config/navigation";

interface SidebarProps {
  route: string;
  navigate: (path: string) => void;
  user: {
    username: string;
    role: string;
  };
}

export function Sidebar({ route, navigate, user }: SidebarProps) {
  const allowed = ROLE_ACCESS[user.role] || [];

  return (
    <aside
      style={{
        width: 220,
        background: C.sidebar,
        display: "flex",
        flexDirection: "column",
        padding: "0 0 20px",
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Brand */}
      <div style={{ padding: "28px 22px 20px" }}>
        <div
          style={{
            fontFamily: font.display,
            fontSize: 18,
            color: "#fff",
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          Zie's Corner
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#888880",
            marginTop: 3,
            fontFamily: font.body,
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Management System
        </div>
      </div>

      <div
        style={{
          height: "0.5px",
          background: "rgba(255,255,255,0.08)",
          margin: "0 22px 16px",
        }}
      />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0 10px" }}>
        {NAV_ITEMS.filter((item) => allowed.includes(item.key)).map((item) => {
          const active =
            route === item.route ||
            (route === "/" && item.route === "/dashboard");
          return (
            <div
              key={item.key}
              onClick={() => navigate(item.route)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                cursor: "pointer",
                marginBottom: 2,
                background: active ? "rgba(232,160,74,0.15)" : "transparent",
                color: active ? C.sidebarActive : C.sidebarText,
                fontSize: 13,
                fontFamily: font.body,
                fontWeight: active ? 500 : 400,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>
                {item.icon}
              </span>
              {item.label}
              {active && (
                <div
                  style={{
                    marginLeft: "auto",
                    width: 3,
                    height: 16,
                    borderRadius: 2,
                    background: C.sidebarActive,
                  }}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* User Footer */}
      <div
        style={{
          padding: "12px 14px",
          margin: "0 10px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={user.username} size={30} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                color: "#fff",
                fontFamily: font.body,
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.username}
            </div>
            <div
              style={{ fontSize: 10, color: "#888880", fontFamily: font.body }}
            >
              {user.role}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}