import React, { useState } from "react";
import { C, font } from "../theme/tokens";
import { Input } from "../components/ui/Input";
import { Btn } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(username, password);
    if (!result.success) setError(result.message || "Error");
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.sidebar, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.body, padding: 16 }}>
      <div style={{ background: C.surface, borderRadius: 20, padding: "44px 40px", width: "100%", maxWidth: 400, boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🍽</div>
          <h1 style={{ fontFamily: font.display, fontSize: 26, color: C.text, margin: 0, fontWeight: 700 }}>Zie's Corner</h1>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 6, letterSpacing: "1px", textTransform: "uppercase" }}>Restaurant Management System</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Username" value={username} onChange={(e: any) => setUsername(e.target.value)} placeholder="Enter your username" required />
          <Input label="Password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="••••••••" required />

          {error && (
            <div style={{ fontSize: 12, color: C.danger, padding: "8px 12px", background: "#FCEBEB", borderRadius: 8 }}>{error}</div>
          )}

          <Btn onClick={handleSubmit} disabled={loading || !username || !password}>
            {loading ? "Signing in…" : "Sign in"}
          </Btn>
        </div>
      </div>
    </div>
  );
}