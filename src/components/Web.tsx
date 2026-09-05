<div 
  onClick={() => setPage("web-version")} 
  style={{
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between",
    padding: "15px 0",
    borderBottom: theme === 'dark' ? "1px solid rgba(255,255,255,0.05)" : "1px solid #f1f5f9",
    cursor: "pointer"
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
    <div style={{ 
      width: "36px", height: "36px", borderRadius: "10px", 
      background: "rgba(45, 212, 191, 0.1)", 
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#2DD4BF"
    }}>
      <Monitor size={20} />
    </div>
    <div>
      <div style={{ fontSize: "14px", fontWeight: "600", color: theme === 'dark' ? "white" : "#1e293b" }}>PC Web Version</div>
      <div style={{ fontSize: "11px", color: "#94a3b8" }}>Use on Desktop & Laptop</div>
    </div>
  </div>
  <ChevronRight size={16} color="#94a3b8" />
</div>