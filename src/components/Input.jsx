export default function Input({ label, value, onChange, type = "text", required = false, placeholder, style: customStyle }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12, ...customStyle }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label} {required && <span style={{ color: "#E24B4A" }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        style={{
          padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E8E8E8",
          fontSize: 13, background: "#fff", outline: "none",
        }}
      />
    </div>
  );
}
