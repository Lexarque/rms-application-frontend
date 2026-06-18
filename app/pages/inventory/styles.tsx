import React from "react";
import { C, font } from "../../theme/tokens";

export function InventoryStyles() {
  return (
    <style>{`
      .inv-kpi-row {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        margin-bottom: 16px;
      }
      .inv-kpi-card {
        border: 1px solid ${C.border};
        border-radius: 12px;
        padding: 14px 16px;
        background: #ffffff;
        display: grid;
        gap: 6px;
      }
      .inv-kpi-card span {
        font-size: 11px;
        letter-spacing: 0.3px;
        text-transform: uppercase;
        color: ${C.muted};
      }
      .inv-kpi-card strong {
        font-size: 24px;
        line-height: 1;
        color: #111827;
        font-family: ${font.display};
        font-weight: 600;
      }
      .inv-page-actions {
        border: 1px solid ${C.border};
        border-radius: 12px;
        background: #ffffff;
        padding: 12px 14px;
        margin-bottom: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .inv-page-actions-copy {
        display: grid;
        gap: 4px;
      }
      .inv-page-actions-copy strong {
        font-size: 13px;
        color: #111827;
      }
      .inv-page-actions-copy span {
        font-size: 12px;
        color: #5b6573;
        line-height: 1.5;
      }
      .inv-grid {
        display: grid;
        gap: 14px;
        grid-template-columns: minmax(540px, 1.4fr) minmax(340px, 1fr);
        align-items: start;
      }
      .inv-catalog-grid {
        grid-template-columns: minmax(0, 1fr);
      }
      .inv-grid.single {
        grid-template-columns: 1fr;
      }
      .inv-panel {
        border: 1px solid ${C.border};
        border-radius: 12px;
        padding: 14px;
        background: #ffffff;
        display: grid;
        gap: 12px;
        width: 100%;
      }
      .inv-panel h3 {
        margin: 0;
        font-size: 16px;
        color: #111827;
      }
      .inv-subtle {
        margin: 4px 0 0;
        font-size: 12px;
        color: ${C.muted};
      }
      .inv-row-between {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }
      .inv-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .inv-page-actions .inv-actions button {
        min-width: 158px;
      }
      .inv-filter-grid,
      .inv-form-grid {
        display: grid;
        gap: 10px;
      }
      .inv-form-grid {
        grid-template-columns: 1fr 1fr;
      }
      .inv-span-2 {
        grid-column: 1 / -1;
      }
      .inv-control {
        border: 1px solid ${C.border};
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 13px;
        font-family: ${font.body};
        color: ${C.text};
        background: #ffffff;
        outline: none;
        width: 100%;
        box-sizing: border-box;
      }
      .inv-product-controls {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .inv-snapshot {
        border: 1px solid ${C.border};
        border-radius: 12px;
        padding: 10px 14px;
        background: #f8fafc;
        display: grid;
        gap: 8px;
        min-width: 220px;
      }
      .inv-snapshot-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .inv-snapshot-head strong {
        font-size: 13px;
        color: #111827;
      }
      .inv-snapshot-meta {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 12px;
        color: ${C.muted};
      }
      .inv-label {
        font-size: 12px;
        color: ${C.muted};
        margin-bottom: 6px;
        font-weight: 500;
      }
      .inv-pills {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .inv-pill {
        border: 1px solid #d8dee7;
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 12px;
        background: #ffffff;
        color: #1f2937;
        cursor: pointer;
        font-weight: 500;
      }
      .inv-pill.active {
        background: #111827;
        border-color: #111827;
        color: #ffffff;
      }
      .inv-segment .inv-pill {
        min-width: 96px;
        text-align: center;
      }
      .inv-pill-count {
        margin-left: 4px;
        font-size: 11px;
        opacity: 0.85;
      }
      .inv-filter-summary {
        margin-top: 8px;
        font-size: 12px;
        color: #475569;
      }
      .inv-table-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        white-space: nowrap;
      }
      .inv-catalog-table-wrap table {
        table-layout: fixed;
      }
      .inv-catalog-table-wrap th:nth-child(1),
      .inv-catalog-table-wrap td:nth-child(1) {
        width: 28%;
      }
      .inv-catalog-table-wrap th:nth-child(2),
      .inv-catalog-table-wrap td:nth-child(2) {
        width: 10%;
      }
      .inv-catalog-table-wrap th:nth-child(3),
      .inv-catalog-table-wrap td:nth-child(3) {
        width: 14%;
      }
      .inv-catalog-table-wrap th:nth-child(4),
      .inv-catalog-table-wrap td:nth-child(4) {
        width: 14%;
      }
      .inv-catalog-table-wrap th:nth-child(5),
      .inv-catalog-table-wrap td:nth-child(5) {
        width: 18%;
      }
      .inv-catalog-table-wrap th:nth-child(6),
      .inv-catalog-table-wrap td:nth-child(6) {
        width: 16%;
      }
      .inv-catalog-table-wrap th,
      .inv-catalog-table-wrap td {
        vertical-align: top;
      }
      .inv-catalog-table-wrap td:nth-child(1) {
        word-break: break-word;
      }
      .inv-catalog-table-wrap th:nth-child(2),
      .inv-catalog-table-wrap td:nth-child(2),
      .inv-catalog-table-wrap th:nth-child(3),
      .inv-catalog-table-wrap td:nth-child(3),
      .inv-catalog-table-wrap th:nth-child(4),
      .inv-catalog-table-wrap td:nth-child(4),
      .inv-catalog-table-wrap th:nth-child(5),
      .inv-catalog-table-wrap td:nth-child(5),
      .inv-catalog-table-wrap th:nth-child(6),
      .inv-catalog-table-wrap td:nth-child(6) {
        white-space: nowrap;
      }
      .inv-item-cell {
        display: grid;
        gap: 2px;
      }
      .inv-table-wrap {
        border: 1px solid ${C.border};
        border-radius: 12px;
        overflow: auto;
        max-height: 440px;
        width: 100%;
      }
      .inv-selected-card {
        border: 1px solid ${C.border};
        border-radius: 12px;
        padding: 12px;
        background: #ffffff;
        color: #1f2937;
        display: grid;
        gap: 6px;
      }
      .inv-selected-title {
        color: #111827;
      }
      .inv-meter {
        height: 8px;
        border-radius: 999px;
        background: #eef2f7;
        overflow: hidden;
      }
      .inv-meter-fill {
        height: 100%;
        border-radius: 999px;
        background: #111827;
      }
      .inv-meta {
        color: #586171;
        font-size: 12px;
      }
      .inv-preview-box {
        border: 1px solid ${C.border};
        border-radius: 12px;
        background: #ffffff;
        padding: 12px;
        display: grid;
        gap: 10px;
      }
      .inv-preview-box strong {
        color: #111827;
      }
      .inv-preview-list {
        display: grid;
        gap: 8px;
      }
      .inv-preview-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        border: 1px solid #edf1f6;
        background: #fff;
        border-radius: 8px;
        padding: 10px;
      }
      .inv-sticky-submit {
        position: sticky;
        bottom: 0;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        gap: 10px;
        padding: 10px;
        border: 1px solid ${C.border};
        border-radius: 12px;
        background: #ffffff;
      }
      .inv-ok {
        border: 1px solid ${C.border};
        background: #ffffff;
        color: #334155;
        border-radius: 12px;
        padding: 12px;
        font-size: 13px;
      }
      .inv-alert-list {
        display: grid;
        gap: 8px;
      }
      .inv-alert-row {
        border: 1px solid #edf1f6;
        background: #ffffff;
        border-radius: 12px;
        padding: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        color: #334155;
      }
      .inv-error {
        margin-bottom: 12px;
        padding: 10px 12px;
        border: 1px solid #e3e8ef;
        border-radius: 12px;
        background: #ffffff;
        color: #b42318;
        font-size: 12px;
      }
      @media (max-width: 1200px) {
        .inv-kpi-row {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .inv-grid {
          grid-template-columns: 1fr;
        }
        .inv-catalog-grid {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 740px) {
        .inv-kpi-row,
        .inv-form-grid,
        .inv-product-controls {
          grid-template-columns: 1fr;
        }
        .inv-page-actions .inv-actions button {
          min-width: 0;
        }
        .inv-sticky-submit {
          flex-direction: column;
        }
        .inv-page-actions {
          padding: 12px;
        }
        .inv-catalog-table-wrap th:nth-child(5),
        .inv-catalog-table-wrap td:nth-child(5) {
          white-space: normal;
        }
        .inv-catalog-table-wrap th:nth-child(1),
        .inv-catalog-table-wrap td:nth-child(1),
        .inv-catalog-table-wrap th:nth-child(6),
        .inv-catalog-table-wrap td:nth-child(6) {
          width: auto;
        }
      }
    `}</style>
  );
}
