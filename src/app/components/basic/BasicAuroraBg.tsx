export function BasicAuroraBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, #74b6ef, transparent 66%)', top: -40, left: -90, filter: 'blur(20px)', opacity: 0.55 }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, #e87aa6, transparent 66%)', top: 280, right: -110, filter: 'blur(24px)', opacity: 0.50 }} />
      <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, #f4cf7a, transparent 66%)', top: 560, left: -80, filter: 'blur(22px)', opacity: 0.42 }} />
      <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, #7fd8c4, transparent 66%)', bottom: 120, right: -90, filter: 'blur(24px)', opacity: 0.42 }} />
      <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, #8aa0ee, transparent 66%)', bottom: -40, left: -70, filter: 'blur(22px)', opacity: 0.40 }} />
    </div>
  );
}
