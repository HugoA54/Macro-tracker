"use client";

import React, { useState } from "react";
import { Meal } from "../types";

const P = {
  card: "#16161c",
  cardHover: "#1c1c24",
  border: "#2a2a35",
  text: "#f0f0f0",
  muted: "#7a7a90",
  accent: "#c8f060",
};

interface MealCardProps {
  meal: Meal;
  onDelete: (id: number) => void;
  onEdit: (meal: Meal) => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  onDelete,
  onEdit,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (confirmDelete) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#1f1212",
          padding: "12px 14px",
          borderRadius: 14,
          marginBottom: 10,
          border: "1px solid #f0444440",
          animation: "fadeIn 0.15s ease-out",
        }}
      >
        <span style={{ flex: 1, fontSize: 13, color: P.text }}>
          Supprimer{" "}
          <span style={{ fontWeight: "bold", color: "#f08080" }}>
            {meal.name}
          </span>{" "}
          ?
        </span>
        <button
          onClick={() => setConfirmDelete(false)}
          style={{
            background: "none",
            border: `1px solid ${P.border}`,
            borderRadius: 7,
            padding: "5px 10px",
            color: P.muted,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Annuler
        </button>
        <button
          onClick={() => onDelete(meal.id)}
          style={{
            background: "#f04444",
            border: "none",
            borderRadius: 7,
            padding: "5px 12px",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 12,
          }}
        >
          Supprimer
        </button>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: hovered ? P.cardHover : P.card,
        padding: "12px 14px",
        borderRadius: 14,
        marginBottom: 10,
        border: `1px solid ${hovered ? "#3a3a48" : P.border}`,
        transition: "background 0.15s, border-color 0.15s",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      {meal.image_url && (
        <img
          src={meal.image_url}
          alt={meal.name}
          style={{
            width: 46,
            height: 46,
            borderRadius: 9,
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: "bold",
            marginBottom: 3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {meal.name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: P.muted,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: P.accent }}>🔥 {meal.calories} kcal</span>
          <span style={{ color: "#60d4f0" }}>💪 {meal.proteines}g</span>
          <span style={{ color: "#f0c060" }}>🌾 {meal.glucides}g</span>
          <span style={{ color: "#f060a8" }}>🫙 {meal.lipides}g</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => onEdit(meal)}
          title="Modifier"
          style={{
            background: "none",
            border: `1px solid ${P.border}`,
            borderRadius: 7,
            padding: "5px 9px",
            color: P.muted,
            cursor: "pointer",
            fontSize: 13,
            transition: "color 0.15s, border-color 0.15s",
          }}
        >
          ✎
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          title="Supprimer"
          style={{
            background: "none",
            border: "none",
            color: "#666",
            cursor: "pointer",
            fontSize: 16,
            padding: "5px 7px",
            transition: "color 0.15s",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
