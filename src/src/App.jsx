import { useState, useEffect } from "react";

const EXERCISES = [
  "ベンチプレス","インクラインベンチプレス","デクラインベンチプレス","ダンベルフライ","ケーブルクロスオーバー","ペックデック","ディップス",
  "スクワット","フロントスクワット","レッグプレス","レッグカール","レッグエクステンション","カーフレイズ","ブルガリアンスクワット","ルーマニアンデッドリフト",
  "デッドリフト","スモウデッドリフト","ラックプル",
  "ショルダープレス","アーノルドプレス","サイドレイズ","フロントレイズ","リアデルトフライ","フェイスプル","アップライトロウ","シュラッグ",
  "ラットプルダウン","チンニング","ベントオーバーロウ","シーテッドロウ","ワンアームロウ","Tバーロウ",
  "バーベルカール","ダンベルカール","ハンマーカール","インクラインカール",
  "トライセプスプレスダウン","スカルクラッシャー","ナロープレス","オーバーヘッドエクステンション",
  "ヒップスラスト","クランチ","プランク","レッグレイズ","ロシアンツイスト"
];

const TYPE_CONFIG = {
  normal: { label: "NORMAL SET", icon: "◆", color: "#4CAF50", bg: "#071207", border: "#1a3a1a" },
  dropset: { label: "DROP SET", icon: "▼", color: "#FF9500", bg: "#130c02", border: "#3a2500" },
  superset: { label: "SUPER SET", icon: "✕", color: "#60A5FA", bg: "#02080f", border: "#0a2040" },
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+JP:wght@400;500;700;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { background: #050505 !important; min-height: 100vh; }
  body { font-family: 'Noto Sans JP', -apple-system, sans-serif; color: #fff; }
  input[type=number] { -moz-appearance: textfield; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
  select option { background: #1a1a1a; color: #fff; }
  .slide-up { animation: slideUp .28s cubic-bezier(.32,1.1,.55,1) both; }
  @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: none; opacity: 1; } }
  .fade-in { animation: fadeIn .18s ease both; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
`;

/* ─── SMALL PRIMITIVES ─── */

function Badge({ type }) {
  const { label, color, bg, border } = TYPE_CONFIG[type] || TYPE_CONFIG.normal;
  return (
    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600, letterSpacing: "1.5px",
      padding: "2px 8px", borderRadius: 4, background: bg, color, border: `1px solid ${border}`, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "1.5px",
    textTransform: "uppercase", color: "#444", marginBottom: 5 }}>{children}</div>;
}

function NumInput({ label, value, onChange, unit, step = "0.5" }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ position: "relative" }}>
        <input type="number" value={value} onChange={e => onChange(e.target.value)}
          min="0" step={step}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width: "100%", background: "#161616", border: `1.5px solid ${focused ? "#FF3B30" : "#222"}`,
            borderRadius: 8, color: "#fff", fontFamily: "'IBM Plex Mono', monospace", fontSize: 18,
            fontWeight: 600, padding: "9px 36px 9px 12px", outline: "none", transition: "border-color .15s" }} />
        {unit && <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
          color: "#444", fontSize: 11, fontFamily: "monospace" }}>{unit}</span>}
      </div>
    </div>
  );
}

function AssistCheck({ value, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 0" }}>
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)}
        style={{ width: 17, height: 17, accentColor: "#FF3B30", cursor: "pointer" }} />
      <span style={{ fontSize: 12, color: "#666", fontFamily: "monospace", letterSpacing: "0.5px" }}>補助あり</span>
    </label>
  );
}

function ExSelect({ label, value, onChange, exclude = [] }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: "100%", background: "#161616", border: `1.5px solid ${focused ? "#FF3B30" : "#222"}`,
          borderRadius: 8, color: value ? "#fff" : "#555", fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 14, padding: "11px 36px 11px 12px", outline: "none", appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%23555' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
          transition: "border-color .15s", cursor: "pointer" }}>
        <option value="">種目を選択...</option>
        {EXERCISES.filter(e => !exclude.includes(e)).map(e => <option key={e} value={e}>{e}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", fullWidth = false, disabled = false, style: sx = {} }) {
  const [hov, setHov] = useState(false);
  const base = { borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 600, fontSize: 13, letterSpacing: "0.5px", padding: "12px 18px", border: "none",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .15s",
    width: fullWidth ? "100%" : "auto", opacity: disabled ? 0.4 : 1, ...sx };
  const vars = {
    primary: { background: hov ? "#e83328" : "#FF3B30", color: "#fff" },
    secondary: { background: hov ? "#1e1e1e" : "#161616", color: "#ccc", border: "1.5px solid #2a2a2a" },
    ghost: { background: "transparent", color: hov ? "#aaa" : "#555", border: "1.5px solid #222" },
    danger: { background: hov ? "#9a1f1a" : "#7a1a16", color: "#FF6B6B", border: "1.5px solid #3a1010" },
  };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...vars[variant] }}
    onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</button>;
}

function Divider({ label, color = "#FF9500" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0" }}>
      <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color, letterSpacing: "2px", fontWeight: 600 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
    </div>
  );
}

/* ─── SET FORMS ─── */

function NormalSetForm({ value, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <NumInput label="重量" value={value.kg} onChange={v => onChange({ ...value, kg: v })} unit="kg" step="0.5" />
      <NumInput label="レップ数" value={value.reps} onChange={v => onChange({ ...value, reps: v })} unit="rep" step="1" />
      <div style={{ gridColumn: "1/-1" }}>
        <AssistCheck value={value.assisted} onChange={v => onChange({ ...value, assisted: v })} />
      </div>
    </div>
  );
}

function DropSetForm({ value, onChange }) {
  const u1 = (f, v) => onChange({ ...value, drop1: { ...value.drop1, [f]: v } });
  const u2 = (f, v) => onChange({ ...value, drop2: { ...value.drop2, [f]: v } });
  return (
    <div>
      <Divider label="DROP 1" color="#FF9500" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <NumInput label="重量" value={value.drop1.kg} onChange={v => u1("kg", v)} unit="kg" />
        <NumInput label="レップ数" value={value.drop1.reps} onChange={v => u1("reps", v)} unit="rep" step="1" />
        <div style={{ gridColumn: "1/-1" }}><AssistCheck value={value.drop1.assisted} onChange={v => u1("assisted", v)} /></div>
      </div>
      <Divider label="DROP 2" color="#FF9500" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <NumInput label="重量" value={value.drop2.kg} onChange={v => u2("kg", v)} unit="kg" />
        <NumInput label="レップ数" value={value.drop2.reps} onChange={v => u2("reps", v)} unit="rep" step="1" />
        <div style={{ gridColumn: "1/-1" }}><AssistCheck value={value.drop2.assisted} onChange={v => u2("assisted", v)} /></div>
      </div>
    </div>
  );
}

function SuperSetForm({ value, onChange, ex1Name, ex2Name }) {
  const u1 = (f, v) => onChange({ ...value, ex1: { ...value.ex1, [f]: v } });
  const u2 = (f, v) => onChange({ ...value, ex2: { ...value.ex2, [f]: v } });
  return (
    <div>
      <Divider label={ex1Name || "EXERCISE 1"} color="#60A5FA" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <NumInput label="重量" value={value.ex1.kg} onChange={v => u1("kg", v)} unit="kg" />
        <NumInput label="レップ数" value={value.ex1.reps} onChange={v => u1("reps", v)} unit="rep" step="1" />
        <div style={{ gridColumn: "1/-1" }}><AssistCheck value={value.ex1.assisted} onChange={v => u1("assisted", v)} /></div>
      </div>
      <Divider label={ex2Name || "EXERCISE 2"} color="#60A5FA" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <NumInput label="重量" value={value.ex2.kg} onChange={v => u2("kg", v)} unit="kg" />
        <NumInput label="レップ数" value={value.ex2.reps} onChange={v => u2("reps", v)} unit="rep" step="1" />
        <div style={{ gridColumn: "1/-1" }}><AssistCheck value={value.ex2.assisted} onChange={v => u2("assisted", v)} /></div>
      </div>
    </div>
  );
}

/* ─── SET DISPLAY ─── */

function DataRow({ data, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {label && <span style={{ fontFamily: "monospace", fontSize: 9, color: "#555", letterSpacing: "1px", minWidth: 28 }}>{label}</span>}
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 15, color: "#fff" }}>{data.kg || "—"}</span>
      <span style={{ fontFamily: "monospace", fontSize: 10, color: "#444" }}>kg</span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 15, color: "#fff", marginLeft: 4 }}>{data.reps || "—"}</span>
      <span style={{ fontFamily: "monospace", fontSize: 10, color: "#444" }}>rep</span>
      {data.assisted && <span style={{ fontSize: 9, color: "#FF3B30", background: "#180808", border: "1px solid #3a1010",
        padding: "1px 6px", borderRadius: 3, fontFamily: "monospace", marginLeft: 4 }}>補助</span>}
    </div>
  );
}

function SetRow({ set, type, index }) {
  return (
    <div className="fade-in" style={{ display: "flex", gap: 12, alignItems: "flex-start",
      padding: "9px 0", borderBottom: "1px solid #111" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: "#FF3B30",
        lineHeight: 1, minWidth: 30, paddingTop: 2 }}>{set.setNumber}</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        {type === "normal" && <DataRow data={set} />}
        {type === "dropset" && <>
          <DataRow data={set.drop1} label="DROP1" />
          <DataRow data={set.drop2} label="DROP2" />
        </>}
        {type === "superset" && <>
          <DataRow data={set.ex1} label="EX1" />
          <DataRow data={set.ex2} label="EX2" />
        </>}
      </div>
    </div>
  );
}

/* ─── EXERCISE CARD ─── */

function ExerciseCard({ exercise, onAddSet }) {
  const { color } = TYPE_CONFIG[exercise.type] || TYPE_CONFIG.normal;
  const name = exercise.type === "superset"
    ? `${exercise.exercise1} & ${exercise.exercise2}`
    : exercise.exercise;
  return (
    <div className="fade-in" style={{ background: "#0e0e0e", border: "1px solid #1a1a1a",
      borderRadius: 14, padding: "14px 14px 12px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ marginBottom: 7 }}><Badge type={exercise.type} /></div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f0", lineHeight: 1.3 }}>{name}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color, lineHeight: 1 }}>
            {exercise.sets.length}
          </span>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "#333", letterSpacing: "1px" }}>SETS</div>
        </div>
      </div>
      {exercise.sets.length > 0 && (
        <div style={{ marginBottom: onAddSet ? 10 : 0 }}>
          {exercise.sets.map((s, i) => <SetRow key={i} set={s} type={exercise.type} index={i} />)}
        </div>
      )}
      {onAddSet && (
        <button onClick={onAddSet} style={{ width: "100%", background: "transparent",
          border: `1px dashed ${color}33`, borderRadius: 8, padding: "9px",
          color, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600,
          cursor: "pointer", letterSpacing: "1px" }}>
          + SET を追加
        </button>
      )}
    </div>
  );
}

/* ─── MODALS ─── */

function Sheet({ onClose, children }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="slide-up" style={{ background: "#0e0e0e", borderTop: "1px solid #222",
        borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480,
        padding: "16px 18px 32px", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: "#2a2a2a", borderRadius: 2, margin: "0 auto 20px" }} />
        {children}
      </div>
    </div>
  );
}

function AddExModal({ onAdd, onClose }) {
  const [type, setType] = useState("normal");
  const [ex1, setEx1] = useState("");
  const [ex2, setEx2] = useState("");
  const valid = ex1 && (type !== "superset" || ex2);

  const confirm = () => {
    if (!valid) return;
    onAdd({ id: Date.now(), type,
      exercise: type !== "superset" ? ex1 : undefined,
      exercise1: type === "superset" ? ex1 : undefined,
      exercise2: type === "superset" ? ex2 : undefined,
      sets: [] });
    onClose();
  };

  return (
    <Sheet onClose={onClose}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: "2px", marginBottom: 18 }}>
        種目を追加
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        {Object.entries(TYPE_CONFIG).map(([k, { label, icon, color, bg, border }]) => {
          const active = type === k;
          return (
            <button key={k} onClick={() => setType(k)} style={{
              background: active ? bg : "#080808", border: `1.5px solid ${active ? border : "#1a1a1a"}`,
              borderRadius: 12, padding: "13px 6px", cursor: "pointer", transition: "all .15s", textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 5, color: active ? color : "#333" }}>{icon}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 700,
                color: active ? color : "#444", letterSpacing: "1px",
                whiteSpace: type === "superset" && k === "superset" ? "nowrap" : "normal" }}>
                {label}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        <ExSelect label={type === "superset" ? "種目 1" : "種目"} value={ex1} onChange={setEx1} exclude={[ex2]} />
        {type === "superset" && <ExSelect label="種目 2" value={ex2} onChange={setEx2} exclude={[ex1]} />}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose}>キャンセル</Btn>
        <Btn variant="primary" onClick={confirm} disabled={!valid}>追加する</Btn>
      </div>
    </Sheet>
  );
}

function AddSetModal({ exercise, onAdd, onClose }) {
  const setNum = exercise.sets.length + 1;
  const initNormal = { kg: "", reps: "", assisted: false };
  const [val, setVal] = useState(
    exercise.type === "normal" ? initNormal :
    exercise.type === "dropset" ? { drop1: { ...initNormal }, drop2: { ...initNormal } } :
    { ex1: { ...initNormal }, ex2: { ...initNormal } }
  );

  const displayName = exercise.type === "superset"
    ? `${exercise.exercise1} & ${exercise.exercise2}`
    : exercise.exercise;

  return (
    <Sheet onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Badge type={exercise.type} />
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#FF3B30", letterSpacing: "1px" }}>
          SET {setNum}
        </span>
      </div>
      <div style={{ fontSize: 13, color: "#555", marginBottom: 18, fontWeight: 500 }}>{displayName}</div>

      {exercise.type === "normal" && <NormalSetForm value={val} onChange={setVal} />}
      {exercise.type === "dropset" && <DropSetForm value={val} onChange={setVal} />}
      {exercise.type === "superset" && (
        <SuperSetForm value={val} onChange={setVal}
          ex1Name={exercise.exercise1} ex2Name={exercise.exercise2} />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
        <Btn variant="ghost" onClick={onClose}>キャンセル</Btn>
        <Btn variant="primary" onClick={() => { onAdd({ ...val, setNumber: setNum }); onClose(); }}>記録する</Btn>
      </div>
    </Sheet>
  );
}

/* ─── SCREENS ─── */

function HomeScreen({ workouts, onStart, onView }) {
  const fmt = (iso) => {
    const d = new Date(iso);
    const days = ["日","月","火","水","木","金","土"];
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")} (${days[d.getDay()]}) ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050505" }}>
      {/* Header */}
      <div style={{ padding: "32px 20px 20px", borderBottom: "1px solid #0d0d0d" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: "4px", lineHeight: 1 }}>
          MUSCLE <span style={{ color: "#FF3B30" }}>YAMATO</span>
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#333", letterSpacing: "3px", marginTop: 3 }}>
          筋トレ記録アプリ
        </div>
      </div>

      {/* Start Button */}
      <div style={{ padding: "20px 20px 16px" }}>
        <button onClick={onStart} style={{
          width: "100%", background: "#FF3B30", border: "none", borderRadius: 14,
          padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 10, transition: "background .15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#e83328"}
          onMouseLeave={e => e.currentTarget.style.background = "#FF3B30"}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#fff", letterSpacing: "3px" }}>
            ⚡  ワークアウト開始
          </span>
        </button>
      </div>

      {/* History */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#2a2a2a",
          letterSpacing: "2px", marginBottom: 12, paddingTop: 4 }}>
          HISTORY — {workouts.length} SESSIONS
        </div>

        {workouts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "#222",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: "1px" }}>
            まだ記録がありません<br />
            <span style={{ color: "#1a1a1a", fontSize: 10 }}>最初のワークアウトを始めよう</span>
          </div>
        ) : (
          workouts.map(w => {
            const totalSets = w.exercises.reduce((s, e) => s + e.sets.length, 0);
            const types = [...new Set(w.exercises.map(e => e.type))];
            return (
              <div key={w.id} onClick={() => onView(w)}
                style={{ background: "#0d0d0d", border: "1px solid #151515", borderRadius: 12,
                  padding: "14px", marginBottom: 8, cursor: "pointer", transition: "border-color .15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#2a2a2a"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#151515"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 5,
                      fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.5px" }}>{fmt(w.date)}</div>
                    <div style={{ fontSize: 12, color: "#3a3a3a", fontFamily: "monospace", marginBottom: 8 }}>
                      {w.exercises.length} 種目 · {totalSets} セット
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {w.exercises.slice(0, 5).map((e, i) => <Badge key={i} type={e.type} />)}
                      {w.exercises.length > 5 && <span style={{ fontSize: 10, color: "#333", fontFamily: "monospace" }}>+{w.exercises.length - 5}</span>}
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: "#1a1a1a",
                    lineHeight: 1, flexShrink: 0, marginLeft: 12 }}>{totalSets}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function WorkoutScreen({ active, setActive, onFinish, onBack }) {
  const [showAddEx, setShowAddEx] = useState(false);
  const [addSetForId, setAddSetForId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const addExercise = (ex) => setActive({ ...active, exercises: [...active.exercises, ex] });
  const addSet = (exId, set) => setActive({
    ...active,
    exercises: active.exercises.map(e => e.id === exId ? { ...e, sets: [...e.sets, set] } : e)
  });

  const d = new Date(active.date);
  const days = ["日","月","火","水","木","金","土"];
  const dateStr = `${d.getMonth()+1}/${d.getDate()} (${days[d.getDay()]})`;
  const targetEx = active.exercises.find(e => e.id === addSetForId);
  const totalSets = active.exercises.reduce((s, e) => s + e.sets.length, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#050505", paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 14px", display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid #0d0d0d", position: "sticky", top: 0, background: "#050505", zIndex: 10 }}>
        <button onClick={() => active.exercises.length ? setShowConfirm(true) : onBack()}
          style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 18, padding: "4px 6px" }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "2px", lineHeight: 1 }}>
            MUSCLE <span style={{ color: "#FF3B30" }}>YAMATO</span>
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#333", marginTop: 1 }}>
            {dateStr} · {active.exercises.length} 種目 · {totalSets} セット
          </div>
        </div>
        <button onClick={onFinish} style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 10,
          color: "#ccc", padding: "9px 14px", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12, fontWeight: 600, letterSpacing: "0.5px", transition: "all .15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#1e1e1e"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#141414"; e.currentTarget.style.color = "#ccc"; }}>
          完了 →
        </button>
      </div>

      <div style={{ padding: "14px 14px 0" }}>
        {active.exercises.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#222",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: "1px" }}>
            種目を追加してください
          </div>
        )}
        {active.exercises.map(ex => (
          <ExerciseCard key={ex.id} exercise={ex} onAddSet={() => setAddSetForId(ex.id)} />
        ))}
        <button onClick={() => setShowAddEx(true)} style={{
          width: "100%", background: "transparent", border: "1px dashed #1e1e1e", borderRadius: 12,
          padding: "13px", color: "#333", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
          fontWeight: 600, cursor: "pointer", letterSpacing: "1px", transition: "all .15s", marginTop: 4 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#666"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#333"; }}>
          + 種目を追加
        </button>
      </div>

      {showAddEx && <AddExModal onAdd={addExercise} onClose={() => setShowAddEx(false)} />}
      {targetEx && <AddSetModal exercise={targetEx} onAdd={set => addSet(targetEx.id, set)} onClose={() => setAddSetForId(null)} />}

      {showConfirm && (
        <Sheet onClose={() => setShowConfirm(false)}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "2px", marginBottom: 10 }}>
            ワークアウトを破棄？
          </div>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 20 }}>
            記録は保存されません。
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowConfirm(false)}>キャンセル</Btn>
            <Btn variant="danger" onClick={onBack}>破棄する</Btn>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function DetailScreen({ workout, onBack }) {
  if (!workout) return null;
  const d = new Date(workout.date);
  const days = ["日","月","火","水","木","金","土"];
  const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")} (${days[d.getDay()]})`;
  const timeStr = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  const totalSets = workout.exercises.reduce((s, e) => s + e.sets.length, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#050505", paddingBottom: 40 }}>
      <div style={{ padding: "16px 16px 14px", display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid #0d0d0d", position: "sticky", top: 0, background: "#050505", zIndex: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 18, padding: "4px 6px" }}>←</button>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: "#ddd" }}>{dateStr}</div>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: "#333" }}>{timeStr} · {workout.exercises.length} 種目 · {totalSets} セット</div>
        </div>
      </div>
      <div style={{ padding: "14px 14px 0" }}>
        {workout.exercises.map(ex => <ExerciseCard key={ex.id} exercise={ex} onAddSet={null} />)}
      </div>
    </div>
  );
}

/* ─── ROOT ─── */

export default function App() {
  const [screen, setScreen] = useState("home");
  const [workouts, setWorkouts] = useState([]);
  const [active, setActive] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = globalCSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("ym-workouts-v1");
        if (r) setWorkouts(JSON.parse(r.value));
      } catch {}
    })();
  }, []);

  const persist = async (data) => {
    try { await window.storage.set("ym-workouts-v1", JSON.stringify(data)); } catch {}
  };

  const startWorkout = () => {
    setActive({ id: Date.now(), date: new Date().toISOString(), exercises: [] });
    setScreen("workout");
  };

  const finishWorkout = () => {
    if (active?.exercises?.length) {
      const updated = [active, ...workouts];
      setWorkouts(updated);
      persist(updated);
    }
    setActive(null);
    setScreen("home");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050505" }}>
      {screen === "home" && (
        <HomeScreen workouts={workouts} onStart={startWorkout}
          onView={w => { setDetail(w); setScreen("detail"); }} />
      )}
      {screen === "workout" && active && (
        <WorkoutScreen active={active} setActive={setActive}
          onFinish={finishWorkout} onBack={() => { setActive(null); setScreen("home"); }} />
      )}
      {screen === "detail" && (
        <DetailScreen workout={detail} onBack={() => setScreen("home")} />
      )}
    </div>
  );
}
