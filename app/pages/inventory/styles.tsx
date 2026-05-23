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
        border-radius: 14px;
        padding: 14px;
        background: linear-gradient(140deg, #ffffff 0%, #f7f8fa 100%);
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
        font-size: 25px;
        line-height: 1;
        color: #1f2b3d;
        font-family: ${font.display};
        font-weight: 700;
      }
      .inv-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
      }
      .inv-tab {
        border: 1px solid #d3d8e0;
        border-radius: 8px;
        padding: 8px 12px;
        background: #ffffff;
        font-size: 12px;
        font-weight: 700;
        color: #334155;
        cursor: pointer;
      }
      .inv-tab.active {
        background: #edf4fc;
        border-color: #aac3e0;
        color: #103e73;
      }
      .inv-grid {
        display: grid;
        gap: 14px;
        grid-template-columns: minmax(540px, 1.4fr) minmax(340px, 1fr);
        align-items: start;
      }
      .inv-grid.single {
        grid-template-columns: 1fr;
      }
      .inv-panel {
        border: 1px solid ${C.border};
        border-radius: 14px;
        padding: 14px;
        background: #ffffff;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
        display: grid;
        gap: 12px;
      }
      .inv-panel h3 {
        margin: 0;
        font-size: 16px;
        color: #1f2937;
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
      .inv-snapshot {
        border: 1px solid #d8e2ef;
        border-radius: 10px;
        background: #f7fbff;
        padding: 10px 12px;
        display: grid;
        gap: 4px;
        min-width: 200px;
      }
      .inv-snapshot strong {
        font-size: 13px;
      }
      .inv-snapshot span {
        font-size: 12px;
        color: #526072;
      }
      .inv-filter-grid,
      .inv-form-grid {
        display: grid;
        gap: 10px;
      }
      .inv-form-grid {
        grid-template-columns: 1fr 1fr;
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
        border: 1px solid #d1d7e0;
        border-radius: 999px;
        padding: 6px 11px;
        font-size: 12px;
        background: #f8fafc;
        color: #1f2937;
        cursor: pointer;
        font-weight: 600;
      }
      .inv-pill.active {
        background: #e8f0fb;
        border-color: #93b4dc;
        color: #0f3f73;
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
      .inv-table-wrap {
        border: 1px solid ${C.border};
        border-radius: 10px;
        overflow: auto;
        max-height: 440px;
      }
      .inv-selected-card {
        border: 1px solid #dce4ef;
        border-radius: 10px;
        padding: 12px;
        background: #f8fbff;
        color: #1f2937;
        display: grid;
        gap: 6px;
      }
      .inv-selected-title {
        color: #1f2937;
      }
      .inv-meter {
        height: 8px;
        border-radius: 999px;
        background: #e8edf4;
        overflow: hidden;
      }
      .inv-meter-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #4f8bc8 0%, #2f5f96 100%);
      }
      .inv-meta {
        color: #586171;
        font-size: 12px;
      }
      .inv-preview-box {
        border: 1px solid #d8e2ef;
        border-radius: 10px;
        background: #fbfdff;
        padding: 12px;
        display: grid;
        gap: 10px;
      }
      .inv-preview-box strong {
        color: #1f2937;
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
        border: 1px solid #e3e9f2;
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
        border: 1px solid #decbac;
        border-radius: 10px;
        background: #fff8ee;
      }
      .inv-ok {
        border: 1px solid #bee5c8;
        background: #effaf2;
        color: #22643a;
        border-radius: 10px;
        padding: 12px;
        font-size: 13px;
      }
      .inv-alert-list {
        display: grid;
        gap: 8px;
      }
      .inv-alert-row {
        border: 1px solid #f0c1c1;
        background: #fff6f6;
        border-radius: 10px;
        padding: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        color: #7a1f1f;
      }
      .inv-error {
        margin-bottom: 12px;
        padding: 10px 12px;
        border: 1px solid #efc3c3;
        border-radius: 10px;
        background: #fff5f5;
        color: #a42c2c;
        font-size: 12px;
      }
      @media (max-width: 1200px) {
        .inv-kpi-row {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .inv-grid {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 740px) {
        .inv-kpi-row,
        .inv-form-grid {
          grid-template-columns: 1fr;
        }
        .inv-sticky-submit {
          flex-direction: column;
        }
      }
    `}</style>
  );
}
