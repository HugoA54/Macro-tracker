"use client";

import React from "react";
import { ToastItem } from "../types";

const TOAST_COLORS: Record<string, string> = {
  success: "#c8f060",
  error: "#f06060",
  info: "#60d4f0",
};

const TOAST_ICONS: Record<string, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

interface ToastProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const color = TOAST_COLORS[toast.type];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#16161c",
        border: `1px solid ${color}30`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 10,
        padding: "12px 16px",
        marginBottom: 8,
        fontSize: 13,
        color: "#f0f0f0",
        animation: "slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        minWidth: 280,
        maxWidth: 360,
        boxShadow: "0 4px 24px #00000060",
      }}
    >
      <span
        style={{
          color,
          fontSize: 15,
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        {TOAST_ICONS[toast.type]}
      </span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: "none",
          border: "none",
          color: "#7a7a90",
          cursor: "pointer",
          fontSize: 14,
          flexShrink: 0,
          padding: "0 2px",
        }}
      >
        ✕
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};
