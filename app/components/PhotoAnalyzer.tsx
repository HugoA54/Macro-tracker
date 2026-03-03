"use client";

import React, { useState, useRef } from "react";
import { AnalysisResult } from "../types";

const P = {
  bg: "#0f0f12",
  card: "#16161c",
  border: "#2a2a35",
  accent: "#c8f060",
  text: "#f0f0f0",
  muted: "#7a7a90",
};

const MACRO_REVIEW = [
  { key: "calories" as const, label: "Calories", unit: "kcal", color: "#c8f060" },
  { key: "proteines" as const, label: "Protéines", unit: "g", color: "#60d4f0" },
  { key: "glucides" as const, label: "Glucides", unit: "g", color: "#f0c060" },
  { key: "lipides" as const, label: "Lipides", unit: "g", color: "#f060a8" },
] as const;

type Step = "idle" | "preview" | "analyzing" | "review";

interface PhotoAnalyzerProps {
  onConfirm: (result: AnalysisResult) => Promise<void>;
}

export const PhotoAnalyzer: React.FC<PhotoAnalyzerProps> = ({ onConfirm }) => {
  const [step, setStep] = useState<Step>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      setPreview(res);
      setImageB64(res.split(",")[1]);
      setStep("preview");
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const analyze = async () => {
    if (!imageB64) return;
    setStep("analyzing");
    setErrorMsg(null);
    try {
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageB64, notes }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erreur Serveur");
      }
      const parsed: AnalysisResult = await response.json();
      setResult(parsed);
      setStep("review");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur d'analyse";
      setErrorMsg(msg);
      setStep("preview");
    }
  };

  const confirm = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await onConfirm(result);
      reset();
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setStep("idle");
    setPreview(null);
    setImageB64(null);
    setNotes("");
    setResult(null);
    setErrorMsg(null);
  };

  const cardStyle: React.CSSProperties = {
    background: P.card,
    border: `1px solid ${P.border}`,
    borderRadius: 20,
    padding: 20,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: 10,
    background: P.bg,
    color: P.text,
    border: `1px solid ${P.border}`,
    fontSize: 14,
    fontFamily: "inherit",
    resize: "none",
    boxSizing: "border-box",
    outline: "none",
  };

  /* ── IDLE ─────────────────────────────────────────────── */
  if (step === "idle") {
    return (
      <div style={cardStyle}>
        <input
          type="file"
          ref={fileRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleFile}
        />
        <input
          type="file"
          ref={cameraRef}
          style={{ display: "none" }}
          accept="image/*"
          capture="environment"
          onChange={handleFile}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => cameraRef.current?.click()}
            style={{
              flex: 1,
              padding: 18,
              borderRadius: 12,
              border: `1.5px dashed ${P.accent}`,
              background: `${P.accent}0d`,
              color: P.accent,
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "inherit",
              transition: "background 0.2s",
            }}
          >
            📸 Appareil photo
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              flex: 1,
              padding: 18,
              borderRadius: 12,
              border: `1.5px dashed ${P.border}`,
              background: "transparent",
              color: P.muted,
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "inherit",
              transition: "background 0.2s",
            }}
          >
            🖼️ Galerie
          </button>
        </div>
      </div>
    );
  }

  /* ── PREVIEW ─────────────────────────────────────────── */
  if (step === "preview") {
    return (
      <div style={cardStyle}>
        <img
          src={preview!}
          alt="Aperçu du repas"
          style={{
            width: "100%",
            borderRadius: 12,
            marginBottom: 12,
            maxHeight: 200,
            objectFit: "cover",
          }}
        />
        {errorMsg && (
          <div
            style={{
              background: "#f0444415",
              border: "1px solid #f0444440",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 12,
              color: "#f08080",
              marginBottom: 12,
            }}
          >
            ⚠ {errorMsg}
          </div>
        )}
        <textarea
          placeholder="Détails facultatifs : huile d'olive, grande portion, sans sauce..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={inputStyle}
          rows={2}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button
            onClick={reset}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 10,
              background: "transparent",
              color: P.muted,
              border: `1px solid ${P.border}`,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Annuler
          </button>
          <button
            onClick={analyze}
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
            }}
          >
            🤖 Analyser avec l'IA
          </button>
        </div>
      </div>
    );
  }

  /* ── ANALYZING ───────────────────────────────────────── */
  if (step === "analyzing") {
    return (
      <div style={{ ...cardStyle, textAlign: "center", padding: "40px 20px" }}>
        <div
          style={{
            fontSize: 36,
            marginBottom: 14,
            display: "inline-block",
            animation: "spin 1.2s linear infinite",
          }}
        >
          🤖
        </div>
        <div style={{ color: P.text, fontSize: 15, fontWeight: "bold", marginBottom: 4 }}>
          Analyse en cours...
        </div>
        <div style={{ color: P.muted, fontSize: 12 }}>
          Gemini scanne ton repas et calcule les macros
        </div>
      </div>
    );
  }

  /* ── REVIEW ──────────────────────────────────────────── */
  return (
    <div style={{ ...cardStyle, animation: "fadeIn 0.25s ease-out" }}>
      {/* Header with image + name */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {preview && (
          <img
            src={preview}
            alt="Repas"
            style={{
              width: 62,
              height: 62,
              borderRadius: 10,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              color: P.muted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 5,
            }}
          >
            Nom du repas
          </div>
          <input
            value={result?.name ?? ""}
            onChange={(e) =>
              setResult((r) => (r ? { ...r, name: e.target.value } : r))
            }
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${P.border}`,
              background: P.bg,
              color: P.text,
              fontSize: 14,
              boxSizing: "border-box",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      {/* Macro cards — editable */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {MACRO_REVIEW.map((f) => (
          <div
            key={f.key}
            style={{
              background: P.bg,
              borderRadius: 10,
              padding: "10px 12px",
              border: `1px solid ${P.border}`,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: f.color,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 4,
              }}
            >
              {f.label}
            </div>
            <div
              style={{ display: "flex", alignItems: "baseline", gap: 3 }}
            >
              <input
                type="number"
                min={0}
                value={result?.[f.key] ?? 0}
                onChange={(e) =>
                  setResult((r) =>
                    r ? { ...r, [f.key]: Number(e.target.value) } : r
                  )
                }
                style={{
                  width: "70%",
                  background: "none",
                  border: "none",
                  color: P.text,
                  fontSize: 22,
                  fontWeight: "bold",
                  outline: "none",
                  padding: 0,
                  fontFamily: "inherit",
                  fontVariantNumeric: "tabular-nums",
                }}
              />
              <span style={{ fontSize: 11, color: P.muted }}>{f.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: P.muted, marginBottom: 14, textAlign: "center" }}>
        Valeurs estimées par l'IA — modifie si besoin
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => setStep("preview")}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 10,
            background: "transparent",
            color: P.muted,
            border: `1px solid ${P.border}`,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ← Reprendre
        </button>
        <button
          onClick={confirm}
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
            transition: "background 0.2s",
          }}
        >
          {saving ? "Sauvegarde..." : "✓ Ajouter le repas"}
        </button>
      </div>
    </div>
  );
};
