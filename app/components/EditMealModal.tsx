"use client";

import React, { useState } from "react";
import { Meal } from "../types";

const P = {
  bg: "#0f0f12",
  card: "#16161c",
  border: "#2a2a35",
  accent: "#c8f060",
  text: "#f0f0f0",
  muted: "#7a7a90",
};

const MACRO_FIELDS = [
  { key: "calories" as const, label: "Calories", unit: "kcal", color: "#c8f060" },
  { key: "proteines" as const, label: "Protéines", unit: "g", color: "#60d4f0" },
  { key: "glucides" as const, label: "Glucides", unit: "g", color: "#f0c060" },
  { key: "lipides" as const, label: "Lipides", unit: "g", color: "#f060a8" },
] as const;

interface EditMealModalProps {
  meal: Meal;
  onSave: (id: number, updates: Partial<Meal>) => Promise<void>;
  onClose: () => void;
}

export const EditMealModal: React.FC<EditMealModalProps> = ({
  meal,
  onSave,
  onClose,
}) => {
  const [form, setForm] = useState({
    name: meal.name,
    calories: meal.calories,
    proteines: meal.proteines,
    glucides: meal.glucides,
    lipides: meal.lipides,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(meal.id, form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

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
            marginBottom: 20,
          }}
        >
          <h2
            style={{ fontSize: 16, fontWeight: "bold", color: P.text, margin: 0 }}
          >
            Modifier le repas
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

        <form onSubmit={handleSubmit}>
          {/* Nom */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 11,
                color: P.muted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: 6,
              }}
            >
              Nom du repas
            </label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              style={inputStyle}
              required
            />
          </div>

          {/* Macros grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 22,
            }}
          >
            {MACRO_FIELDS.map((f) => (
              <div key={f.key}>
                <label
                  style={{
                    fontSize: 11,
                    color: f.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  {f.label}{" "}
                  <span style={{ color: P.muted, textTransform: "none" }}>
                    ({f.unit})
                  </span>
                </label>
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
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
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
              type="submit"
              disabled={saving}
              style={{
                flex: 2,
                padding: 12,
                borderRadius: 10,
                background: saving ? P.border : P.accent,
                color: saving ? P.muted : "#000",
                fontWeight: "bold",
                border: "none",
                cursor: saving ? "wait" : "pointer",
                fontFamily: "inherit",
                fontSize: 14,
                transition: "background 0.2s",
              }}
            >
              {saving ? "Sauvegarde..." : "✓ Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
