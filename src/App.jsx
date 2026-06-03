import { useState, useEffect, useRef } from "react";

const FONTS = "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap";

const INIT_CATS = [
  { id:"selfcare", emoji:"🍑", label:"Self Care", color:"#FFAD9E", bg:"#FFF0ED", dailyGoal:7, weeklyGoal:null, reward:"☕ A coffee", rewardType:"daily", rewardCycle:1 },
  { id:"school", emoji:"💙", label:"School", color:"#7EB6FF", bg:"#EBF3FF", dailyGoal:null, weeklyGoal:3, reward:"🍽️ Lunch out", rewardType:"multi-week", rewardCycle:2 },
  { id:"work", emoji:"🍒", label:"Work", color:"#FF6B6B", bg:"#FFECEC", dailyGoal:3, weeklyGoal:15, reward:"👗 Item of clothing", rewardType:"weekly", rewardCycle:1 },
  { id:"life", emoji:"🥭", label:"Life To-Dos", color:"#FFB347", bg:"#FFF5E6", dailyGoal:null, weeklyGoal:10, reward:"🧁 A small treat", rewardType:"weekly", rewardCycle:1 },
];

const MOTIV = [
  "You're on fire! 🔥 Keep going!", "Look at you being productive! ✨", "Another one done! Unstoppable! 💪",
  "Every small step counts! 🌟", "Your future self is so grateful! 🎉", "Building something amazing! 🚀",
  "Proud of you for showing up! 💫", "You're literally a superhero! 🦸‍♀️", "Another win in the books! 🏆",
  "You + effort = magic! ✨", "Standing ovation! 👏👏👏", "One less thing, one more smile! 😄",
];
const DICE = ["⚀","⚁","⚂","⚃","⚄","⚅"];
const FREQ = ["daily","weekly","monthly","yearly"];
const COLORS = [["#FFAD9E","#FFF0ED"],["#FF6B6B","#FFECEC"],["#FF8FAB","#FFF0F5"],["#FFB347","#FFF5E6"],["#FFD93D","#FFFBE6"],["#6BCB77","#EDFAEF"],["#7EB6FF","#EBF3FF"],["#C490E4","#F5EDFB"],["#A0A0A0","#F0F0F0"]];

const dayKey = () => new Date().toISOString().slice(0,10);
const weekStart = () => { const n=new Date(),d=new Date(n); d.setDate(n.getDate()-n.getDay()); d.setHours(0,0,0,0); return d; };
const randMotiv = () => MOTIV[Math.floor(Math.random()*MOTIV.length)];

function getCounts(counts, catId, cats) {
  const c = counts[catId]||{}, dk = dayKey(), ws = weekStart();
  const cat = cats.find(x=>x.id===catId);
  const weekly = Object.entries(c).filter(([k])=>k.length===10&&new Date(k)>=ws).reduce((s,[,v])=>s+v,0);
  let multiWeek = 0;
  if (cat && cat.rewardType==="multi-week") {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-cat.rewardCycle*7);
    multiWeek = Object.entries(c).filter(([k])=>k.length===10&&new Date(k)>=cutoff).reduce((s,[,v])=>s+v,0);
  }
  return { daily: c[dk]||0, weekly, multiWeek };
}
function rewardTarget(cat) {
  if (cat.rewardType==="daily") return cat.dailyGoal||1;
  if (cat.rewardType==="multi-week") return (cat.weeklyGoal||1)*cat.rewardCycle;
  return cat.weeklyGoal||1;
}
function rewardCurrent(cat, c) {
  if (cat.rewardType==="daily") return c.daily;
  if (cat.rewardType==="multi-week") return c.multiWeek;
  return c.weekly;
}

// ── Toast ──
function Toast({ msg, onDone }) {
  const [vis, setVis] = useState(true);
  useEffect(()=>{ const t=setTimeout(()=>{setVis(false);setTimeout(onDone,300)},3500); return ()=>clearTimeout(t); },[]);
  return <div style={{ position:"fixed",top:20,left:"50%",transform:`translateX(-50%) translateY(${vis?0:-80}px)`,background:"linear-gradient(135deg,#FFF8F0,#FFF0F5)",border:"2px solid #FFD4E8",borderRadius:20,padding:"14px 24px",boxShadow:"0 8px 32px rgba(255,150,200,0.2)",zIndex:2000,maxWidth:"85%",textAlign:"center",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:600,color:"#5A3A6A",transition:"all 0.3s ease",opacity:vis?1:0 }}>{msg}</div>;
}

// ── Claude Message ──
function ClaudeMsg({ msg, loading }) {
  if (!msg && !loading) return null;
  return <div style={{ background:"linear-gradient(135deg,#F5F0FF,#FFF0F5)",borderRadius:20,padding:"16px 20px",margin:"0 0 16px",border:"1.5px solid #E8D8F8" }}>
    <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
      <span style={{ fontSize:20 }}>🤖</span>
      <div style={{ fontFamily:"'Nunito',sans-serif",fontSize:14,color:"#4A3A5A",lineHeight:1.5 }}>
        {loading ? <span style={{ animation:"pulse 1s infinite" }}>Thinking...</span> : msg}
      </div>
    </div>
  </div>;
}

// ── Dice ──
function Dice({ onRoll, mult }) {
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState(0);
  const roll = () => {
    if (rolling||mult>1) return;
    setRolling(true); let c=0;
    const iv=setInterval(()=>{ setFace(Math.floor(Math.random()*6)); c++; if(c>12){clearInterval(iv);const r=Math.floor(Math.random()*6)+1;setFace(r-1);setRolling(false);onRoll(r);}},80);
  };
  return <button onClick={roll} style={{ background:mult>1?"linear-gradient(135deg,#FFD700,#FFA500)":"linear-gradient(135deg,#E8E0F0,#D0C4E0)",border:"none",borderRadius:16,padding:"10px 18px",cursor:mult>1?"default":"pointer",fontSize:28,display:"flex",alignItems:"center",gap:10,fontFamily:"'Fredoka',sans-serif",fontWeight:600,color:"#5A4A6A",boxShadow:mult>1?"0 0 20px rgba(255,215,0,0.4)":"0 2px 8px rgba(0,0,0,0.08)",animation:rolling?"shake 0.1s infinite":"none" }}>
    <span style={{ fontSize:32 }}>{DICE[face]}</span>
    {mult>1?<span style={{ fontSize:14,color:"#8B6914" }}>×{mult} today!</span>:<span style={{ fontSize:12,color:"#8A7A9A" }}>Rough day? Roll for multiplier</span>}
  </button>;
}

