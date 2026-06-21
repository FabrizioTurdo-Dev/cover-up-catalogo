// src/components/ImageUploader.jsx
import { useState, useRef } from "react";
import { supabase } from "../config/supabase";

const BUCKET = "coverUpFotos";
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export default function ImageUploader({ value, onChange, disabled }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || "");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef(null);

  function handleDragOver(e) {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) uploadFile(file);
  }

  async function uploadFile(file) {
    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Formato no permitido. Usá PNG, JPG, WEBP o GIF.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("La imagen supera los 5 MB.");
      return;
    }

    setUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      setPreview(publicUrl);
      onChange(publicUrl);
    } catch (err) {
      console.error("Error subiendo imagen:", err);
      if (err.message?.includes("Bucket not found")) {
        setError("Bucket 'product-images' no encontrado. Crealo en Supabase → Storage.");
      } else if (err.message?.includes("new row violates row-level security")) {
        setError("Sin permisos para subir. Verificá las políticas del bucket.");
      } else {
        setError("Error al subir la imagen. Intenta nuevamente.");
      }
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setPreview("");
    onChange("");
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700, color: "#666",
        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6,
      }}>
        IMAGEN DEL PRODUCTO
      </label>

      {/* Preview */}
      {preview && (
        <div style={{
          position: "relative", marginBottom: 10, borderRadius: 8,
          overflow: "hidden", border: "1px solid #E8E8E8", background: "#F9F9F9",
        }}>
          <img
            src={preview}
            alt="Preview"
            style={{ width: "100%", height: 140, objectFit: "contain", display: "block" }}
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              style={{
                position: "absolute", top: 6, right: 6,
                width: 24, height: 24, borderRadius: 12,
                background: "#A32D2D", color: "#fff", border: "none",
                cursor: "pointer", fontSize: 12, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Drop zone */}
      {!preview && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? "#1a1a1a" : "#E8E8E8"}`,
            borderRadius: 8, padding: "24px 16px", textAlign: "center",
            cursor: disabled ? "not-allowed" : "pointer",
            background: isDragging ? "#F0F0F0" : "#FAFAFA",
            transition: "all 0.15s",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 6 }}>
            {uploading ? "⏳" : "📁"}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#666" }}>
            {uploading ? "Subiendo imagen..." : "Arrastrá una imagen acá"}
          </div>
          <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
            o hacé clic para buscar
          </div>
          <div style={{ fontSize: 10, color: "#BBB", marginTop: 8 }}>
            PNG, JPG, WEBP o GIF — Máx. 5 MB
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        style={{ display: "none" }}
      />

      {error && (
        <div style={{
          marginTop: 8, padding: "8px 10px", borderRadius: 6,
          background: "#FCE8E6", border: "1px solid #EF9A9A",
          color: "#C62828", fontSize: 12, fontWeight: 600,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
