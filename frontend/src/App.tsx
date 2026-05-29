import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

const COLORS = ["#00f5ff", "#ff003c", "#ffd700", "#00ff88"];

// ── Utility: random hex glitch string ──────────────────────────────────────
const glitch = () => Math.random().toString(16).slice(2, 6).toUpperCase();

// ── Animated counter hook ──────────────────────────────────────────────────
function useCounter(target: number, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return val;
}

// ── Scanline overlay ───────────────────────────────────────────────────────
const Scanlines = () => (
  <div style={{
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999,
    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
  }} />
);

// ── Corner brackets decoration ─────────────────────────────────────────────
const Brackets = ({ color = "#00f5ff" }: { color?: string }) => (
  <>
    {[["top:0;left:0", "border-top:1px solid; border-left:1px solid"],
      ["top:0;right:0", "border-top:1px solid; border-right:1px solid"],
      ["bottom:0;left:0", "border-bottom:1px solid; border-left:1px solid"],
      ["bottom:0;right:0", "border-bottom:1px solid; border-right:1px solid"]
    ].map(([pos], i) => (
      <div key={i} style={{
        position: "absolute", [pos.split(";")[0].split(":")[0]]: pos.split(";")[0].split(":")[1],
        [pos.split(";")[1].split(":")[0]]: pos.split(";")[1].split(":")[1],
        width: 14, height: 14,
        borderColor: color,
        borderStyle: "solid",
        borderWidth: i === 0 ? "1px 0 0 1px" : i === 1 ? "1px 1px 0 0" : i === 2 ? "0 0 1px 1px" : "0 1px 1px 0",
      }} />
    ))}
  </>
);

// ── Metric card ────────────────────────────────────────────────────────────
function MetricCard({ title, value, color, icon, sub }: { title: string; value: number; color: string; icon: string; sub?: string }) {
  const count = useCounter(value);
  const [flicker, setFlicker] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setFlicker(f => !f), 3000 + Math.random() * 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position: "relative",
      background: "linear-gradient(135deg, #080f1a 0%, #0d1a2e 100%)",
      border: `1px solid ${color}22`,
      borderRadius: 2,
      padding: "22px 20px 18px",
      overflow: "hidden",
      transition: "border-color 0.3s",
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = color + "88")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = color + "22")}
    >
      <Brackets color={color} />

      {/* Glow bar top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      {/* Background accent */}
      <div style={{
        position: "absolute", bottom: -20, right: -10,
        fontSize: 80, opacity: 0.04, lineHeight: 1, userSelect: "none",
        fontFamily: "monospace", color,
      }}>{icon}</div>

      <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#4a6080", letterSpacing: 3, marginBottom: 8, textTransform: "uppercase" }}>
        [{title}]
      </div>

      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 52,
        fontWeight: 700,
        color: flicker ? color : color + "cc",
        lineHeight: 1,
        textShadow: `0 0 20px ${color}88`,
        transition: "color 0.1s",
        letterSpacing: -1,
      }}>
        {count.toString().padStart(3, "0")}
      </div>

      {sub && <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#3a5070", marginTop: 6, letterSpacing: 2 }}>{sub}</div>}

      <div style={{ position: "absolute", bottom: 8, right: 12, fontFamily: "monospace", fontSize: 9, color: color + "44", letterSpacing: 1 }}>
        {glitch()}
      </div>
    </div>
  );
}

// ── Alert row ──────────────────────────────────────────────────────────────
function AlertRow({ event, idx }: { event: any; idx: number }) {
  const sevColor = event.severity === "HIGH" ? "#ff003c" : event.severity === "MEDIUM" ? "#ffd700" : "#00ff88";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px",
      background: "#040b14",
      border: `1px solid ${sevColor}18`,
      borderLeft: `2px solid ${sevColor}`,
      borderRadius: 2,
      animation: idx === 0 ? "slideIn 0.4s ease" : "none",
      fontFamily: "'Courier New', monospace",
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: sevColor, boxShadow: `0 0 6px ${sevColor}`, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "#c0d8f0", letterSpacing: 1 }}>{event.event_type}</div>
        <div style={{ fontSize: 9, color: "#2a4060", marginTop: 2, letterSpacing: 1 }}>{event.timestamp}</div>
      </div>
      <div style={{
        fontSize: 9, color: sevColor, letterSpacing: 2, padding: "2px 6px",
        border: `1px solid ${sevColor}44`, borderRadius: 1,
      }}>{event.severity}</div>
    </div>
  );
}

