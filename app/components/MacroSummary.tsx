"use client";

import React from "react";
import { MacroBar } from "./MacroBar";
import { Goals, MacroTotals } from "../types";

const P = {
  card: "#16161c",
  border: "#2a2a35",
  accent: "#c8f060",
  text: "#f0f0f0",
  muted: "#7a7a90",
};

interface MacroSummaryProps {
  totals: MacroTotals;
  goals: Goals;
  onEditGoals: () => void;
}

export const MacroSummary: React.FC<MacroSummaryProps> = ({
  totals,
  goals,
  onEditGoals,
}) => {
  const calPct = Math.min(100, Math.round((totals.calories / goals.calories) * 100));
  const remaining = goals.calories - totals.calories;
  const isOver = remaining < 0;

  return (
    <div
      style={{
        background: P.card,
        border: `1px solid ${P.border}`,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              color: P.muted,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}
          >
            Calories aujourd'hui
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              style={{
                fontSize: 38,
                fontWeight: "bold",
                color: isOver ? "#f0c060" : P.accent,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {totals.calories}
            </span>
            <span style={{ fontSize: 13, color: P.muted }}>
              / {goals.calories} kcal
            </span>
          </div>
          <div style={{ fontSize: 11, color: P.muted, marginTop: 5 }}>
            {isOver ? (
              <span style={{ color: "#f0c060" }}>
                +{Math.abs(remaining)} kcal dépassées
              </span>
            ) : (
              <span>
                <span style={{ color: P.accent }}>{remaining}</span> kcal
                restantes
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onEditGoals}
          style={{
            background: "none",
            border: `1px solid ${P.border}`,
            borderRadius: 8,
            padding: "6px 10px",
            color: P.muted,
            cursor: "pointer",
            fontSize: 11,
            transition: "border-color 0.2s, color 0.2s",
          }}
        >
          ⚙ Objectifs
        </button>
      </div>

      {/* Calorie progress bar */}
      <div
        style={{
          height: 7,
          background: P.border,
          borderRadius: 4,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${calPct}%`,
            background: isOver
              ? "#f0c060"
              : `linear-gradient(90deg, ${P.accent}cc, ${P.accent})`,
            borderRadius: 4,
            transition: "width 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>

      {/* Macro bars */}
      <MacroBar
        label="Protéines"
        value={totals.proteines}
        goal={goals.proteines}
        color="#60d4f0"
      />
      <MacroBar
        label="Glucides"
        value={totals.glucides}
        goal={goals.glucides}
        color="#f0c060"
      />
      <MacroBar
        label="Lipides"
        value={totals.lipides}
        goal={goals.lipides}
        color="#f060a8"
      />
    </div>
  );
};
