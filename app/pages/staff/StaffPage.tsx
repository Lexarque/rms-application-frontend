import React, { useState, useEffect } from "react";
import { api } from "../../lib/axios";
import { useQuery } from "@tanstack/react-query";
import { C, font } from "../../theme/tokens";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Btn } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { useNavigate } from "react-router";

interface StaffDto {
  id: number;
  fullName: string;
  username: string;
  role: string;
  phoneNumber: string;
}

interface DataTableResponse<T> {
  data: T[];
  totalRecords: number;
  filteredRecords: number;
}

const fetchStaff = async (name: string, page: number, size: number) => {
  const response = await api.get<DataTableResponse<StaffDto>>("/users/staff", {
    params: { name, page, size },
  });
  return response.data;
};

export default function StaffPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["staff", debouncedSearch, page, size],
    queryFn: () => fetchStaff(debouncedSearch, page, size),
    placeholderData: (previousData) => previousData,
  });

  const staffList = data?.data || [];
  const totalPages = data ? Math.ceil(data.filteredRecords / size) : 0;

  // Handler for navigation
  const handleRowClick = (id: number) => {
    navigate(`/staff/${id}`);
  };

  return (
    <div>
      <SectionHeader
        title="Staff Management"
        subtitle="Manage roles, schedules, and access permissions"
        action={<Btn onClick={() => navigate("/staff/add")}>+ Add Staff</Btn>}
      />

      {/* Search Input Area */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search staff by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            width: "100%",
            maxWidth: 300,
            fontFamily: font.body,
            color: "#333",
          }}
        />
      </div>

      {/* Data Table Area */}
      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
        }}
      >
        {isLoading && staffList.length === 0 ? (
          <p style={{ fontFamily: font.body }}>Loading staff...</p>
        ) : isError ? (
          <p style={{ fontFamily: font.body, color: "red" }}>
            Error loading data.
          </p>
        ) : (
          <>
            <Table
              columns={["Name", "Role", "Username", "Phone", "Actions"]}
              onRowClick={(i) => navigate(`/staff/${staffList[i].id}`)}
              rows={staffList.map((s) => [
                <div
                  key={s.id}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <Avatar name={s.fullName} size={28} />
                  <span
                    style={{
                      fontFamily: font.body,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {s.fullName}
                  </span>
                </div>,
                <Badge
                  key={`${s.id}-role`}
                  label={s.role}
                  color={s.role.toLowerCase() === "admin" ? "gold" : "default"}
                />,
                <span
                  key={`${s.id}-user`}
                  style={{ fontFamily: font.body, fontSize: 13 }}
                >
                  @{s.username}
                </span>,
                <span
                  key={`${s.id}-phone`}
                  style={{ fontFamily: font.body, fontSize: 13 }}
                >
                  {s.phoneNumber || "—"}
                </span>,
                <Btn key={`${s.id}-btn`} variant="ghost" size="sm">
                  Edit
                </Btn>,
              ])}
            />

            {/* Pagination Controls (Unchanged) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 20,
                fontFamily: font.body,
                fontSize: 13,
              }}
            >
              <span>
                Showing {staffList.length} of {data?.filteredRecords || 0}{" "}
                results
              </span>
              <div style={{ display: "flex" }}>
                <Btn
                  variant="ghost"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Btn>
                <span style={{ padding: "5px 10px", color: C.muted }}>
                  Page {page + 1} of {totalPages || 1}
                </span>
                <Btn
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Btn>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
