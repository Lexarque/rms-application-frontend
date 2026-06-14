import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { C, font } from "~/theme/tokens";
import { Btn } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.username.trim() || !form.password || !form.fullName.trim()) {
      setError("Username, password, and full name are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await register(
      form.username.trim(),
      form.password,
      form.fullName.trim(),
      form.phoneNumber.trim() || undefined
    );
    setIsSubmitting(false);

    if (result.success) {
      navigate("/order", { replace: true });
    } else {
      setError(result.message ?? "Registration failed.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 420,
        }}
      >
        <h1
          style={{
            fontFamily: font.display,
            fontSize: 26,
            color: C.text,
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          Create Account
        </h1>
        <p
          style={{
            fontFamily: font.body,
            fontSize: 13,
            color: C.muted,
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          Register to place your order
        </p>

        {error && (
          <p
            style={{
              fontFamily: font.body,
              fontSize: 13,
              color: C.danger,
              marginBottom: 16,
              padding: "10px 14px",
              background: "#fdf2f2",
              borderRadius: 8,
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <Input label="Full Name *" value={form.fullName} onChange={set("fullName")} />
          <Input label="Username *" value={form.username} onChange={set("username")} />
          <Input label="Phone Number" value={form.phoneNumber} onChange={set("phoneNumber")} />
          <Input label="Password *" type="password" value={form.password} onChange={set("password")} />
          <Input label="Confirm Password *" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} />

          <Btn type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
          </Btn>
        </form>

        <p
          style={{
            fontFamily: font.body,
            fontSize: 13,
            color: C.muted,
            textAlign: "center",
            marginTop: 20,
          }}
        >
          Already have an account?{" "}
          <Link to="/login" style={{ color: C.accent, textDecoration: "none", fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}