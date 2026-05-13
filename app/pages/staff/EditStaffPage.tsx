import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { api } from "../../lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { C, font } from "../../theme/tokens";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { Btn } from "../../components/ui/Button";

interface UpdateStaffDto {
  fullName: string;
  username: string;
  role: string;
  phoneNumber: string;
  password: string;
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

export default function EditStaffPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<UpdateStaffDto>({
    fullName: "",
    username: "",
    role: "STAFF",
    phoneNumber: "",
    password: "",
  });

  // Fetch existing staff data
  const { data: staff, isLoading } = useQuery({
    queryKey: ["staff", id],
    queryFn: async () => {
      const res = await api.get(`/users/staff/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Autofill form once data is loaded
  useEffect(() => {
    if (staff) {
      setForm({
        fullName: staff.fullName,
        username: staff.username,
        role: staff.role,
        phoneNumber: staff.phoneNumber || "",
        password: "", // always blank — only filled if they want to change it
      });
    }
  }, [staff]);

  const { mutate: handleUpdate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: UpdateStaffDto) => api.put(`/users/staff/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      navigate(`/staff/${id}`);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || "Failed to update staff.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    setError(null);
    if (!form.fullName || !form.username || !form.role) {
      setError("Full name, username, and role are required.");
      return;
    }
    handleUpdate(form);
  };

  if (isLoading) return <p style={{ fontFamily: font.body }}>Loading...</p>;

  return (
    <div>
      <SectionHeader
        title="Edit Staff"
        subtitle="Update staff account details"
        action={
          <Btn variant="ghost" onClick={() => navigate(`/staff/${id}`)}>
            ← Back to Profile
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
        <div>
          <label style={labelStyle}>Full Name</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} style={fieldStyle} />
        </div>

        <div>
          <label style={labelStyle}>Username</label>
          <input name="username" value={form.username} onChange={handleChange} style={fieldStyle} />
        </div>

        <div>
          <label style={labelStyle}>Role</label>
          <select name="role" value={form.role} onChange={handleChange} style={fieldStyle}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>
            Phone Number{" "}
            <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span>
          </label>
          <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+60123456789" style={fieldStyle} />
        </div>

        <div>
          <label style={labelStyle}>
            New Password{" "}
            <span style={{ color: C.muted, fontWeight: 400 }}>(leave blank to keep current)</span>
          </label>
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" style={fieldStyle} />
        </div>

        {error && (
          <p style={{ fontFamily: font.body, fontSize: 13, color: "red", margin: 0 }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
          <Btn onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Btn>
          <Btn variant="ghost" onClick={() => navigate(`/staff/${id}`)}>
            Cancel
          </Btn>
        </div>
      </div>
    </div>
  );
}