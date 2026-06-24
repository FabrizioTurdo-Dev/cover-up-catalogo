// src/components/MultiImageUploader.jsx
import { useState, useRef } from "react";
import { supabase } from "../config/supabase";

const BUCKET = "coverUpFotos";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export default function MultiImageUploader({ images = [], onChange, disabled }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
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
    if (fileRef.current) fileRef.current.value = "";
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
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      const newImages = [...images, publicUrl];
      onChange(newImages);
    } catch (err) {
      console.error("Error subiendo imagen:", err);
      if (err.message?.includes("Bucket not found")) {
        setError("Bucket 'coverUpFotos' no encontrado. Crealo en Supabase → Storage.");
      } else if (err.message?.includes("row-level security")) {
        setError("Sin permisos para subir. Verificá las políticas del bucket.");
      } else {
        setError("Error al subir la imagen. Intenta nuevamente.");
      }
    } finally {
      setUploading(false);
    }
  }

  function handleRemove(index) {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  }

  function handleMoveUp(index) {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    onChange(newImages);
  }

  function handleMoveDown(index) {
    if (index >= images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    onChange(newImages);
  }

  function handleReorderDragStart(e, idx) {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleReorderDragOver(e) {
    e.preventDefault();
  }

  function handleReorderDrop(e, targetIdx) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) return;
    const newImages = [...images];
    const [moved] = newImages.splice(dragIdx, 1);
    newImages.splice(targetIdx, 0, moved);
    onChange(newImages);
    setDragIdx(null);
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700, color: "#666",
        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6,
      }}>
        IMÁGENES DEL PRODUCTO {images.length > 0 && `(${images.length})`}
      </label>

      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8, marginBottom: 12 }}>
          {images.map((url, idx) => (
            <div
              key={idx}
              draggable={!disabled}
              onDragStart={(e) => handleReorderDragStart(e, idx)}
              onDragOver={handleReorderDragOver}
              onDrop={(e) => handleReorderDrop(e, idx)}
              style={{
                position: "relative", borderRadius: 8, overflow: "hidden",
                border: idx === 0 ? "2px solid #1a1a1a" : "1px solid #E8E8E8",
                background: "#F9F9F9", cursor: disabled ? "default" : "grab",
              }}
            >
              <img
                src={url}
                alt={`Imagen ${idx + 1}`}
                style={{ width: "100%", height: 90, objectFit: "contain", display: "block" }}
              />
              {idx === 0 && (
                <div style={{
                  position: "absolute", top: 4, left: 4,
                  background: "#1a1a1a", color: "#fff", fontSize: 9,
                  fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                }}>
                  PRINCIPAL
                </div>
              )}
              {!disabled && (
                <div style={{ position: "absolute", top: 4, right: 4, display: "flex", gap: 2 }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemove(idx); }}
                    style={{
                      width: 20, height: 20, borderRadius: 10,
                      background: "#A32D2D", color: "#fff", border: "none",
                      cursor: "pointer", fontSize: 10, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
              {!disabled && (
                <div style={{
                  position: "absolute", bottom: 4, right: 4, display: "flex", gap: 2,
                }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleMoveUp(idx); }}
                    disabled={idx === 0}
                    style={{
                      width: 20, height: 20, borderRadius: 4,
                      background: idx === 0 ? "#E8E8E8" : "rgba(0,0,0,0.5)",
                      color: idx === 0 ? "#BBB" : "#fff", border: "none",
                      cursor: idx === 0 ? "not-allowed" : "pointer",
                      fontSize: 10, fontWeight: 700,
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleMoveDown(idx); }}
                    disabled={idx === images.length - 1}
                    style={{
                      width: 20, height: 20, borderRadius: 4,
                      background: idx === images.length - 1 ? "#E8E8E8" : "rgba(0,0,0,0.5)",
                      color: idx === images.length - 1 ? "#BBB" : "#fff", border: "none",
                      cursor: idx === images.length - 1 ? "not-allowed" : "pointer",
                      fontSize: 10, fontWeight: 700,
                    }}
                  >
                    ↓
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!disabled && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? "#1a1a1a" : "#E8E8E8"}`,
            borderRadius: 8, padding: "16px 12px", textAlign: "center",
            cursor: "pointer", background: isDragging ? "#F0F0F0" : "#FAFAFA",
            transition: "all 0.15s",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 4 }}>
            {uploading ? "⏳" : "📁"}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>
            {uploading ? "Subiendo..." : "Agregar imagen"}
          </div>
          <div style={{ fontSize: 10, color: "#BBB", marginTop: 2 }}>
            Arrastrá o hacé clic — PNG, JPG, WEBP, GIF — Máx. 5 MB
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
