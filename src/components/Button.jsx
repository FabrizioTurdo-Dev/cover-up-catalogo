const VARIANTS = {
  primary: { background: "#1a1a1a", color: "#fff", border: "none" },
  success: { background: "#25D366", color: "#fff", border: "none" },
  danger: { background: "#E24B4A", color: "#fff", border: "none" },
  ghost: { background: "transparent", border: "1.5px solid #E8E8E8", color: "#666" },
};

export default function Button({ children, variant = "primary", ...props }) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
        cursor: "pointer", transition: "opacity 0.15s",
        ...VARIANTS[variant],
        ...props.style,
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >
      {children}
    </button>
  );
}
