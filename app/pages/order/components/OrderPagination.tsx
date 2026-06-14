import React from "react";
import { C, font } from "../../../theme/tokens";
import { Btn } from "../../../components/ui/Button";

interface Props {
  page: number;
  showingCount: number;
  hasMore: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const OrderPagination: React.FC<Props> = ({ page, showingCount, hasMore, onPrevious, onNext }) => (
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
    <span>Showing {showingCount} results</span>
    <div style={{ display: "flex" }}>
      <Btn variant="ghost" size="sm" disabled={page === 0} onClick={onPrevious}>
        Previous
      </Btn>
      <span style={{ padding: "5px 10px", color: C.muted }}>Page {page + 1}</span>
      <Btn variant="ghost" size="sm" disabled={!hasMore} onClick={onNext}>
        Next
      </Btn>
    </div>
  </div>
);