"use client";

import React, { useState } from "react";
import { Goals } from "../types";

const P = {
  bg: "#0f0f12",
  card: "#16161c",
  border: "#2a2a35",
  accent: "#c8f060",
  text: "#f0f0f0",
  muted: "#7a7a90",
};

const GOAL_FIELDS = [
  {
    key: "calories" as const,
    label: "Calories",
    unit: "kcal/jour",
    color: "#c8f060",
    hint: "Total énergétique journalier",
  },
  {
    key: "proteines" as const,
    label: "Protéines",
    unit: "g/jour",
    color: "#60d4f0",
    hint: "Réparation musculaire",
  },
  {
    key: "glucides" as const,
    label: "Glucides",
    unit: "g/jour",
    color: "#f0c060",
    hint: "Énergie principale",
  },
  {
    key: "lipides" as const,
    label: "Lipides",
    unit: "g/jour",
    color: "#f060a8",
    hint: "Hormones et absorption",
  },
] as const;

interface GoalsModalProps {
  goals: Goals;
  onSave: (goals: Goals) => Promise<void>;
  onClose: () => void;
}

export const GoalsModal: React.FC<GoalsModalProps> = ({
  goals,
  onSave,
  onClose,
}) => {
  const [form, setForm] = useState<Goals>({ ...goals });
  const [saving, setSaving] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${P.border}`,
    background: P.bg,
    color: P.text,
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#00000088",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: P.card,
          border: `1px solid ${P.border}`,
          borderRadius: "20px 20px 0 0",
          padding: 24,
          width: "100%",
          maxWidth: 450,
          animation: "slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <h2
            style={{ fontSize: 16, fontWeight: "bold", color: P.text, margin: 0 }}
          >
            Objectifs journaliers
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: P.muted,
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: 12, color: P.muted, marginBottom: 20, marginTop: 4 }}>
          Personnalise tes cibles quotidiennes. Sauvegardées localement.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 22,
          }}
        >
          {GOAL_FIELDS.map((f) => (
            <div key={f.key}>
              <label
                style={{
                  fontSize: 11,
                  color: f.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: 2,
                }}
              >
                {f.label}
              </label>
              <div
                style={{
                  fontSize: 10,
                  color: P.muted,
                  marginBottom: 6,
                }}
              >
                {f.hint}
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  min={0}
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [f.key]: Number(e.target.value),
                    }))
                  }
                  style={inputStyle}
                />
                <span
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 10,
                    color: P.muted,
                    pointerEvents: "none",
                  }}
                >
                  {f.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Estimated macro split */}
        <div
          style={{
            background: P.bg,
            border: `1px solid ${P.border}`,
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 20,
            fontSize: 11,
            color: P.muted,
          }}
        >
          <div style={{ marginBottom: 6, color: P.text, fontWeight: "bold" }}>
            Répartition estimée
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              {
                label: "Protéines",
                kcal: form.proteines * 4,
                color: "#60d4f0",
              },
              {
                label: "Glucides",
                kcal: form.glucides * 4,
                color: "#f0c060",
              },
              {
                label: "Lipides",
                kcal: form.lipides * 9,
                color: "#f060a8",
              },
            ].map(({ label, kcal, color }) => {
              const pct =
                form.calories > 0
                  ? Math.round((kcal / form.calories) * 100)
                  : 0;
              return (
                <div key={label}>
                  <span style={{ color }}>{label} </span>
                  <span style={{ color: P.text }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 10,
              background: "transparent",
              color: P.muted,
              border: `1px solid ${P.border}`,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
            }}
          >
            Annuler
          </button>
          <button
            onClick={async () => {
              setSaving(true);
              try {
                await onSave(form);
                onClose();
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            style={{
              flex: 2,
              padding: 12,
              borderRadius: 10,
              background: P.accent,
              color: "#000",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
            }}
          >
            {saving ? "Sauvegarde..." : "✓ Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
};