// ── Progress Bar ──
function PBar({ pct, color, h=8 }) {
  return <div style={{ height:h,background:"#F0E8F8",borderRadius:h/2,overflow:"hidden" }}>
    <div style={{ height:"100%",width:`${Math.min(pct,100)}%`,background:`linear-gradient(90deg,${color}88,${color})`,borderRadius:h/2,transition:"width 0.5s ease" }}/>
  </div>;
}

// ── Recurring Picker ──
function RecPicker({ value, onChange }) {
  if (!value) return <button onClick={()=>onChange({freq:"daily",every:1})} style={{ background:"none",border:"1.5px dashed #CCC",borderRadius:10,padding:"6px 12px",fontSize:12,color:"#AAA",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:600 }}>🔁 Make recurring</button>;
  return <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
    <span style={{ fontSize:12,color:"#7A6A8A",fontFamily:"'Nunito',sans-serif",fontWeight:600 }}>🔁</span>
    <input type="number" min={1} max={99} value={value.every} onFocus={e=>e.target.select()} onChange={e=>onChange({...value,every:Math.max(1,parseInt(e.target.value)||1)})} style={{ width:38,border:"1.5px solid #DDD",borderRadius:8,padding:"4px 6px",textAlign:"center",fontSize:13,fontFamily:"'Nunito',sans-serif",fontWeight:700,outline:"none" }}/>
    <span style={{ fontSize:12,color:"#7A6A8A",fontFamily:"'Nunito',sans-serif",fontWeight:600 }}>x</span>
    {FREQ.map(f=><button key={f} onClick={()=>onChange({...value,freq:f})} style={{ padding:"4px 10px",borderRadius:8,fontSize:11,fontFamily:"'Fredoka',sans-serif",fontWeight:600,border:"none",cursor:"pointer",background:value.freq===f?"#7A6A8A":"#F0E8F8",color:value.freq===f?"#FFF":"#7A6A8A" }}>{f}</button>)}
    <button onClick={()=>onChange(null)} style={{ background:"none",border:"none",color:"#CCC",cursor:"pointer",fontSize:16 }}>✕</button>
  </div>;
}

