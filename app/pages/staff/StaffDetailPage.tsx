import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { api } from "../../lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { C, font } from "../../theme/tokens";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { Badge } from "../../components/ui/Badge";
import { Btn } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { Modal } from "../../components/ui/Modal";

interface StaffDto {
  id: number;
  fullName: string;
  username: string;
  role: string;
  phoneNumber: string;
}

const fetchStaffById = async (id: string) => {
  const response = await api.get<StaffDto>(`/users/staff/${id}`);
  return response.data;
};

const deleteStaff = async (id: string) => {
  await api.delete(`/users/staff/${id}`);
};

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: staff, isLoading, isError } = useQuery({
    queryKey: ["staff", id],
    queryFn: () => fetchStaffById(id as string),
    enabled: !!id,
  });

  const { mutate: handleDelete, isPending: isDeleting, error: deleteError } = useMutation({
    mutationFn: () => deleteStaff(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      navigate("/staff");
    },
  });

  if (isLoading) return <p style={{ fontFamily: font.body }}>Loading details...</p>;
  if (isError || !staff) return <p style={{ fontFamily: font.body, color: "red" }}>Error loading user details.</p>;

  return (
    <div>
      <SectionHeader
        title="Staff Profile"
        subtitle={`Viewing details for ${staff.fullName}`}
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
          display: "flex",
          flexDirection: "column",
          gap: 24,
          maxWidth: 600,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Avatar name={staff.fullName} size={72} />
          <div>
            <h2 style={{ fontFamily: font.body, margin: 0, fontSize: 24, color: "#111" }}>
              {staff.fullName}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <span style={{ fontFamily: font.body, fontSize: 14, color: "#666" }}>
                @{staff.username}
              </span>
              <Badge
                label={staff.role}
                color={staff.role.toLowerCase() === "admin" ? "gold" : "default"}
              />
            </div>
          </div>
        </div>

        <hr style={{ border: 0, borderTop: `1px solid ${C.border}`, width: "100%" }} />

        {/* Info Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <p style={{ fontFamily: font.body, fontSize: 12, color: "#888", margin: "0 0 4px 0" }}>Phone Number</p>
            <p style={{ fontFamily: font.body, fontSize: 14, margin: 0, color: "#333" }}>
              {staff.phoneNumber || "Not provided"}
            </p>
          </div>
          <div>
            <p style={{ fontFamily: font.body, fontSize: 12, color: "#888", margin: "0 0 4px 0" }}>User ID</p>
            <p style={{ fontFamily: font.body, fontSize: 14, margin: 0, color: "#333" }}>#{staff.id}</p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          <Btn onClick={() => navigate(`/staff/${id}/edit`)}>Edit Profile</Btn>
          <Btn
            variant="ghost"
            style={{ color: "red" }}
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete Account
          </Btn>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Deactivate Account"
      >
        <p style={{ fontFamily: font.body, fontSize: 14, color: C.text, margin: "0 0 8px 0" }}>
          Are you sure you want to deactivate{" "}
          <strong>{staff.fullName}</strong>'s account? This action cannot be undone.
        </p>

        {deleteError && (
          <p style={{ fontFamily: font.body, fontSize: 13, color: "red", margin: "0 0 16px 0" }}>
            Failed to deactivate account. Please try again.
          </p>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
            Cancel
          </Btn>
          <Btn
            style={{ background: "red", color: "#fff" }}
            onClick={() => handleDelete()}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </Btn>
        </div>
      </Modal>
    </div>
  );
}