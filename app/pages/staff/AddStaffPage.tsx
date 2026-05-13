import React, { useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../../lib/axios";
import { C, font } from "../../theme/tokens";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { Btn } from "../../components/ui/Button";

interface CreateStaffDto {
  fullName: string;
  username: string;
  password: string;
  role: string;
  phoneNumber: string;
}

const ROLES = ["admin", "staff", "manager"];

const fieldStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  width: "100%",
  fontFamily: font.body,
  fontSize: 13,
  color: "#333",
  background: "#fff",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontFamily: font.body,
  fontSize: 12,
  color: C.muted,
  marginBottom: 6,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  fontWeight: 500,
};

export default function AddStaffPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateStaffDto>({
    fullName: "",
    username: "",
    password: "",
    role: "STAFF",
    phoneNumber: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError(null);

    // Basic validation
    if (!form.fullName || !form.username || !form.password || !form.role) {
      setError("Full name, username, password, and role are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/users/create", form);
      navigate("/staff");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create staff. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Add Staff"
        subtitle="Create a new staff account and assign a role"
        action={
          <Btn variant="ghost" onClick={() => navigate("/staff")}>
            ← Back to List
          </Btn>
        }
      />

      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "30px 40px",
          maxWidth: 560,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Full Name */}
        <div>
          <label style={labelStyle}>Full Name</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="e.g. Jane Doe"
            style={fieldStyle}
          />
        </div>

        {/* Username */}
        <div>
          <label style={labelStyle}>Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="e.g. janedoe"
            style={fieldStyle}
          />
        </div>

        {/* Password */}
        <div>
          <label style={labelStyle}>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Set initial password"
            style={fieldStyle}
          />
        </div>

        {/* Role */}
        <div>
          <label style={labelStyle}>Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={fieldStyle}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Phone Number */}
        <div>
          <label style={labelStyle}>Phone Number <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span></label>
          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="e.g. +60123456789"
            style={fieldStyle}
          />
        </div>

        {/* Error */}
        {error && (
          <p style={{ fontFamily: font.body, fontSize: 13, color: "red", margin: 0 }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
          <Btn onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Staff"}
          </Btn>
          <Btn variant="ghost" onClick={() => navigate("/staff")}>
            Cancel
          </Btn>
        </div>
      </div>
    </div>
  );
}