// ── Swipeable Task Row ──
function SwipeRow({ task, cat, idx, onToggle, onDelete }) {
  const [ox, setOx] = useState(0);
  const [sx, setSx] = useState(null);
  const [sw, setSw] = useState(false);
  const onStart = x => { setSx(x); setSw(true); };
  const onMove = x => { if(sx===null)return; const d=x-sx; setOx(d<0?Math.max(d,-100):0); };
  const onEnd = () => { setSw(false); setSx(null); setOx(ox<-70?-100:0); };
  return <div style={{ position:"relative",overflow:"hidden",borderRadius:12 }}>
    <div style={{ position:"absolute",right:0,top:0,bottom:0,width:80,background:"#E74C3C",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"0 12px 12px 0",cursor:"pointer" }} onClick={()=>{setOx(0);onDelete(idx);}}>
      <span style={{ color:"#FFF",fontSize:20 }}>🗑️</span>
    </div>
    <div onTouchStart={e=>onStart(e.touches[0].clientX)} onTouchMove={e=>onMove(e.touches[0].clientX)} onTouchEnd={onEnd}
      onMouseDown={e=>onStart(e.clientX)} onMouseMove={e=>{if(sw)onMove(e.clientX)}} onMouseUp={onEnd} onMouseLeave={()=>{if(sw)onEnd()}}
      onClick={()=>{if(Math.abs(ox)<5&&!task.done)onToggle(idx)}}
      style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,background:task.done?`${cat.color}10`:"#FFF",border:`1.5px solid ${task.done?cat.color+"33":"#E8E0F0"}`,cursor:task.done?"default":"pointer",transition:sw?"none":"transform 0.25s ease",transform:`translateX(${ox}px)`,userSelect:"none",position:"relative",zIndex:1 }}>
      <div style={{ width:22,height:22,borderRadius:7,border:`2px solid ${task.done?cat.color:"#CCC"}`,background:task.done?cat.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#FFF",fontSize:13,fontWeight:700,flexShrink:0 }}>{task.done&&"✓"}</div>
      <div style={{ flex:1,minWidth:0 }}>
        <span style={{ fontFamily:"'Nunito',sans-serif",fontSize:14,color:task.done?"#9A8AAA":"#3A2E4A",textDecoration:task.done?"line-through":"none" }}>{task.text}</span>
        {task.recurring&&<div style={{ fontSize:10,color:"#BBA8CC",fontFamily:"'Nunito',sans-serif",fontWeight:600,marginTop:2 }}>🔁 {task.recurring.every>1?`${task.recurring.every}x `:""}{task.recurring.freq}</div>}
      </div>
    </div>
  </div>;
}

// ── Task with Subtasks ──
function TaskWithSubs({ task, cat, idx, onToggle, onDelete, onToggleSub, onDeleteSub, onEditSub, onAddSub }) {
  const [expanded, setExpanded] = useState(true);
  const [addText, setAddText] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [editText, setEditText] = useState("");
  const doneSubs = (task.subtasks||[]).filter(s=>s.done).length;
  const totalSubs = (task.subtasks||[]).length;
  const allDone = task.done || doneSubs===totalSubs;

  return <div style={{ borderRadius:14,overflow:"hidden",border:`1.5px solid ${allDone?cat.color+"33":"#E8E0F0"}`,background:allDone?`${cat.color}08`:"#FFF" }}>
    {/* Parent task header */}
    <div style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 14px" }}>
      <div onClick={e=>{e.stopPropagation();if(!allDone)onToggle(idx)}} style={{ width:22,height:22,borderRadius:7,border:`2px solid ${allDone?cat.color:"#CCC"}`,background:allDone?cat.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#FFF",fontSize:13,fontWeight:700,flexShrink:0,cursor:allDone?"default":"pointer" }}>{allDone&&"✓"}</div>
      <div style={{ flex:1,minWidth:0,cursor:"pointer" }} onClick={()=>setExpanded(!expanded)}>
        <span style={{ fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:600,color:allDone?"#9A8AAA":"#3A2E4A",textDecoration:allDone?"line-through":"none" }}>{task.text}</span>
        <div style={{ fontSize:10,color:"#BBA8CC",fontFamily:"'Nunito',sans-serif",fontWeight:600,marginTop:2 }}>
          🧩 {doneSubs}/{totalSubs} subtasks done
          {task.recurring&&<span> · 🔁 {task.recurring.every>1?`${task.recurring.every}x `:""}{task.recurring.freq}</span>}
        </div>
      </div>
      <span onClick={()=>setExpanded(!expanded)} style={{ fontSize:14,color:"#CCC",transition:"transform 0.2s",transform:expanded?"rotate(90deg)":"rotate(0)",cursor:"pointer" }}>›</span>
    </div>

    {/* Subtasks */}
    {expanded&&<div style={{ padding:"0 14px 12px",marginLeft:18,borderTop:"1px solid #F0E8F8" }}>
      {(task.subtasks||[]).map((sub,si)=><div key={sub.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:si<totalSubs-1?"1px solid #F8F4FC":"none" }}>
        <div onClick={()=>{if(!sub.done)onToggleSub(idx,si)}} style={{ width:18,height:18,borderRadius:5,border:`2px solid ${sub.done?cat.color:"#CCC"}`,background:sub.done?cat.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#FFF",fontSize:10,fontWeight:700,flexShrink:0,cursor:sub.done?"default":"pointer" }}>{sub.done&&"✓"}</div>
        {editIdx===si
          ? <input autoFocus value={editText} onChange={e=>setEditText(e.target.value)} onBlur={()=>{if(editText.trim())onEditSub(idx,si,editText.trim());setEditIdx(null)}} onKeyDown={e=>{if(e.key==="Enter"){if(editText.trim())onEditSub(idx,si,editText.trim());setEditIdx(null)}}} style={{ flex:1,border:"1.5px solid #E8E0F0",borderRadius:6,padding:"4px 8px",fontSize:12,fontFamily:"'Nunito',sans-serif",outline:"none" }}/>
          : <span onClick={()=>{if(!sub.done){setEditIdx(si);setEditText(sub.text)}}} style={{ flex:1,fontFamily:"'Nunito',sans-serif",fontSize:13,color:sub.done?"#BBA8CC":"#4A3A5A",textDecoration:sub.done?"line-through":"none",cursor:sub.done?"default":"text" }}>{sub.text}</span>
        }
        {!sub.done&&<button onClick={()=>onDeleteSub(idx,si)} style={{ background:"none",border:"none",color:"#DDD",cursor:"pointer",fontSize:12,padding:"0 2px" }}>✕</button>}
      </div>)}
      {/* Add subtask inline */}
      <div style={{ display:"flex",gap:6,marginTop:6 }}>
        <input value={addText} onChange={e=>setAddText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&addText.trim()){onAddSub(idx,addText.trim());setAddText("")}}} placeholder="Add subtask..." style={{ flex:1,border:"1.5px dashed #E0D8E8",borderRadius:6,padding:"4px 8px",fontSize:12,fontFamily:"'Nunito',sans-serif",outline:"none" }}/>
        <button onClick={()=>{if(addText.trim()){onAddSub(idx,addText.trim());setAddText("")}}} style={{ background:"none",border:"none",color:cat.color,cursor:"pointer",fontFamily:"'Fredoka',sans-serif",fontWeight:700,fontSize:14 }}>+</button>
      </div>
    </div>}
  </div>;
}

// ── Bottom Nav ──
function Nav({ cats, page, go }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const vis = cats.slice(0,4), over = cats.slice(4), hasOver = over.length>0;
  const tabs = [{id:"home",emoji:"🏠",label:"Home"},...vis.map(c=>({id:c.id,emoji:c.emoji,label:c.label})),...(hasOver?[{id:"_more",emoji:"•••",label:"More"}]:[]),{id:"settings",emoji:"⚙️",label:"Settings"}];
  const overActive = over.some(c=>c.id===page);
  return <div>
    {moreOpen&&<div style={{ position:"fixed",inset:0,zIndex:899 }} onClick={()=>setMoreOpen(false)}>
      <div onClick={e=>e.stopPropagation()} style={{ position:"fixed",bottom:64,left:"50%",transform:"translateX(-50%)",background:"#FFF",borderRadius:18,padding:"10px 6px",boxShadow:"0 8px 32px rgba(0,0,0,0.15)",display:"flex",gap:4,zIndex:901 }}>
        {over.map(c=><button key={c.id} onClick={()=>{go(c.id);setMoreOpen(false)}} style={{ background:page===c.id?c.bg:"transparent",border:"none",borderRadius:12,padding:"8px 14px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}>
          <span style={{ fontSize:22 }}>{c.emoji}</span>
          <span style={{ fontFamily:"'Fredoka',sans-serif",fontSize:9,fontWeight:600,color:"#5A4A6A" }}>{c.label}</span>
        </button>)}
      </div>
    </div>}
    <div style={{ position:"fixed",bottom:0,left:0,right:0,background:"rgba(255,253,255,0.95)",backdropFilter:"blur(12px)",borderTop:"1.5px solid #EDE4F4",zIndex:900,padding:"6px 0 8px" }}>
      <div style={{ display:"flex",justifyContent:"space-around",maxWidth:520,margin:"0 auto" }}>
        {tabs.map(t=>{
          const isMore=t.id==="_more", active=isMore?overActive:page===t.id;
          return <button key={t.id} onClick={()=>{if(isMore)setMoreOpen(!moreOpen);else{go(t.id);setMoreOpen(false)}}} style={{ background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 8px",opacity:active?1:0.5,transition:"all 0.2s",transform:active?"scale(1.1)":"scale(1)" }}>
            <span style={{ fontSize:22 }}>{t.emoji}</span>
            <span style={{ fontFamily:"'Fredoka',sans-serif",fontSize:9,fontWeight:600,color:active?"#5A4A6A":"#AAA" }}>{t.label}</span>
          </button>;
        })}
      </div>
    </div>
  </div>;
}

// ── Home Page ──
function Home({ cats, counts, mult, onDice, cMsg, cLoad, lifetime, go, onTap }) {
  return <div>
    <div style={{ textAlign:"center",marginBottom:20 }}>
      <h1 style={{ fontFamily:"'Fredoka',sans-serif",fontSize:30,fontWeight:700,background:"linear-gradient(135deg,#FF8FAB,#C490E4,#7EB6FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:"0 0 4px" }}>fruitful 🍇</h1>
      <div style={{ fontSize:12,color:"#AA90BB",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:12 }}>
        <span>🏅 {lifetime} lifetime pts</span><span style={{ color:"#DDD" }}>|</span><span>{new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span>
      </div>
    </div>
    <ClaudeMsg msg={cMsg} loading={cLoad}/>
    <div style={{ display:"flex",justifyContent:"center",marginBottom:18 }}><Dice onRoll={onDice} mult={mult}/></div>
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      {cats.map(cat=>{
        const c=getCounts(counts,cat.id,cats), tgt=rewardTarget(cat), cur=rewardCurrent(cat,c), pct=tgt>0?(cur/tgt)*100:0, ready=cur>=tgt;
        return <div key={cat.id} onClick={()=>go(cat.id)} style={{ background:"#FFF",borderRadius:22,padding:"18px 20px",cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.05)",border:`2px solid ${ready?cat.color:"transparent"}`,position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",top:0,left:0,bottom:0,width:`${Math.min(pct,100)}%`,background:cat.bg,transition:"width 0.5s ease",zIndex:0 }}/>
          <div style={{ position:"relative",zIndex:1,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <span style={{ fontSize:30 }}>{cat.emoji}</span>
              <div>
                <div style={{ fontFamily:"'Fredoka',sans-serif",fontWeight:600,fontSize:15,color:"#3A2E4A" }}>{cat.label}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif",fontSize:11,color:"#9A8AAA",fontWeight:600 }}>
                  {cat.dailyGoal?`${c.daily}/${cat.dailyGoal} today`:""}{cat.dailyGoal&&cat.weeklyGoal?" · ":""}{cat.weeklyGoal?`${c.weekly}/${cat.rewardType==="multi-week"?tgt:cat.weeklyGoal} per ${cat.rewardType==="multi-week"?`${cat.rewardCycle} weeks`:"week"}`:""}
                </div>
              </div>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              {ready&&<span style={{ animation:"pulse 1.5s infinite",fontSize:20 }}>🎁</span>}
              <button onClick={e=>{e.stopPropagation();onTap(cat.id)}} style={{ background:`linear-gradient(135deg,${cat.bg},${cat.color}22)`,border:`2px solid ${cat.color}44`,borderRadius:12,padding:"6px 14px",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",gap:4 }}>
                {cat.emoji}<span style={{ fontSize:12,fontFamily:"'Fredoka',sans-serif",fontWeight:600,color:"#5A4A6A" }}>+1</span>
              </button>
              <span style={{ fontSize:18,color:"#CCC" }}>›</span>
            </div>
          </div>
        </div>;
      })}
    </div>
    <div style={{ marginTop:18,background:"#FFF",borderRadius:20,padding:18,boxShadow:"0 4px 20px rgba(0,0,0,0.04)" }}>
      <div style={{ fontFamily:"'Fredoka',sans-serif",fontWeight:700,fontSize:15,color:"#3A2E4A",marginBottom:12 }}>🗓️ Reward Progress</div>
      {cats.map(cat=>{const c=getCounts(counts,cat.id,cats),tgt=rewardTarget(cat),cur=rewardCurrent(cat,c);return <div key={cat.id} style={{ marginBottom:10 }}><div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}><span style={{ fontSize:12,fontWeight:600,color:"#5A4A6A" }}>{cat.emoji} {cat.label}</span><span style={{ fontSize:11,color:"#9A8AAA",fontWeight:600 }}>{cur}/{tgt} → {cat.reward}</span></div><PBar pct={tgt>0?(cur/tgt)*100:0} color={cat.color}/></div>;})}
    </div>
  </div>;
}

// ── Category Page ──
function CatPage({ cat, counts, tasks, mult, cats, onTap, onText, onAddTask, onToggle, onDelete, onClaim, cMsg, cLoad, onToggleSub, onDeleteSub, onEditSub, onAddSub, callBreakdown }) {
  const [mode, setMode] = useState("quick");
  const [text, setText] = useState("");
  const [ntxt, setNtxt] = useState("");
  const [nrec, setNrec] = useState(null);
  const [pendingSubs, setPendingSubs] = useState(null); // subtasks being built before adding
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [newSubText, setNewSubText] = useState("");
  const c = getCounts(counts, cat.id, cats), tgt=rewardTarget(cat), cur=rewardCurrent(cat,c), ready=cur>=tgt;

  const handleBiteSize = async () => {
    if (!ntxt.trim()) return;
    setBreakdownLoading(true);
    const subs = await callBreakdown(ntxt.trim());
    setPendingSubs(subs.length>0 ? subs : [{ id:"st_"+Math.random().toString(36).slice(2,8), text:"", done:false }]);
    setBreakdownLoading(false);
  };

  const handleManualBreakdown = () => {
    setPendingSubs([{ id:"st_"+Math.random().toString(36).slice(2,8), text:"", done:false }]);
  };

  const addPendingSub = () => {
    setPendingSubs(p => [...(p||[]), { id:"st_"+Math.random().toString(36).slice(2,8), text:"", done:false }]);
  };

  const editPendingSub = (i, txt) => {
    setPendingSubs(p => { const n=[...p]; n[i]={...n[i],text:txt}; return n; });
  };

  const deletePendingSub = (i) => {
    setPendingSubs(p => { const n=[...p]; n.splice(i,1); return n.length>0?n:null; });
  };

  const handleAddTask = () => {
    if (!ntxt.trim()) return;
    const validSubs = pendingSubs ? pendingSubs.filter(s=>s.text.trim()) : null;
    onAddTask(ntxt.trim(), nrec, validSubs && validSubs.length>0 ? validSubs : null);
    setNtxt(""); setNrec(null); setPendingSubs(null); setNewSubText("");
  };

  return <div>
    <div style={{ textAlign:"center",marginBottom:20 }}>
      <span style={{ fontSize:52,display:"block",marginBottom:4 }}>{cat.emoji}</span>
      <h2 style={{ fontFamily:"'Fredoka',sans-serif",fontWeight:700,fontSize:24,color:"#3A2E4A",margin:"0 0 6px" }}>{cat.label}</h2>
      <div style={{ fontFamily:"'Nunito',sans-serif",fontSize:13,color:"#9A8AAA",fontWeight:600 }}>
        {cat.dailyGoal?`${c.daily}/${cat.dailyGoal} today`:""}{cat.dailyGoal&&cat.weeklyGoal?"  ·  ":""}{cat.weeklyGoal?`${c.weekly}/${cat.rewardType==="multi-week"?tgt:cat.weeklyGoal} this ${cat.rewardType==="multi-week"?`${cat.rewardCycle}-week cycle`:"week"}`:""}
      </div>
    </div>
    <div style={{ background:"#FFF",borderRadius:18,padding:16,marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
        <span style={{ fontFamily:"'Fredoka',sans-serif",fontWeight:600,fontSize:14,color:"#5A4A6A" }}>🎯 Reward: {cat.reward}</span>
        <span style={{ fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:cat.color }}>{cur}/{tgt}</span>
      </div>
      <PBar pct={tgt>0?(cur/tgt)*100:0} color={cat.color} h={10}/>
      {ready&&<button onClick={onClaim} style={{ width:"100%",marginTop:12,padding:12,borderRadius:14,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${cat.color},${cat.color}CC)`,color:"#FFF",fontFamily:"'Fredoka',sans-serif",fontWeight:700,fontSize:15,animation:"pulse 1.5s infinite" }}>🎁 Claim: {cat.reward}!</button>}
    </div>
    <ClaudeMsg msg={cMsg} loading={cLoad}/>
    <div style={{ display:"flex",gap:6,marginBottom:16 }}>
      {[["quick",`${cat.emoji} Quick Tap`],["text","💬 Tell Claude"],["check","☑️ Tasks"]].map(([k,l])=>
        <button key={k} onClick={()=>setMode(k)} style={{ flex:1,padding:"9px 4px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"'Fredoka',sans-serif",fontWeight:600,fontSize:12,background:mode===k?cat.color:cat.bg,color:mode===k?"#FFF":"#5A4A6A" }}>{l}</button>
      )}
    </div>
    {mode==="quick"&&<button onClick={onTap} style={{ width:"100%",padding:"28px 0",borderRadius:20,border:`3px solid ${cat.color}44`,background:`linear-gradient(135deg,${cat.bg},${cat.color}15)`,cursor:"pointer",fontSize:48 }}>{cat.emoji}<div style={{ fontSize:14,fontFamily:"'Fredoka',sans-serif",fontWeight:600,color:"#5A4A6A",marginTop:8 }}>Tap to log +{mult>1?`${mult} (×${mult})`:"1"}</div></button>}
    {mode==="text"&&<div>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Tell me what you accomplished! ✨" style={{ width:"100%",minHeight:100,border:`2px solid ${cat.color}44`,borderRadius:16,padding:16,fontSize:15,fontFamily:"'Nunito',sans-serif",resize:"vertical",outline:"none",background:cat.bg,boxSizing:"border-box" }}/>
      <button onClick={()=>{if(text.trim()){onText(text.trim());setText("")}}} disabled={!text.trim()} style={{ width:"100%",marginTop:10,padding:13,borderRadius:14,border:"none",background:text.trim()?cat.color:`${cat.color}44`,color:text.trim()?"#FFF":"#9A8AAA",fontFamily:"'Fredoka',sans-serif",fontWeight:700,fontSize:15,cursor:text.trim()?"pointer":"default" }}>Log it! {cat.emoji}</button>
    </div>}
    {mode==="check"&&<div>
      <div style={{ background:"#FFF",borderRadius:16,padding:14,marginBottom:12,boxShadow:"0 2px 10px rgba(0,0,0,0.04)" }}>
        <div style={{ display:"flex",gap:8,marginBottom:8 }}>
          <input value={ntxt} onChange={e=>setNtxt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&ntxt.trim()&&!pendingSubs)handleAddTask()}} placeholder="Add a task..." style={{ flex:1,border:`2px solid ${cat.color}44`,borderRadius:12,padding:"10px 14px",fontSize:14,fontFamily:"'Nunito',sans-serif",outline:"none",background:cat.bg }}/>
          <button onClick={handleAddTask} disabled={!ntxt.trim()} style={{ background:ntxt.trim()?cat.color:`${cat.color}44`,border:"none",borderRadius:12,padding:"10px 16px",color:"#FFF",fontFamily:"'Fredoka',sans-serif",fontWeight:700,fontSize:16,cursor:ntxt.trim()?"pointer":"default" }}>+</button>
        </div>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:pendingSubs?10:0 }}>
          <RecPicker value={nrec} onChange={setNrec}/>
          {!pendingSubs&&<button onClick={handleBiteSize} disabled={!ntxt.trim()||breakdownLoading} style={{ background:"none",border:"1.5px dashed #CCC",borderRadius:10,padding:"6px 12px",fontSize:12,color:ntxt.trim()?"#7A6A8A":"#CCC",cursor:ntxt.trim()?"pointer":"default",fontFamily:"'Nunito',sans-serif",fontWeight:600 }}>
            {breakdownLoading?"✨ Thinking...":"🧩 Make bite-sized"}
          </button>}
          {!pendingSubs&&<button onClick={handleManualBreakdown} style={{ background:"none",border:"1.5px dashed #CCC",borderRadius:10,padding:"6px 12px",fontSize:12,color:"#AAA",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:600 }}>
            ✏️ Break it down myself
          </button>}
        </div>
        {/* Pending subtasks preview */}
        {pendingSubs&&<div style={{ borderTop:"1.5px solid #F0E8F8",paddingTop:10 }}>
          <div style={{ fontSize:11,fontFamily:"'Fredoka',sans-serif",fontWeight:600,color:"#7A6A8A",marginBottom:6 }}>Subtasks:</div>
          {pendingSubs.map((s,i)=><div key={s.id} style={{ display:"flex",gap:6,alignItems:"center",marginBottom:6 }}>
            <span style={{ color:"#CCC",fontSize:12 }}>•</span>
            <input value={s.text} onChange={e=>editPendingSub(i,e.target.value)} placeholder="Subtask..." style={{ flex:1,border:"1.5px solid #E8E0F0",borderRadius:8,padding:"6px 10px",fontSize:13,fontFamily:"'Nunito',sans-serif",outline:"none" }}/>
            <button onClick={()=>deletePendingSub(i)} style={{ background:"none",border:"none",color:"#CCC",cursor:"pointer",fontSize:14 }}>✕</button>
          </div>)}
          <div style={{ display:"flex",gap:6 }}>
            <button onClick={addPendingSub} style={{ background:"none",border:"1.5px dashed #DDD",borderRadius:8,padding:"4px 12px",fontSize:11,color:"#AAA",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:600 }}>+ Add subtask</button>
            <button onClick={()=>setPendingSubs(null)} style={{ background:"none",border:"none",fontSize:11,color:"#CCC",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:600 }}>Cancel</button>
          </div>
        </div>}
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {(tasks||[]).map((t,i)=>
          t.subtasks && t.subtasks.length>0
            ? <TaskWithSubs key={t.text+i} task={t} cat={cat} idx={i} onToggle={onToggle} onDelete={onDelete} onToggleSub={onToggleSub} onDeleteSub={onDeleteSub} onEditSub={onEditSub} onAddSub={onAddSub}/>
            : <SwipeRow key={t.text+i} task={t} cat={cat} idx={i} onToggle={onToggle} onDelete={onDelete}/>
        )}
        {(!tasks||tasks.length===0)&&<div style={{ textAlign:"center",padding:24,color:"#BBA8CC",fontFamily:"'Nunito',sans-serif",fontSize:14 }}>No tasks yet — add some above!</div>}
      </div>
    </div>}
  </div>;
}

// ── Settings ──
function Settings({ cats, onUpdate, onAdd, onRemove }) {
  const [ed, setEd] = useState(null);
  const [del, setDel] = useState(null);
  return <div>
    <div style={{ textAlign:"center",marginBottom:20 }}>
      <h2 style={{ fontFamily:"'Fredoka',sans-serif",fontWeight:700,fontSize:24,color:"#3A2E4A",margin:"0 0 4px" }}>⚙️ Settings</h2>
      <p style={{ fontFamily:"'Nunito',sans-serif",fontSize:13,color:"#9A8AAA",fontWeight:600,margin:0 }}>Customize categories, goals & rewards</p>
    </div>
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      {cats.map(cat=>{
        const editing=ed===cat.id;
        return <div key={cat.id} style={{ background:"#FFF",borderRadius:20,padding:18,boxShadow:"0 2px 12px rgba(0,0,0,0.04)",border:`2px solid ${editing?cat.color:"transparent"}` }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:editing?14:0 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <span style={{ fontSize:26 }}>{cat.emoji}</span>
              {editing?<input value={cat.label} onChange={e=>onUpdate(cat.id,{label:e.target.value})} style={{ fontFamily:"'Fredoka',sans-serif",fontWeight:600,fontSize:16,color:"#3A2E4A",border:"none",borderBottom:"2px solid #E0D8E8",outline:"none",background:"transparent",width:120 }}/>
              :<span style={{ fontFamily:"'Fredoka',sans-serif",fontWeight:600,fontSize:16,color:"#3A2E4A" }}>{cat.label}</span>}
            </div>
            <button onClick={()=>setEd(editing?null:cat.id)} style={{ background:editing?cat.color:cat.bg,border:"none",borderRadius:10,padding:"6px 14px",fontFamily:"'Fredoka',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer",color:editing?"#FFF":"#5A4A6A" }}>{editing?"Done":"Edit"}</button>
          </div>
          {editing&&<div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <div><label style={{ fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:"#7A6A8A",display:"block",marginBottom:4 }}>Emoji</label>
              <input value={cat.emoji} onChange={e=>onUpdate(cat.id,{emoji:e.target.value.slice(-2)})} style={{ fontSize:28,width:52,textAlign:"center",border:"2px solid #C490E4",borderRadius:12,outline:"none",background:"#F5EDFB",padding:4 }}/></div>
            <div><label style={{ fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:"#7A6A8A",display:"block",marginBottom:6 }}>Color</label>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{COLORS.map(([c,b])=><div key={c} onClick={()=>onUpdate(cat.id,{color:c,bg:b})} style={{ width:30,height:30,borderRadius:10,background:c,border:cat.color===c?"3px solid #3A2E4A":"3px solid transparent",cursor:"pointer",transform:cat.color===c?"scale(1.15)":"scale(1)" }}/>)}</div></div>
            <NumField label="Daily Goal" val={cat.dailyGoal} nullable onChange={v=>onUpdate(cat.id,{dailyGoal:v})}/>
            <NumField label="Weekly Goal" val={cat.weeklyGoal} nullable onChange={v=>onUpdate(cat.id,{weeklyGoal:v})}/>
            <div><label style={{ fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:"#7A6A8A",display:"block",marginBottom:4 }}>Reward Type</label>
              <div style={{ display:"flex",gap:4 }}>{["daily","weekly","multi-week"].map(rt=><button key={rt} onClick={()=>onUpdate(cat.id,{rewardType:rt})} style={{ flex:1,padding:"7px 4px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'Fredoka',sans-serif",fontWeight:600,fontSize:11,background:cat.rewardType===rt?cat.color:"#F0E8F8",color:cat.rewardType===rt?"#FFF":"#7A6A8A" }}>{rt}</button>)}</div></div>
            {cat.rewardType==="multi-week"&&<NumField label="Weeks per cycle" val={cat.rewardCycle||2} onChange={v=>onUpdate(cat.id,{rewardCycle:v||2})}/>}
            <div><label style={{ fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:"#7A6A8A",display:"block",marginBottom:4 }}>Reward</label>
              <input value={cat.reward} onChange={e=>onUpdate(cat.id,{reward:e.target.value})} style={{ width:"100%",border:"1.5px solid #E0D8E8",borderRadius:10,padding:"8px 12px",fontSize:14,fontFamily:"'Nunito',sans-serif",outline:"none",boxSizing:"border-box" }}/></div>
            {cats.length>1&&<div style={{ borderTop:"1px solid #F0E8F8",paddingTop:12 }}>
              {del===cat.id?<div style={{ display:"flex",gap:8,alignItems:"center" }}>
                <span style={{ fontSize:12,color:"#E74C3C",fontFamily:"'Nunito',sans-serif",fontWeight:700 }}>Delete "{cat.label}"?</span>
                <button onClick={()=>{onRemove(cat.id);setEd(null);setDel(null)}} style={{ background:"#E74C3C",color:"#FFF",border:"none",borderRadius:8,padding:"6px 14px",fontFamily:"'Fredoka',sans-serif",fontWeight:600,fontSize:11,cursor:"pointer" }}>Yes</button>
                <button onClick={()=>setDel(null)} style={{ background:"#F0E8F8",color:"#7A6A8A",border:"none",borderRadius:8,padding:"6px 14px",fontFamily:"'Fredoka',sans-serif",fontWeight:600,fontSize:11,cursor:"pointer" }}>Cancel</button>
              </div>:<button onClick={()=>setDel(cat.id)} style={{ background:"none",border:"none",color:"#CCC",fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:600 }}>🗑️ Delete category</button>}
            </div>}
          </div>}
          {!editing&&<div style={{ fontFamily:"'Nunito',sans-serif",fontSize:11,color:"#AA9ABB",fontWeight:600,marginTop:6 }}>{cat.dailyGoal?`${cat.dailyGoal}/day`:""}{cat.dailyGoal&&cat.weeklyGoal?" · ":""}{cat.weeklyGoal?`${cat.weeklyGoal}/wk`:""}{cat.rewardType==="multi-week"?` × ${cat.rewardCycle||2} wks`:""}{" → "}{cat.reward}</div>}
        </div>;
      })}
      {cats.length<6&&<button onClick={onAdd} style={{ background:"#FFF",borderRadius:20,padding:18,boxShadow:"0 2px 12px rgba(0,0,0,0.04)",border:"2px dashed #DDD",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>
        <span style={{ fontSize:24,color:"#CCC" }}>+</span><span style={{ fontFamily:"'Fredoka',sans-serif",fontWeight:600,fontSize:14,color:"#AAA" }}>Add category ({cats.length}/6)</span>
      </button>}
    </div>
  </div>;
}
function NumField({ label, val, nullable, onChange }) {
  const isNull = val===null||val===undefined;
  return <div>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
      <label style={{ fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:"#7A6A8A" }}>{label}</label>
      {nullable&&<button onClick={()=>onChange(isNull?1:null)} style={{ background:"none",border:"none",fontSize:10,color:"#BBA8CC",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700 }}>{isNull?"Enable":"Disable"}</button>}
    </div>
    {!isNull&&<input type="number" min={1} value={val} onChange={e=>onChange(Math.max(1,parseInt(e.target.value)||1))} style={{ width:"100%",border:"1.5px solid #E0D8E8",borderRadius:10,padding:"8px 12px",fontSize:14,fontFamily:"'Nunito',sans-serif",outline:"none",boxSizing:"border-box" }}/>}
    {isNull&&<div style={{ fontSize:11,color:"#CCC",fontFamily:"'Nunito',sans-serif",fontStyle:"italic" }}>Not set</div>}
  </div>;
}

// ════════════════ MAIN APP ════════════════
// ── Persistence ──
function load(key, fallback) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export default function Fruitful() {
  const [cats, setCats] = useState(() => load("fr-cats", INIT_CATS));
  const [counts, setCounts] = useState(() => load("fr-counts", {}));
  const [tasks, setTasks] = useState(() => load("fr-tasks", {}));
  const [mult, setMult] = useState(() => {
    const s = load("fr-mult", { day: null, val: 1 });
    return s.day === dayKey() ? s.val : 1;
  });
  const [toast, setToast] = useState(null);
  const [cMsg, setCMsg] = useState(null);
  const [cLoad, setCLoad] = useState(false);
  const [lifetime, setLifetime] = useState(() => load("fr-lifetime", 0));
  const [undo, setUndo] = useState(null);
  const undoT = useRef(null);
  const [page, setPage] = useState("home");
  const navigate = p => { setCMsg(null); setCLoad(false); setPage(p); };
  const dk = dayKey();

  // Save state changes to localStorage
  useEffect(() => { save("fr-cats", cats); }, [cats]);
  useEffect(() => { save("fr-counts", counts); }, [counts]);
  useEffect(() => { save("fr-tasks", tasks); }, [tasks]);
  useEffect(() => { save("fr-lifetime", lifetime); }, [lifetime]);

  const pushUndo = a => { if(undoT.current)clearTimeout(undoT.current); setUndo(a); undoT.current=setTimeout(()=>setUndo(null),5000); };
  const doUndo = () => {
    if(!undo)return; if(undoT.current)clearTimeout(undoT.current);
    if(undo.type==="add"){
      setCounts(p=>{const cc={...(p[undo.cat]||{})};cc[dk]=Math.max((cc[dk]||0)-undo.pts,0);return{...p,[undo.cat]:cc}});
      setLifetime(p=>Math.max(p-undo.pts,0));
    }
    if(undo.type==="task"){
      setTasks(p=>{
        const ct=[...(p[undo.cat]||[])];
        const task={...ct[undo.idx]};
        if(task.subtasks && undo.prevSubStates) {
          task.subtasks = task.subtasks.map((s,i)=>({...s,done:undo.prevSubStates[i]||false}));
          task.done = task.subtasks.every(s=>s.done);
        } else {
          task.done=false;
        }
        ct[undo.idx]=task;
        return{...p,[undo.cat]:ct};
      });
      setCounts(p=>{const cc={...(p[undo.cat]||{})};cc[dk]=Math.max((cc[dk]||0)-undo.pts,0);return{...p,[undo.cat]:cc}});
      setLifetime(p=>Math.max(p-undo.pts,0));
    }
    if(undo.type==="subtask"){
      setTasks(p=>{
        const ct=[...(p[undo.cat]||[])];
        const task={...ct[undo.taskIdx]};
        const subs=[...(task.subtasks||[])];
        subs[undo.subIdx]={...subs[undo.subIdx],done:false};
        task.subtasks=subs;
        task.done=false;
        ct[undo.taskIdx]=task;
        return{...p,[undo.cat]:ct};
      });
      setCounts(p=>{const cc={...(p[undo.cat]||{})};cc[dk]=Math.max((cc[dk]||0)-undo.pts,0);return{...p,[undo.cat]:cc}});
      setLifetime(p=>Math.max(p-undo.pts,0));
    }
    if(undo.type==="claim") setCounts(p=>({...p,[undo.cat]:undo.prev}));
    setUndo(null); setToast("↩️ Undone!");
  };

  const addPts = id => { const pts=mult; setCounts(p=>{const cc={...(p[id]||{})};cc[dk]=(cc[dk]||0)+pts;return{...p,[id]:cc}}); setLifetime(p=>p+pts); return pts; };

  // Fruitful API proxy
  const WORKER = "https://fruitful-api.fruitful.workers.dev/api";

  const callClaude = async (txt, label) => {
    setCLoad(true); setCMsg(null);
    try {
      const r = await fetch(WORKER+"/motivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskText: txt, categoryLabel: label })
      });
      const d = await r.json();
      setCMsg(d.message || randMotiv());
    } catch { setCMsg(randMotiv()); }
    setCLoad(false);
  };

  const callBreakdown = async (txt) => {
    try {
      const r = await fetch(WORKER+"/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskText: txt })
      });
      const d = await r.json();
      return (d.subtasks||[]).map(s => ({ id:"st_"+Math.random().toString(36).slice(2,8), text:s, done:false }));
    } catch { return []; }
  };

  const quickTap = id => { const cat=cats.find(c=>c.id===id); const pts=addPts(id); pushUndo({type:"add",cat:id,pts}); setCMsg(null); setToast(`${cat.emoji} +${pts}${mult>1?` (×${mult})`:""} — ${randMotiv()}`); };
  const detailSubmit = (id, txt) => { const cat=cats.find(c=>c.id===id); const pts=addPts(id); pushUndo({type:"add",cat:id,pts}); callClaude(txt,cat.label); };
  const addTask = (id, txt, rec, subs) => setTasks(p=>{const ct=[...(p[id]||[])];ct.push({text:txt,done:false,createdAt:new Date().toISOString(),recurring:rec||null,subtasks:subs||null});return{...p,[id]:ct}});
  const deleteTask = (id, i) => { const cat=cats.find(c=>c.id===id); setTasks(p=>{const ct=[...(p[id]||[])];ct.splice(i,1);return{...p,[id]:ct}}); setToast(`${cat.emoji} Task deleted`); };
  const toggleTask = (id, i) => {
    const cat=cats.find(c=>c.id===id);
    const currentTasks = tasks[id]||[];
    const task = currentTasks[i];
    const prevSubStates = task?.subtasks ? task.subtasks.map(s=>s.done) : null;
    const remaining = task?.subtasks ? task.subtasks.filter(s=>!s.done).length : 0;
    const pointCount = task?.subtasks && task.subtasks.length>0 ? remaining : 1;
    
    setTasks(p=>{
      const ct=[...(p[id]||[])];
      const t={...ct[i]};
      if(t.subtasks && t.subtasks.length>0) {
        t.subtasks = t.subtasks.map(s=>({...s,done:true}));
      }
      t.done=true;
      ct[i]=t;
      return{...p,[id]:ct};
    });
    let pts = 0;
    for(let n=0;n<(pointCount||1);n++) pts+=addPts(id);
    pushUndo({type:"task",cat:id,idx:i,pts,prevSubStates});
    setToast(`${cat.emoji} +${pts}${pointCount>1?` (${pointCount} tasks!)`:""} — ${randMotiv()}`);
  };
  const toggleSubtask = (id, ti, si) => {
    const cat=cats.find(c=>c.id===id);
    setTasks(p=>{
      const ct=[...(p[id]||[])];
      const task={...ct[ti]};
      const subs=[...(task.subtasks||[])];
      subs[si]={...subs[si],done:true};
      task.subtasks=subs;
      if(subs.every(s=>s.done)) task.done=true;
      ct[ti]=task;
      return{...p,[id]:ct};
    });
    const pts=addPts(id);
    pushUndo({type:"subtask",cat:id,taskIdx:ti,subIdx:si,pts});
    setToast(`${cat.emoji} +${pts} — Subtask done! ${randMotiv()}`);
  };
  const deleteSubtask = (id, ti, si) => {
    setTasks(p=>{
      const ct=[...(p[id]||[])];
      const task={...ct[ti]};
      const subs=[...(task.subtasks||[])];
      subs.splice(si,1);
      task.subtasks=subs.length>0?subs:null;
      ct[ti]=task;
      return{...p,[id]:ct};
    });
  };
  const editSubtask = (id, ti, si, txt) => {
    setTasks(p=>{
      const ct=[...(p[id]||[])];
      const task={...ct[ti]};
      const subs=[...(task.subtasks||[])];
      subs[si]={...subs[si],text:txt};
      task.subtasks=subs;
      ct[ti]=task;
      return{...p,[id]:ct};
    });
  };
  const addSubtaskToTask = (id, ti, txt) => {
    setTasks(p=>{
      const ct=[...(p[id]||[])];
      const task={...ct[ti]};
      const subs=[...(task.subtasks||[])];
      subs.push({id:"st_"+Math.random().toString(36).slice(2,8),text:txt,done:false});
      task.subtasks=subs;
      task.done=false;
      ct[ti]=task;
      return{...p,[id]:ct};
    });
  };
  const claimReward = id => { const cat=cats.find(c=>c.id===id); const prev={...(counts[id]||{})}; pushUndo({type:"claim",cat:id,prev}); setCounts(p=>({...p,[id]:{}})); setToast(`🎉 Reward claimed: ${cat.reward}!`); setCMsg(`Congratulations on earning: ${cat.reward}! 🎉 You worked so hard — enjoy it! 💪✨`); };
  const diceRoll = r => { setMult(r); save("fr-mult", { day: dayKey(), val: r }); setToast(`🎲 You rolled a ${r}! All points today are ×${r}! 🌟`); };
  const addCat = () => { if(cats.length>=6)return; const cl=COLORS[cats.length%COLORS.length]; setCats(p=>[...p,{id:"c"+Date.now(),emoji:"⭐",label:"New Category",color:cl[0],bg:cl[1],dailyGoal:3,weeklyGoal:null,reward:"🎁 A treat",rewardType:"daily",rewardCycle:1}]); };
  const removeCat = id => { setCats(p=>p.filter(c=>c.id!==id)); setCounts(p=>{const n={...p};delete n[id];return n}); setTasks(p=>{const n={...p};delete n[id];return n}); if(page===id)navigate("home"); };
  const updateCat = (id, u) => setCats(p=>p.map(c=>c.id===id?{...c,...u}:c));

  const ac = cats.find(c=>c.id===page);

  return <div style={{ minHeight:"100vh",background:"linear-gradient(180deg,#FDF8FF 0%,#FFF5F8 40%,#F8F0FF 100%)",fontFamily:"'Nunito',sans-serif",paddingBottom:80 }}>
    <link href={FONTS} rel="stylesheet"/>
    <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.03);opacity:0.85}}@keyframes shake{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}*{box-sizing:border-box}`}</style>
    {toast&&<Toast msg={toast} onDone={()=>setToast(null)}/>}
    {undo&&<div style={{ position:"fixed",bottom:76,left:"50%",transform:"translateX(-50%)",zIndex:2000,animation:"slideUp 0.3s ease" }}>
      <button onClick={doUndo} style={{ display:"flex",alignItems:"center",gap:8,background:"#3A2E4A",color:"#FFF",border:"none",borderRadius:16,padding:"11px 20px",fontFamily:"'Fredoka',sans-serif",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 6px 24px rgba(58,46,74,0.35)" }}>↩️ Undo</button>
    </div>}
    <div style={{ maxWidth:480,margin:"0 auto",padding:"18px 16px 24px" }}>
      {page==="home"&&<Home cats={cats} counts={counts} mult={mult} onDice={diceRoll} cMsg={cMsg} cLoad={cLoad} lifetime={lifetime} go={navigate} onTap={quickTap}/>}
      {page==="settings"&&<Settings cats={cats} onUpdate={updateCat} onAdd={addCat} onRemove={removeCat}/>}
      {ac&&<CatPage cat={ac} counts={counts} tasks={tasks[ac.id]||[]} mult={mult} cats={cats} onTap={()=>quickTap(ac.id)} onText={t=>detailSubmit(ac.id,t)} onAddTask={(t,r,s)=>addTask(ac.id,t,r,s)} onToggle={i=>toggleTask(ac.id,i)} onDelete={i=>deleteTask(ac.id,i)} onClaim={()=>claimReward(ac.id)} cMsg={cMsg} cLoad={cLoad} onToggleSub={(ti,si)=>toggleSubtask(ac.id,ti,si)} onDeleteSub={(ti,si)=>deleteSubtask(ac.id,ti,si)} onEditSub={(ti,si,txt)=>editSubtask(ac.id,ti,si,txt)} onAddSub={(ti,txt)=>addSubtaskToTask(ac.id,ti,txt)} callBreakdown={callBreakdown}/>}
    </div>
    <Nav cats={cats} page={page} go={navigate}/>
  </div>;
}
