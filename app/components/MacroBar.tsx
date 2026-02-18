"use client";

import React from "react";

const P = {
  border: "#2a2a35",
  muted: "#7a7a90",
  text: "#f0f0f0",
};

interface MacroBarProps {
  label: string;
  value: number;
  goal: number;
  color: string;
  unit?: string;
}

export const MacroBar: React.FC<MacroBarProps> = ({
  label,
  value,
  goal,
  color,
  unit = "g",
}) => {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  const isOver = value > goal;
  const displayColor = isOver ? "#f0c060" : color;

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            color: P.muted,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isOver && (
            <span
              style={{
                fontSize: 10,
                color: "#f0c060",
                background: "#f0c06015",
                border: "1px solid #f0c06040",
                borderRadius: 4,
                padding: "1px 5px",
              }}
            >
              +{value - goal}
              {unit}
            </span>
          )}
          <span
            style={{
              color: P.text,
              fontSize: 11,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span style={{ color: displayColor, fontWeight: "bold" }}>
              {value}
            </span>
            <span style={{ color: P.muted }}>
              /{goal}
              {unit}
            </span>
          </span>
        </div>
      </div>
      <div
        style={{
          height: 5,
          background: P.border,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: displayColor,
            borderRadius: 3,
            transition: "width 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </div>
  );
};