// ── Threat bar ─────────────────────────────────────────────────────────────
function ThreatMeter({ level }: { level: string }) {
  const pct = level === "HIGH" ? 85 : level === "MEDIUM" ? 50 : 15;
  const color = level === "HIGH" ? "#ff003c" : level === "MEDIUM" ? "#ffd700" : "#00ff88";
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 1000); return () => clearInterval(t); }, []);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      background: "#040b14",
      border: `1px solid ${color}33`,
      borderRadius: 2,
      padding: "10px 18px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}66, transparent)` }} />
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#4a6080", letterSpacing: 3, whiteSpace: "nowrap" }}>THREAT LVL</div>
      <div style={{ flex: 1, height: 6, background: "#0a1628", borderRadius: 1, overflow: "hidden", position: "relative" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: `linear-gradient(90deg, ${color}44, ${color})`,
          boxShadow: `0 0 10px ${color}`,
          transition: "width 1s ease",
          borderRadius: 1,
        }} />
        {/* Tick marks */}
        {[25, 50, 75].map(p => (
          <div key={p} style={{ position: "absolute", top: 0, bottom: 0, left: `${p}%`, width: 1, background: "#1a2840" }} />
        ))}
      </div>
      <div style={{
        fontFamily: "'Courier New', monospace", fontWeight: 700,
        fontSize: 14, color, letterSpacing: 3,
        textShadow: `0 0 12px ${color}`,
        animation: level === "HIGH" ? "blink 0.8s infinite" : "none",
      }}>{level}</div>
      <div style={{ fontFamily: "monospace", fontSize: 9, color: "#2a4060", letterSpacing: 1 }}>
        {tick.toString().padStart(5, "0")}s
      </div>
    </div>
  );
}

// ── Status row ─────────────────────────────────────────────────────────────
function StatusBadge({ label, ok = true }: { label: string; ok?: boolean }) {
  const [pulse, setPulse] = useState(true);
  useEffect(() => { const t = setInterval(() => setPulse(p => !p), 1200); return () => clearInterval(t); }, []);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      fontFamily: "'Courier New', monospace", fontSize: 10,
      color: ok ? "#4a8060" : "#804a4a", letterSpacing: 2,
    }}>
      <div style={{
        width: 7, height: 7, borderRadius: "50%",
        background: ok ? "#00ff88" : "#ff003c",
        boxShadow: pulse ? `0 0 8px ${ok ? "#00ff88" : "#ff003c"}` : "none",
        transition: "box-shadow 0.4s",
        flexShrink: 0,
      }} />
      {label}
    </div>
  );
}

// ── Custom tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#040b14", border: "1px solid #00f5ff33",
      padding: "8px 14px", fontFamily: "'Courier New', monospace",
      fontSize: 11, color: "#00f5ff",
    }}>
      <div style={{ color: "#4a6080", marginBottom: 2 }}>{payload[0].name}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{payload[0].value}</div>
    </div>
  );
};

// ── Main App ───────────────────────────────────────────────────────────────
function App() {
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [time, setTime] = useState(new Date());
  const [glitchHeader, setGlitchHeader] = useState(false);

  useEffect(() => {
    loadDashboard(); loadEvents();
    const poll = setInterval(() => { loadDashboard(); loadEvents(); }, 5000);
    const clock = setInterval(() => setTime(new Date()), 1000);
    const glitchT = setInterval(() => {
      setGlitchHeader(true);
      setTimeout(() => setGlitchHeader(false), 150);
    }, 7000);
    return () => { clearInterval(poll); clearInterval(clock); clearInterval(glitchT); };
  }, []);

  const loadDashboard = async () => {
    try { const r = await axios.get("http://127.0.0.1:8000/dashboard"); setStats(r.data); }
    catch { /* keep last state */ }
  };
  const loadEvents = async () => {
    try { const r = await axios.get("http://127.0.0.1:8000/recent-events"); setEvents(r.data); }
    catch { /* keep last state */ }
  };
  const downloadReport = () => window.open("http://127.0.0.1:8000/generate-report", "_blank");

  const threatLevel = !stats ? "LOW" : stats.high_risk_events > 50 ? "HIGH" : stats.high_risk_events > 20 ? "MEDIUM" : "LOW";

  const pieData = stats ? [
    { name: "Intrusions", value: stats.zone_intrusions },
    { name: "Loitering",  value: stats.loitering_events },
    { name: "High Risk",  value: stats.high_risk_events },
  ] : [];

  const radarData = stats ? [
    { subject: "Intrusion", A: stats.zone_intrusions },
    { subject: "Loitering", A: stats.loitering_events },
    { subject: "High Risk", A: stats.high_risk_events },
    { subject: "Total",     A: stats.total_events / 4 },
  ] : [];

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #020912;
          color: #c0d8f0;
          font-family: 'Share Tech Mono', monospace;
        }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideIn { from{transform:translateX(-10px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes gridMove { from{background-position:0 0} to{background-position:0 40px} }
        @keyframes scanH { 0%{top:-4px} 100%{top:100%} }
        @keyframes glitch {
          0%{clip-path:inset(0 0 95% 0);transform:translate(-3px,0)}
          10%{clip-path:inset(30% 0 50% 0);transform:translate(3px,0)}
          20%{clip-path:inset(70% 0 10% 0);transform:translate(-2px,0)}
          30%{clip-path:inset(10% 0 80% 0);transform:translate(2px,0)}
          40%{clip-path:inset(60% 0 20% 0);transform:translate(0,0)}
          50%,100%{clip-path:inset(0 0 0 0);transform:translate(0,0)}
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #020912; }
        ::-webkit-scrollbar-thumb { background: #00f5ff33; border-radius: 2px; }

        .panel {
          position: relative;
          background: linear-gradient(135deg, #080f1a 0%, #0a1424 100%);
          border: 1px solid #00f5ff18;
          border-radius: 2px;
          overflow: hidden;
        }

        .panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #00f5ff55, transparent);
        }

        .panel-title {
          font-family: 'Orbitron', monospace;
          font-size: 10px;
          letter-spacing: 4px;
          color: #2a6080;
          text-transform: uppercase;
          padding: 14px 18px 0;
        }

        .grid-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(0,245,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: gridMove 8s linear infinite;
        }

        .btn-primary {
          background: transparent;
          border: 1px solid #00f5ff55;
          color: #00f5ff;
          padding: 9px 20px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 3px;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content:'';
          position:absolute;inset:0;
          background: #00f5ff;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.2s;
          z-index: -1;
        }
        .btn-primary:hover { color: #020912; border-color: #00f5ff; }
        .btn-primary:hover::after { transform: scaleX(1); }
      `}</style>

      <Scanlines />
      <div className="grid-bg" />

      {/* Horizontal scan line */}
      <div style={{
        position: "fixed", left: 0, right: 0, height: 3, zIndex: 9998,
        background: "linear-gradient(90deg, transparent, #00f5ff22, transparent)",
        animation: "scanH 6s linear infinite",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, padding: "28px 32px", maxWidth: 1600, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              {/* Rotating ring */}
              <div style={{ width: 32, height: 32, position: "relative", flexShrink: 0 }}>
                <div style={{
                  position: "absolute", inset: 0, border: "1px solid #00f5ff44",
                  borderTop: "1px solid #00f5ff", borderRadius: "50%",
                  animation: "spin 2s linear infinite",
                }} />
                <div style={{
                  position: "absolute", inset: 4, background: "#00f5ff",
                  borderRadius: "50%", opacity: 0.8,
                }} />
              </div>
              <div>
                <h1 style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: glitchHeader ? 28 : 30,
                  fontWeight: 900,
                  color: "#00f5ff",
                  letterSpacing: 6,
                  textShadow: "0 0 30px #00f5ff88",
                  animation: glitchHeader ? "glitch 0.15s steps(2) forwards" : "none",
                  lineHeight: 1,
                }}>
                  SENTINEL//AI
                </h1>
                <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: "#2a6080", letterSpacing: 4, marginTop: 4 }}>
                  SURVEILLANCE COMMAND & CONTROL SYSTEM v4.2.1
                </div>
              </div>
            </div>
          </div>

          {/* Clock + controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 22, color: "#00f5ff", letterSpacing: 4 }}>
                {pad(time.getHours())}:{pad(time.getMinutes())}:{pad(time.getSeconds())}
              </div>
              <div style={{ fontSize: 9, color: "#2a4060", letterSpacing: 3, marginTop: 2 }}>
                {time.toDateString().toUpperCase()}
              </div>
            </div>
            <button className="btn-primary" onClick={downloadReport}>
              ▣ EXPORT REPORT
            </button>
          </div>
        </div>

        {/* ── Threat bar ── */}
        <div style={{ marginBottom: 20 }}>
          <ThreatMeter level={threatLevel} />
        </div>

        {/* ── Metric cards ── */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
            <MetricCard title="Total Events"     value={stats.total_events}     color="#00f5ff" icon="◉" sub="ALL INCIDENT TYPES" />
            <MetricCard title="Zone Intrusions"  value={stats.zone_intrusions}  color="#ff003c" icon="⚠" sub="PERIMETER BREACHES" />
            <MetricCard title="Loitering Alerts" value={stats.loitering_events} color="#ffd700" icon="◈" sub="SUSTAINED PRESENCE" />
            <MetricCard title="High Risk"        value={stats.high_risk_events} color="#00ff88" icon="⬡" sub="PRIORITY THREATS" />
          </div>
        )}

        {/* ── Main grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 12, marginBottom: 12 }}>

          {/* Left: charts */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Pie + Radar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="panel" style={{ padding: 18 }}>
                <div className="panel-title" style={{ marginBottom: 12 }}>Threat Distribution</div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" outerRadius={90} innerRadius={40}
                      strokeWidth={0} paddingAngle={4}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} opacity={0.85} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(v) => <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: "#4a7090", letterSpacing: 2 }}>{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="panel" style={{ padding: 18 }}>
                <div className="panel-title" style={{ marginBottom: 12 }}>Threat Radar</div>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#0a2040" />
                    <PolarAngleAxis dataKey="subject"
                      tick={{ fontFamily: "'Share Tech Mono'", fontSize: 9, fill: "#2a6080", letterSpacing: 2 }} />
                    <Radar dataKey="A" stroke="#00f5ff" fill="#00f5ff" fillOpacity={0.12} strokeWidth={1.5} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live feed */}
            <div className="panel" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div className="panel-title" style={{ padding: 0 }}>Live Surveillance Feed</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff003c", animation: "blink 1s infinite" }} />
                  <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: "#ff003c", letterSpacing: 3 }}>REC</span>
                </div>
              </div>
              <div style={{ position: "relative", borderRadius: 2, overflow: "hidden", border: "1px solid #00f5ff18" }}>
                <img
                  src="http://127.0.0.1:8000/video-feed"
                  alt="Live Feed"
                  style={{ width: "100%", display: "block", filter: "brightness(0.95) contrast(1.05)" }}
                />
                {/* Feed overlay */}
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "linear-gradient(180deg, rgba(0,245,255,0.04) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.3) 100%)",
                }} />
                <div style={{
                  position: "absolute", top: 8, left: 10,
                  fontFamily: "'Share Tech Mono'", fontSize: 9, color: "#00f5ff88", letterSpacing: 2,
                }}>CAM-01 // SECTOR A</div>
                <div style={{
                  position: "absolute", top: 8, right: 10,
                  fontFamily: "'Share Tech Mono'", fontSize: 9, color: "#ff003c88", letterSpacing: 2,
                }}>● LIVE</div>
              </div>
            </div>
          </div>

          {/* Right: alerts + status */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Alerts */}
            <div className="panel" style={{ padding: 18, flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div className="panel-title" style={{ padding: 0 }}>Recent Alerts</div>
                <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: "#2a4060", letterSpacing: 2 }}>
                  {events.length} EVENTS
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 360, overflowY: "auto" }}>
                {events.length === 0
                  ? <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: "#2a4060", letterSpacing: 2, padding: "20px 0", textAlign: "center" }}>
                      NO ACTIVE ALERTS
                    </div>
                  : events.map((ev, i) => <AlertRow key={i} event={ev} idx={i} />)
                }
              </div>
            </div>

            {/* System status */}
            <div className="panel" style={{ padding: 18 }}>
              <div className="panel-title" style={{ marginBottom: 16, padding: 0 }}>System Status</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <StatusBadge label="CAMERA FEED ACTIVE" ok />
                <StatusBadge label="YOLO DETECTION ENGINE" ok />
                <StatusBadge label="FACE RECOGNITION ONLINE" ok />
                <StatusBadge label="PERIMETER SENSORS" ok />
              </div>
              <div style={{
                marginTop: 16, paddingTop: 14,
                borderTop: "1px solid #0a2040",
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}>
                {[["CPU", "34%"], ["MEM", "61%"], ["GPU", "78%"], ["NET", "12ms"]].map(([k, v]) => (
                  <div key={k} style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: "#2a4060", letterSpacing: 2 }}>
                    {k} <span style={{ color: "#4a8090" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Session info */}
            <div className="panel" style={{ padding: 14 }}>
              <div style={{
                fontFamily: "'Share Tech Mono'", fontSize: 9, color: "#1a3050", letterSpacing: 2,
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6,
              }}>
                <div>SESSION <span style={{ color: "#2a5070" }}>A7F3-9C21</span></div>
                <div>NODE <span style={{ color: "#2a5070" }}>OMEGA-04</span></div>
                <div>UPTIME <span style={{ color: "#2a5070" }}>04:21:07</span></div>
                <div>VERSION <span style={{ color: "#2a5070" }}>4.2.1</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTop: "1px solid #0a2040", paddingTop: 14,
          fontFamily: "'Share Tech Mono'", fontSize: 9, color: "#1a3050", letterSpacing: 2,
        }}>
          <div>SENTINEL//AI — AUTHORIZED PERSONNEL ONLY</div>
          <div>ENCRYPTION: AES-256 // TLS 1.3</div>
          <div>© 2026 Amar Sinha</div>
        </div>
      </div>
    </>
  );
}

export default App;
