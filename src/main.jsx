import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Home, CalendarDays, ClipboardList, BookOpen, Users, TrendingUp, Settings,
  Menu, Search, Plus, Pencil, Trash2, Copy, Printer, Eye, Star, X, Save,
  Image as ImageIcon, Check, ChevronLeft, ChevronRight, UserPlus, RefreshCw,
  Trophy, Dumbbell, Percent, Award, BarChart3, CircleCheck, CircleX, Ban
} from "lucide-react";
import { configured, supabase, TEAM_ID } from "./lib/supabase";
import "./styles.css";

const APP_NAME = "Programación Benjamín C";
const APP_VERSION = "6.0.3";
const APP_DEVELOPER = "José A. Herrera";
const SEASON_START = "2026-09-01";
const SEASON_END = "2027-06-30";
const SEASON_LABEL = "2026-2027";

const PARTS = [
  ["calentamiento","Calentamiento"],
  ["inicial","Parte inicial"],
  ["principal","Parte principal"],
  ["partido","Partido / estrategia"],
  ["vuelta","Vuelta a la calma"],
];
const PART_LABEL = Object.fromEntries(PARTS);
const DIFF_LABEL = {baja:"Baja",media:"Media",alta:"Alta"};
const SESSION_PARTS = [
  {id:"calentamiento",label:"Calentamiento",time:"5-10 min"},
  {id:"inicial",label:"Parte inicial",time:"15-20 min"},
  {id:"principal",label:"Parte principal",time:"15-20 min"},
  {id:"partido",label:"Partido / estrategia",time:"10-15 min"},
  {id:"vuelta",label:"Vuelta a la calma",time:"5-10 min"},
];

const MENU = [
  {id:"inicio",label:"Inicio",icon:Home},
  {group:"Planificación",icon:CalendarDays,children:[
    {id:"planificacion",label:"Temporada"},
    {id:"calendario",label:"Calendario"},
    {id:"historico",label:"Histórico"},
  ]},
  {group:"Biblioteca",icon:BookOpen,children:[
    {id:"biblioteca",label:"Ejercicios"},
    {id:"favoritos",label:"Favoritos"},
  ]},
  {group:"Equipo",icon:Users,children:[
    {id:"jugadores",label:"Jugadores"},
    {id:"asistencia",label:"Asistencia"},
    {id:"convocatorias",label:"Convocatorias"},
  ]},
  {id:"estadisticas",label:"Análisis",icon:TrendingUp},
];

function fmtDate(value, short=false){
  if(!value)return "—";
  return new Intl.DateTimeFormat("es-ES",short?{weekday:"short",day:"numeric",month:"short"}:{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value+"T12:00:00"));
}
function iso(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`}
function mondayOf(value){
  const d=new Date(value+"T12:00:00"), day=(d.getDay()+6)%7;
  d.setDate(d.getDate()-day);return d;
}
function weekNumber(value){
  const mon=mondayOf(value), base=mondayOf(SEASON_START);
  return Math.round((mon-base)/604800000)+1;
}
function resizeImage(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();r.onerror=reject;r.onload=()=>{
      const img=new Image();img.onerror=reject;img.onload=()=>{
        const max=1400;let w=img.width,h=img.height;
        if(w>max){h=Math.round(h*max/w);w=max} if(h>max){w=Math.round(w*max/h);h=max}
        const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);
        resolve(c.toDataURL("image/jpeg",.82));
      };img.src=r.result;
    };r.readAsDataURL(file);
  });
}

function ModalShell({title,kicker,onClose,children,className=""}){
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className={`modal ${className}`}>
      <header className="modal-head"><div><small>{kicker}</small><h2>{title}</h2></div><button className="icon-btn" onClick={onClose}><X/></button></header>
      {children}
    </div>
  </div>
}

function ExerciseModal({exercise,onClose,onSaved}){
  const [form,setForm]=useState(exercise||{name:"",type:"",difficulty:"baja",part:"inicial",description:"",image_url:"",favorite:false});
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  const set=(k,v)=>setForm(x=>({...x,[k]:v}));
  async function image(e){const f=e.target.files?.[0];if(!f)return;try{set("image_url",await resizeImage(f))}catch{setError("No se pudo procesar la imagen.")}}
  async function save(e){
    e.preventDefault();setError("");if(!form.name.trim())return setError("Escribe un nombre.");setBusy(true);
    const payload={team_id:TEAM_ID,name:form.name.trim(),type:form.type.trim()||null,difficulty:form.difficulty,part:form.part,description:form.description.trim()||null,image_url:form.image_url||null,favorite:!!form.favorite};
    const q=exercise?.id?supabase.from("exercises").update(payload).eq("id",exercise.id):supabase.from("exercises").insert(payload);
    const {error}=await q;setBusy(false);if(error)return setError(error.message);onSaved();
  }
  return <ModalShell title="Ficha del ejercicio" kicker={exercise?"Editar ejercicio":"Nuevo ejercicio"} onClose={onClose} className="exercise-modal">
    <form className="form-grid modal-scroll" onSubmit={save}>
      <label className="full">Nombre<input value={form.name} onChange={e=>set("name",e.target.value)}/></label>
      <label>Parte<select value={form.part} onChange={e=>set("part",e.target.value)}>{PARTS.map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label>
      <label>Dificultad<select value={form.difficulty} onChange={e=>set("difficulty",e.target.value)}><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select></label>
      <label className="full">Tipología<input value={form.type||""} onChange={e=>set("type",e.target.value)}/></label>
      <label className="full">Descripción<textarea rows="5" value={form.description||""} onChange={e=>set("description",e.target.value)}/></label>
      <label className="check full"><input type="checkbox" checked={!!form.favorite} onChange={e=>set("favorite",e.target.checked)}/><Star size={16}/> Favorito</label>
      <div className="full upload-zone"><b>Imagen</b><label className="button secondary"><ImageIcon size={17}/> Seleccionar<input hidden type="file" accept="image/*" onChange={image}/></label>{form.image_url&&<img src={form.image_url} alt="Vista previa"/>}</div>
      {error&&<div className="error full">{error}</div>}
      <footer className="modal-footer full"><button type="button" className="button ghost" onClick={onClose}>Cancelar</button><button className="button primary" disabled={busy}><Save size={16}/>{busy?"Guardando…":"Guardar"}</button></footer>
    </form>
  </ModalShell>
}

function Library({favorites=false}){
  const [items,setItems]=useState([]),[query,setQuery]=useState(""),[part,setPart]=useState(""),[diff,setDiff]=useState(""),[editing,setEditing]=useState(undefined),[zoom,setZoom]=useState(""),[loading,setLoading]=useState(true),[error,setError]=useState("");
  async function load(){setLoading(true);const {data,error}=await supabase.from("exercises").select("*").eq("team_id",TEAM_ID).order("name");setLoading(false);if(error)return setError(error.message);setItems(data||[])}
  useEffect(()=>{load()},[]);
  async function remove(ex){if(!confirm(`¿Eliminar "${ex.name}"?`))return;const {error}=await supabase.from("exercises").delete().eq("id",ex.id);if(error)alert(error.message);else load()}
  async function fav(ex){const {error}=await supabase.from("exercises").update({favorite:!ex.favorite}).eq("id",ex.id);if(error)alert(error.message);else load()}
  async function duplicate(ex){const {id,created_at,...copy}=ex;copy.name=`${ex.name} · copia`;const {error}=await supabase.from("exercises").insert(copy);if(error)alert(error.message);else load()}
  const filtered=items.filter(ex=>{const q=query.toLowerCase();return(!q||ex.name.toLowerCase().includes(q)||(ex.type||"").toLowerCase().includes(q))&&(!part||ex.part===part)&&(!diff||ex.difficulty===diff)&&(!favorites||ex.favorite)});
  return <>
    <PageHead title={favorites?"Favoritos":"Ejercicios"} kicker="Biblioteca" subtitle={`${filtered.length} ejercicios visibles`} action={!favorites&&<button className="button primary" onClick={()=>setEditing(null)}><Plus/>Nuevo</button>}/>
    <div className="compact-filters"><label><Search/><input placeholder="Buscar…" value={query} onChange={e=>setQuery(e.target.value)}/></label><select value={part} onChange={e=>setPart(e.target.value)}><option value="">Todas las partes</option>{PARTS.map(([v,l])=><option value={v} key={v}>{l}</option>)}</select><select value={diff} onChange={e=>setDiff(e.target.value)}><option value="">Dificultad</option><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select></div>
    {error&&<div className="error">{error}</div>}
    {loading?<Empty text="Cargando ejercicios…"/>:<div className="exercise-grid v6">{filtered.map(ex=><article className="exercise-card v6" key={ex.id}>
      <button className="exercise-photo" onClick={()=>ex.image_url&&setZoom(ex.image_url)}>{ex.image_url?<img src={ex.image_url}/>:<ImageIcon/>}</button>
      <div className="exercise-info"><div className="exercise-title"><h3>{ex.name}</h3><button className={`star ${ex.favorite?"on":""}`} onClick={()=>fav(ex)}><Star size={17} fill={ex.favorite?"currentColor":"none"}/></button></div><div className="mini-tags"><span>{ex.type||"Sin tipología"}</span><span>{DIFF_LABEL[ex.difficulty]}</span><span>{PART_LABEL[ex.part]}</span></div><p>{ex.description||"Sin descripción."}</p><div className="row-actions"><button onClick={()=>setEditing(ex)}>Editar</button><button onClick={()=>duplicate(ex)}>Duplicar</button><button className="danger-link" onClick={()=>remove(ex)}>Eliminar</button></div></div>
    </article>)}</div>}
    {editing!==undefined&&<ExerciseModal exercise={editing} onClose={()=>setEditing(undefined)} onSaved={()=>{setEditing(undefined);load()}}/>}
    {zoom&&<div className="zoom" onClick={()=>setZoom("")}><button><X/></button><img src={zoom}/></div>}
  </>
}

function PageHead({title,kicker,subtitle,action}){return <div className="page-head"><div><small>{kicker}</small><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{action&&<div>{action}</div>}</div>}
function Empty({text}){return <div className="empty compact">{text}</div>}

function MesocycleModal({item,onClose,onSaved}){
  const [form,setForm]=useState(item||{name:"",start_date:"",end_date:"",objectives:"",sort_order:0});const [error,setError]=useState("");
  const set=(k,v)=>setForm(x=>({...x,[k]:v}));
  async function save(e){e.preventDefault();if(!form.name.trim())return setError("Escribe un nombre.");const payload={team_id:TEAM_ID,name:form.name.trim(),start_date:form.start_date||null,end_date:form.end_date||null,objectives:form.objectives||null,sort_order:Number(form.sort_order)||0};const q=item?.id?supabase.from("mesocycles").update(payload).eq("id",item.id).select("id").single():supabase.from("mesocycles").insert(payload).select("id").single();const {data,error}=await q;if(error)return setError(error.message);onSaved(data?.id)}
  return <ModalShell title="Mesociclo" kicker={item?"Editar":"Nuevo"} onClose={onClose}><form className="form-grid modal-scroll" onSubmit={save}><label className="full">Nombre<input value={form.name} onChange={e=>set("name",e.target.value)}/></label><label>Inicio<input type="date" value={form.start_date||""} onChange={e=>set("start_date",e.target.value)}/></label><label>Fin<input type="date" value={form.end_date||""} onChange={e=>set("end_date",e.target.value)}/></label><label className="full">Objetivos<textarea rows="5" value={form.objectives||""} onChange={e=>set("objectives",e.target.value)}/></label>{error&&<div className="error full">{error}</div>}<footer className="modal-footer full"><button type="button" className="button ghost" onClick={onClose}>Cancelar</button><button className="button primary">Guardar</button></footer></form></ModalShell>
}

function ExercisePicker({part,onChoose,onClose}){
  const [items,setItems]=useState([]),[q,setQ]=useState("");useEffect(()=>{supabase.from("exercises").select("*").eq("team_id",TEAM_ID).order("name").then(({data})=>setItems(data||[]))},[]);
  const filtered=items.filter(ex=>!q||ex.name.toLowerCase().includes(q.toLowerCase())||(ex.type||"").toLowerCase().includes(q.toLowerCase())).sort((a,b)=>(a.part===part?0:1)-(b.part===part?0:1));
  return <ModalShell title={`Elegir · ${PART_LABEL[part]}`} kicker="Biblioteca" onClose={onClose} className="picker-modal"><div className="picker-search"><Search/><input placeholder="Buscar ejercicio…" value={q} onChange={e=>setQ(e.target.value)}/></div><div className="picker-grid modal-scroll">{filtered.map(ex=><button className="picker-card" key={ex.id} onClick={()=>onChoose(ex)}><div>{ex.image_url?<img src={ex.image_url}/>:<ImageIcon/>}</div><section><b>{ex.name}</b><small>{ex.type||"Sin tipología"} · {DIFF_LABEL[ex.difficulty]}</small><p>{ex.description||""}</p></section></button>)}</div></ModalShell>
}

function SessionEditor({session,onClose,onSaved}){
  const [form,setForm]=useState({session_date:session?.session_date||"",kind:session?.kind||"A",title:session?.title||"",goal:session?.goal||"",mesocycle_id:session?.mesocycle_id||"",goalkeeper_notes:session?.goalkeeper_notes||"",notes:session?.notes||"",status:session?.status||"planned"});
  const empty=Object.fromEntries(SESSION_PARTS.map(p=>[p.id,null]));const [blocks,setBlocks]=useState(empty),[picker,setPicker]=useState(""),[mesos,setMesos]=useState([]),[mesoModal,setMesoModal]=useState(undefined),[error,setError]=useState(""),[dragPart,setDragPart]=useState("");
  const set=(k,v)=>setForm(x=>({...x,[k]:v}));
  function loadMesos(){return supabase.from("mesocycles").select("*").eq("team_id",TEAM_ID).order("sort_order").then(({data})=>setMesos(data||[]))}
  useEffect(()=>{loadMesos();if(session?.id)supabase.from("session_blocks").select("part,exercises(*)").eq("session_id",session.id).then(({data})=>{const n={...empty};(data||[]).forEach(r=>n[r.part]=r.exercises);setBlocks(n)})},[]);
  function drop(target){if(!dragPart||dragPart===target)return;setBlocks(x=>({...x,[dragPart]:x[target], [target]:x[dragPart]}));setDragPart("")}
  async function save(e){e.preventDefault();if(!form.session_date)return setError("Selecciona una fecha.");const payload={team_id:TEAM_ID,mesocycle_id:form.mesocycle_id||null,session_date:form.session_date,kind:form.kind,title:form.title||null,goal:form.goal||null,goalkeeper_notes:form.goalkeeper_notes||null,notes:form.notes||null,status:form.status};let id=session?.id;if(id){const {error}=await supabase.from("sessions").update(payload).eq("id",id);if(error)return setError(error.message)}else{const {data,error}=await supabase.from("sessions").insert(payload).select("id").single();if(error)return setError(error.message);id=data.id}await supabase.from("session_blocks").delete().eq("session_id",id);const rows=SESSION_PARTS.filter(p=>blocks[p.id]).map((p,i)=>({session_id:id,exercise_id:blocks[p.id].id,part:p.id,sort_order:i}));if(rows.length){const {error}=await supabase.from("session_blocks").insert(rows);if(error)return setError(error.message)};await ensureTrainingActivity({...payload,id});onSaved()}
  return <ModalShell title="Sesión de entrenamiento" kicker={session?"Editar":"Nueva sesión"} onClose={onClose} className="session-modal"><form className="session-form modal-scroll" onSubmit={save}><div className="session-meta"><label>Fecha<input type="date" value={form.session_date} onChange={e=>set("session_date",e.target.value)}/></label><label>Sesión<select value={form.kind} onChange={e=>set("kind",e.target.value)}><option>A</option><option>B</option></select></label><label>Mesociclo<div className="field-inline"><select value={form.mesocycle_id} onChange={e=>set("mesocycle_id",e.target.value)}><option value="">Sin asignar</option>{mesos.map(m=><option value={m.id} key={m.id}>{m.name}</option>)}</select><button type="button" className="icon-btn" title="Nuevo mesociclo" onClick={()=>setMesoModal(null)}><Plus size={15}/></button>{form.mesocycle_id&&<button type="button" className="icon-btn" title="Editar mesociclo" onClick={()=>setMesoModal(mesos.find(m=>m.id===form.mesocycle_id))}><Pencil size={14}/></button>}</div></label><label className="wide">Título<input value={form.title} onChange={e=>set("title",e.target.value)}/></label><label className="wide">Objetivo<textarea rows="2" value={form.goal} onChange={e=>set("goal",e.target.value)}/></label></div><div className="blocks-compact">{SESSION_PARTS.map(p=>{const ex=blocks[p.id];return <article className="block-row" key={p.id} onDragOver={e=>e.preventDefault()} onDrop={()=>drop(p.id)}><header><b>{p.label}</b><small>{p.time}</small></header>{ex?<div className="block-selected" draggable onDragStart={()=>setDragPart(p.id)}><div className="block-img">{ex.image_url?<img src={ex.image_url}/>:<ImageIcon/>}</div><div><b>{ex.name}</b><small>{ex.type||""} · {DIFF_LABEL[ex.difficulty]}</small></div><button type="button" onClick={()=>setPicker(p.id)}>Cambiar</button></div>:<button type="button" className="choose-empty" onClick={()=>setPicker(p.id)}>+ Elegir ejercicio</button>}</article>})}</div><div className="session-notes"><label>Porteros<textarea rows="3" value={form.goalkeeper_notes} onChange={e=>set("goalkeeper_notes",e.target.value)}/></label><label>Observaciones<textarea rows="3" value={form.notes} onChange={e=>set("notes",e.target.value)}/></label></div>{error&&<div className="error">{error}</div>}<footer className="modal-footer"><button type="button" className="button ghost" onClick={onClose}>Cancelar</button><button className="button primary"><Save/>Guardar sesión</button></footer></form>{picker&&<ExercisePicker part={picker} onClose={()=>setPicker("")} onChoose={ex=>{setBlocks(x=>({...x,[picker]:ex}));setPicker("")}}/>}{mesoModal!==undefined&&<MesocycleModal item={mesoModal} onClose={()=>setMesoModal(undefined)} onSaved={async(newId)=>{await loadMesos();if(newId)set("mesocycle_id",newId);setMesoModal(undefined)}}/>}</ModalShell>
}

async function ensureTrainingActivity(session){
  if(!session?.id||!session.session_date)return {id:null,error:null};
  const {data,error:selErr}=await supabase.from("activities").select("id").eq("team_id",TEAM_ID).eq("session_id",session.id).maybeSingle();
  if(selErr){console.error("ensureTrainingActivity (buscar):",selErr.message);return {id:null,error:selErr.message}}
  const payload={team_id:TEAM_ID,session_id:session.id,activity_date:session.session_date,type:"training",title:session.title||`Sesión ${session.kind||""}`,status:session.status==="completed"?"completed":"planned"};
  if(data?.id){const {error}=await supabase.from("activities").update(payload).eq("id",data.id);if(error){console.error("ensureTrainingActivity (actualizar):",error.message);return {id:null,error:error.message}}return {id:data.id,error:null}}
  const {data:created,error:insErr}=await supabase.from("activities").insert(payload).select("id").single();
  if(insErr){console.error("ensureTrainingActivity (crear):",insErr.message);return {id:null,error:insErr.message}}
  return {id:created?.id||null,error:null};
}

function printSession(session,blocks){
  const rows=SESSION_PARTS.map(p=>{const ex=blocks.find(b=>b.part===p.id)?.exercises;return `<section><header><b>${p.label}</b><span>${p.time}</span></header><div class="row">${ex?.image_url?`<img src="${ex.image_url}">`:""}<div><h3>${ex?.name||"Sin ejercicio"}</h3><p>${ex?.description||""}</p></div></div></section>`}).join("");
  const w=window.open("","_blank");w.document.write(`<html><head><title>${session.title||"Sesión"}</title><style>@page{size:A4;margin:9mm}body{font:12px Arial;color:#12264c}h1{margin:0 0 3mm}section{border:1px solid #bbb;margin:3mm 0;break-inside:avoid}section header{display:flex;justify-content:space-between;background:#eef4fa;padding:2mm}.row{display:grid;grid-template-columns:35mm 1fr;gap:3mm;padding:2mm}.row img{width:35mm;height:27mm;object-fit:contain}.row h3{margin:0 0 1mm}.row p{margin:0;white-space:pre-wrap}.note{border:1px solid #bbb;padding:2mm;margin-top:3mm}</style></head><body><h1>${session.title||`Sesión ${session.kind}`}</h1><p>${fmtDate(session.session_date)} · BENJAMÍN C</p>${session.goal?`<div class="note"><b>Objetivo:</b> ${session.goal}</div>`:""}${rows}${session.goalkeeper_notes?`<div class="note"><b>Porteros:</b> ${session.goalkeeper_notes}</div>`:""}<script>window.onload=()=>window.print()</script></body></html>`);w.document.close();
}

function SessionPreview({session,onClose}){
  const [blocks,setBlocks]=useState([]);useEffect(()=>{supabase.from("session_blocks").select("*,exercises(*)").eq("session_id",session.id).order("sort_order").then(({data})=>setBlocks(data||[]))},[]);
  return <ModalShell title={session.title||`Sesión ${session.kind}`} kicker={`${fmtDate(session.session_date)} · Sesión ${session.kind}`} onClose={onClose} className="preview-modal"><div className="preview-scroll modal-scroll">{session.goal&&<div className="note-box"><b>Objetivo</b><p>{session.goal}</p></div>}{SESSION_PARTS.map(p=>{const ex=blocks.find(b=>b.part===p.id)?.exercises;return <article className="preview-row" key={p.id}><header><b>{p.label}</b><small>{p.time}</small></header>{ex?<div>{ex.image_url?<img src={ex.image_url}/>:<ImageIcon/>}<section><h3>{ex.name}</h3><p>{ex.description||""}</p></section></div>:<p>Sin ejercicio.</p>}</article>})}</div><footer className="modal-footer"><button className="button secondary" onClick={()=>printSession(session,blocks)}><Printer/>Imprimir A4</button><button className="button ghost" onClick={onClose}>Cerrar</button></footer></ModalShell>
}

function PlanningPage({history=false}){
  const [sessions,setSessions]=useState([]),[editing,setEditing]=useState(undefined),[preview,setPreview]=useState(null),[attendanceSession,setAttendanceSession]=useState(null),[loading,setLoading]=useState(true);
  async function load(){setLoading(true);const {data}=await supabase.from("sessions").select("*,mesocycles(name)").eq("team_id",TEAM_ID).order("session_date");setSessions(data||[]);setLoading(false);(data||[]).forEach(ensureTrainingActivity)}
  useEffect(()=>{load()},[]);
  async function complete(s){await supabase.from("sessions").update({status:"completed"}).eq("id",s.id);await ensureTrainingActivity({...s,status:"completed"});load()}
  async function reopen(s){await supabase.from("sessions").update({status:"planned"}).eq("id",s.id);await ensureTrainingActivity({...s,status:"planned"});load()}
  async function remove(s){if(!confirm("¿Eliminar esta sesión?"))return;await supabase.from("sessions").delete().eq("id",s.id);load()}
  async function duplicate(s){const {data:bl}=await supabase.from("session_blocks").select("*").eq("session_id",s.id);const {data:n,error}=await supabase.from("sessions").insert({team_id:TEAM_ID,mesocycle_id:s.mesocycle_id,session_date:s.session_date,kind:s.kind,title:`${s.title||"Sesión"} · copia`,goal:s.goal,goalkeeper_notes:s.goalkeeper_notes,notes:s.notes,status:"planned"}).select("*").single();if(error)return alert(error.message);if(bl?.length)await supabase.from("session_blocks").insert(bl.map(b=>({session_id:n.id,exercise_id:b.exercise_id,part:b.part,sort_order:b.sort_order})));await ensureTrainingActivity(n);load()}
  async function openAttendance(s){const created=await ensureTrainingActivity(s);if(created?.error)return alert(`No se pudo abrir la asistencia: ${created.error}`);const {data,error}=await supabase.from("activities").select("*").eq("team_id",TEAM_ID).eq("session_id",s.id).maybeSingle();if(error)return alert(`No se pudo abrir la asistencia: ${error.message}`);if(!data)return alert("No se encontró ni se pudo crear el registro de actividad para esta sesión. Comprueba el esquema de la tabla 'activities' en Supabase (supabase/fix_schema_activities.sql) y vuelve a intentarlo.");setAttendanceSession(data)}
  const shown=sessions.filter(s=>history?s.status==="completed":s.status!=="completed");
  const weeks=useMemo(()=>{const map={};shown.forEach(s=>{const mon=mondayOf(s.session_date),k=iso(mon);if(!map[k])map[k]={monday:mon,sessions:[]};map[k].sessions.push(s)});return Object.values(map).sort((a,b)=>a.monday-b.monday)},[shown]);
  return <>
    <PageHead title={history?"Histórico":"Planificación"} kicker={`Temporada ${SEASON_LABEL}`} subtitle={history?"Sesiones completadas":"Planificación semanal: sesiones A y B en la misma fila. El mesociclo de cada sesión se edita desde su ficha."} action={!history&&<button className="button primary" onClick={()=>setEditing(null)}><Plus/>Nueva sesión</button>}/>
        {loading?<Empty text="Cargando sesiones…"/>:weeks.length===0?<Empty text={history?"No hay sesiones completadas.":"No hay sesiones planificadas."}/>:<div className="weeks-list">{weeks.map((w)=>{const weekNo=weekNumber(iso(w.monday));return <article className="week-row" key={iso(w.monday)}><div className="week-label"><b>Sem {weekNo}</b><small>{fmtDate(iso(w.monday),true)}</small></div><div className="week-sessions">{[...w.sessions].sort((a,b)=>a.session_date.localeCompare(b.session_date)).map(s=><SessionCard key={s.id} s={s} history={history} onEdit={()=>setEditing(s)} onPreview={()=>setPreview(s)} onAttendance={()=>openAttendance(s)} onComplete={()=>complete(s)} onReopen={()=>reopen(s)} onDuplicate={()=>duplicate(s)} onDelete={()=>remove(s)}/>)}</div></article>})}</div>}
    {editing!==undefined&&<SessionEditor session={editing} onClose={()=>setEditing(undefined)} onSaved={()=>{setEditing(undefined);load()}}/>}
    {preview&&<SessionPreview session={preview} onClose={()=>setPreview(null)}/>}
    {attendanceSession&&<AttendanceModal activity={attendanceSession} onClose={()=>{setAttendanceSession(null);load()}}/>}
  </>
}
function SessionCard({s,history,onEdit,onPreview,onAttendance,onComplete,onReopen,onDuplicate,onDelete}){return <div className={`session-card-compact ${history?"done":""}`}><div className="session-card-head"><div><b>Sesión {s.kind}</b><small>{fmtDate(s.session_date,true)}</small></div><span>{s.mesocycles?.name||""}</span></div><h3>{s.title||"Entrenamiento"}</h3><p>{s.goal||"Sin objetivo definido"}</p><div className="session-card-actions"><button onClick={onPreview}><Eye/>Ver</button>{!history&&<button onClick={onEdit}><Pencil/>Editar</button>}<button onClick={onAttendance}>Asistencia</button><button onClick={onDuplicate}><Copy/>Copiar</button>{history?<button onClick={onReopen}>Reabrir</button>:<button className="complete" onClick={onComplete}><Check/>Completar</button>}{!history&&<button className="danger-link icon-only" onClick={onDelete}><Trash2/></button>}</div></div>}

async function ensureSaturdayMatches(){
  const start=new Date(SEASON_START+"T12:00:00"), end=new Date(SEASON_END+"T12:00:00");
  const d=new Date(start);while(d.getDay()!==6)d.setDate(d.getDate()+1);
  const saturdays=[];for(;d<=end;d.setDate(d.getDate()+7))saturdays.push(iso(d));
  const {data:existing,error:selErr}=await supabase.from("activities").select("activity_date,status").eq("team_id",TEAM_ID).eq("type","match").in("activity_date",saturdays.length?saturdays:["1900-01-01"]);
  if(selErr)return selErr.message;
  const have=new Set((existing||[]).map(x=>x.activity_date));const rows=saturdays.filter(x=>!have.has(x)).map(x=>({team_id:TEAM_ID,activity_date:x,type:"match",title:"Partido",status:"planned",home_away:"home"}));
  if(rows.length){const {error:insErr}=await supabase.from("activities").insert(rows);if(insErr)return insErr.message}
  return null;
}

function CalendarPage(){
  const [month,setMonth]=useState(new Date(2026,8,1)),[sessions,setSessions]=useState([]),[matches,setMatches]=useState([]),[conv,setConv]=useState(null),[editSession,setEditSession]=useState(null),[syncError,setSyncError]=useState("");
  async function load(){const {data:s}=await supabase.from("sessions").select("*").eq("team_id",TEAM_ID);setSessions(s||[]);const err=await ensureSaturdayMatches();setSyncError(err?`No se pudieron generar los partidos automáticos: ${err}`:"");const {data:a}=await supabase.from("activities").select("*").eq("team_id",TEAM_ID).eq("type","match").order("activity_date");setMatches(a||[])}
  useEffect(()=>{load()},[]);
  const weeks=useMemo(()=>{const first=new Date(month.getFullYear(),month.getMonth(),1),last=new Date(month.getFullYear(),month.getMonth()+1,0),pad=(first.getDay()+6)%7;const days=[];for(let d=1;d<=last.getDate();d++)days.push(new Date(month.getFullYear(),month.getMonth(),d));const cells=[...Array(pad).fill(null),...days];while(cells.length%7)cells.push(null);const rows=[];for(let i=0;i<cells.length;i+=7){const rowMonday=new Date(first);rowMonday.setDate(first.getDate()-pad+i);rows.push({monday:rowMonday,days:cells.slice(i,i+7)})}return rows},[month]);
  const maxWeek=weekNumber(SEASON_END);
  async function noMatch(a){const {error}=await supabase.from("activities").update({status:"cancelled"}).eq("id",a.id);if(error)return alert(`No se pudo actualizar el partido: ${error.message}`);load()}
  return <><PageHead title="Calendario" kicker="Planificación" subtitle="Entrenamientos y partidos"/>{syncError&&<div className="error" style={{marginBottom:12}}>{syncError}</div>}<section className="calendar card"><div className="calendar-nav"><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft/></button><h2>{new Intl.DateTimeFormat("es-ES",{month:"long",year:"numeric"}).format(month)}</h2><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight/></button></div><div className="weekdays"><b/>{["L","M","X","J","V","S","D"].map(x=><b key={x}>{x}</b>)}</div>{weeks.map((w,wi)=>{const wn=weekNumber(iso(w.monday));return <div className="calendar-grid-v6" key={wi}><div className="week-num">{wn>=1&&wn<=maxWeek?`Sem ${wn}`:""}</div>{w.days.map((d,i)=>{if(!d)return <div className="day muted" key={i}/>;const date=iso(d),weekday=d.getDay(),ss=sessions.filter(s=>s.session_date===date),mm=matches.filter(a=>a.activity_date===date&&a.status!=="cancelled"),isTraining=(weekday===2||weekday===3)&&date>=SEASON_START&&date<=SEASON_END;return <div className="day" key={date}><span>{d.getDate()}</span>{ss.map(s=><button className={`cal-item training ${s.status==="completed"?"done":""}`} key={s.id} onClick={()=>setEditSession(s)}>Entr. {s.kind}</button>)}{isTraining&&ss.length===0&&<button className="cal-item training empty" onClick={()=>setEditSession({session_date:date,kind:weekday===2?"A":"B"})}>+ Entr. {weekday===2?"A":"B"}</button>}{mm.map(a=><div className="cal-match" key={a.id}><button onClick={()=>setConv(a)}>⚽ Partido</button><button className="x" title="Sin partido" onClick={()=>noMatch(a)}>×</button></div>)}</div>})}</div>})}</section>{conv&&<AttendanceModal activity={conv} mode="match" onClose={()=>{setConv(null);load()}}/>}{editSession&&<SessionEditor session={editSession} onClose={()=>setEditSession(null)} onSaved={()=>{setEditSession(null);load()}}/>}</>
}

function PlayerModal({player,onClose,onSaved}){const [form,setForm]=useState(player||{number:"",name:"",position:"",start_date:"2026-09-01",end_date:"",active:true,notes:""});const [error,setError]=useState("");const set=(k,v)=>setForm(x=>({...x,[k]:v}));async function save(e){e.preventDefault();if(!form.name.trim())return setError("Escribe el nombre.");const payload={team_id:TEAM_ID,number:form.number===""?null:Number(form.number),name:form.name.trim(),position:form.position||null,start_date:form.start_date||"2026-09-01",end_date:form.end_date||null,active:!!form.active,notes:form.notes||null};const q=player?.id?supabase.from("players").update(payload).eq("id",player.id):supabase.from("players").insert(payload);const {error}=await q;if(error)return setError(error.message);onSaved()}return <ModalShell title="Jugador" kicker={player?"Editar":"Nuevo"} onClose={onClose}><form className="form-grid modal-scroll" onSubmit={save}><label>Dorsal<input type="number" value={form.number??""} onChange={e=>set("number",e.target.value)}/></label><label>Posición<input value={form.position||""} onChange={e=>set("position",e.target.value)}/></label><label className="full">Nombre<input value={form.name} onChange={e=>set("name",e.target.value)}/></label><label>Alta<input type="date" value={form.start_date||""} onChange={e=>set("start_date",e.target.value)}/></label><label>Baja<input type="date" value={form.end_date||""} onChange={e=>set("end_date",e.target.value)}/></label><label className="check full"><input type="checkbox" checked={!!form.active} onChange={e=>set("active",e.target.checked)}/>Activo</label><label className="full">Observaciones<textarea rows="4" value={form.notes||""} onChange={e=>set("notes",e.target.value)}/></label>{error&&<div className="error full">{error}</div>}<footer className="modal-footer full"><button type="button" className="button ghost" onClick={onClose}>Cancelar</button><button className="button primary">Guardar</button></footer></form></ModalShell>}
function PlayersPage(){const [items,setItems]=useState([]),[q,setQ]=useState(""),[editing,setEditing]=useState(undefined);async function load(){const {data}=await supabase.from("players").select("*").eq("team_id",TEAM_ID).order("number",{ascending:true,nullsFirst:false}).order("name");setItems(data||[])}useEffect(()=>{load()},[]);const filtered=items.filter(p=>!q||p.name.toLowerCase().includes(q.toLowerCase())||String(p.number??"").includes(q));async function toggle(p){await supabase.from("players").update({active:!p.active,end_date:p.active?(p.end_date||iso(new Date())):null}).eq("id",p.id);load()}return <><PageHead title="Jugadores" kicker="Equipo" subtitle={`${items.filter(p=>p.active).length} jugadores activos`} action={<button className="button primary" onClick={()=>setEditing(null)}><UserPlus/>Añadir</button>}/><div className="table-toolbar"><label><Search/><input placeholder="Buscar jugador…" value={q} onChange={e=>setQ(e.target.value)}/></label></div><div className="players-table card"><table><thead><tr><th>Nº</th><th>Jugador</th><th>Posición</th><th>Estado</th><th>Alta</th><th></th></tr></thead><tbody>{filtered.map(p=><tr key={p.id} className={!p.active?"inactive":""}><td className="number">{p.number??"—"}</td><td><b>{p.name}</b></td><td>{p.position||"—"}</td><td><span className={`status ${p.active?"active":"off"}`}>{p.active?"Activo":"Inactivo"}</span></td><td>{fmtDate(p.start_date,true)}</td><td className="table-actions"><button onClick={()=>setEditing(p)}>Editar</button><button onClick={()=>toggle(p)}>{p.active?"Baja":"Reactivar"}</button></td></tr>)}</tbody></table></div><div className="player-footstats"><span>Activos <b>{items.filter(p=>p.active).length}</b></span><span>Inactivos <b>{items.filter(p=>!p.active).length}</b></span><span>Histórico <b>{items.length}</b></span></div>{editing!==undefined&&<PlayerModal player={editing} onClose={()=>setEditing(undefined)} onSaved={()=>{setEditing(undefined);load()}}/>}</>}

function AttendanceModal({activity,onClose,mode}){const [players,setPlayers]=useState([]),[records,setRecords]=useState({}),[saving,setSaving]=useState(false);const isMatch=(mode||activity.type)==="match";useEffect(()=>{Promise.all([supabase.from("players").select("*").eq("team_id",TEAM_ID).order("number",{ascending:true,nullsFirst:false}),supabase.from("attendance").select("*").eq("activity_id",activity.id)]).then(([p,a])=>{const eligible=(p.data||[]).filter(x=>(!x.start_date||activity.activity_date>=x.start_date)&&(!x.end_date||activity.activity_date<=x.end_date));setPlayers(eligible);const saved=Object.fromEntries((a.data||[]).map(r=>[r.player_id,r.status]));const def=isMatch?"called_up":"present";setRecords(Object.fromEntries(eligible.map(x=>[x.id,saved[x.id]||def])))})},[]);async function save(){setSaving(true);await supabase.from("attendance").delete().eq("activity_id",activity.id);const rows=players.map(p=>({activity_id:activity.id,player_id:p.id,status:records[p.id]}));if(rows.length)await supabase.from("attendance").insert(rows);if(activity.status!=="completed")await supabase.from("activities").update({status:"completed"}).eq("id",activity.id);setSaving(false);onClose()}return <ModalShell title={isMatch?"Convocatoria":"Asistencia"} kicker={`${fmtDate(activity.activity_date)} · ${activity.title}`} onClose={onClose} className="attendance-modal"><div className="attendance-note">Todos aparecen <b>{isMatch?"convocados":"presentes"}</b> por defecto. Cambia solo las excepciones.</div><div className="attendance-list modal-scroll">{players.map(p=><div className="att-row" key={p.id}><span><b>{p.number??"—"}</b>{p.name}</span><div>{isMatch?<><button className={records[p.id]==="called_up"?"sel green":""} onClick={()=>setRecords(x=>({...x,[p.id]:"called_up"}))}>Convocado</button><button className={records[p.id]==="not_called_up"?"sel red":""} onClick={()=>setRecords(x=>({...x,[p.id]:"not_called_up"}))}>No convocado</button><button className={records[p.id]==="unavailable"?"sel amber":""} onClick={()=>setRecords(x=>({...x,[p.id]:"unavailable"}))}>No puede asistir</button></>:<><button className={records[p.id]==="present"?"sel green":""} onClick={()=>setRecords(x=>({...x,[p.id]:"present"}))}>Asiste</button><button className={records[p.id]==="absent"?"sel red":""} onClick={()=>setRecords(x=>({...x,[p.id]:"absent"}))}>No asiste</button></>}</div></div>)}</div><footer className="modal-footer"><button className="button ghost" onClick={onClose}>Cancelar</button><button className="button primary" onClick={save} disabled={saving}><Save/>{saving?"Guardando…":"Guardar"}</button></footer></ModalShell>}

async function syncActivities(){const {data:sessions}=await supabase.from("sessions").select("*").eq("team_id",TEAM_ID);for(const s of sessions||[])await ensureTrainingActivity(s);return sessions||[]}
function AttendancePage({matchesOnly=false}){const [activities,setActivities]=useState([]),[selected,setSelected]=useState(null),[loading,setLoading]=useState(true),[syncError,setSyncError]=useState("");async function load(){setLoading(true);await syncActivities();const err=await ensureSaturdayMatches();setSyncError(err?`No se pudieron generar los partidos automáticos: ${err}`:"");const {data,error}=await supabase.from("activities").select("*").eq("team_id",TEAM_ID).order("activity_date",{ascending:false});if(error)setSyncError(`No se pudieron cargar las actividades: ${error.message}`);setActivities((data||[]).filter(a=>a.status!=="cancelled"&&(matchesOnly?a.type==="match":true)));setLoading(false)}useEffect(()=>{load()},[matchesOnly]);return <><PageHead title={matchesOnly?"Convocatorias":"Asistencia"} kicker="Equipo" subtitle={matchesOnly?"Partidos programados":"Sesiones y partidos creados automáticamente"}/>{syncError&&<div className="error" style={{marginBottom:12}}>{syncError}</div>}{loading?<Empty text="Cargando…"/>:<div className="activity-table card"><table><thead><tr><th>Fecha</th><th>Actividad</th><th>Estado</th><th></th></tr></thead><tbody>{activities.map(a=><tr key={a.id}><td>{fmtDate(a.activity_date,true)}</td><td><b>{a.type==="match"?"⚽":"○"} {a.title}</b></td><td><span className={`status ${a.status==="completed"?"active":"planned"}`}>{a.status==="completed"?"Registrada":"Pendiente"}</span></td><td className="table-actions"><button className="button small primary" onClick={()=>setSelected(a)}>{a.type==="match"?"Convocatoria":"Asistencia"}</button></td></tr>)}</tbody></table></div>}{selected&&<AttendanceModal activity={selected} onClose={()=>{setSelected(null);load()}}/>}</>}

function AnalyticsPage(){const [players,setPlayers]=useState([]),[activities,setActivities]=useState([]),[attendance,setAttendance]=useState([]),[exercises,setExercises]=useState([]),[blocks,setBlocks]=useState([]);useEffect(()=>{Promise.all([supabase.from("players").select("*").eq("team_id",TEAM_ID),supabase.from("activities").select("*").eq("team_id",TEAM_ID),supabase.from("attendance").select("*,activities!inner(team_id)").eq("activities.team_id",TEAM_ID),supabase.from("exercises").select("*").eq("team_id",TEAM_ID),supabase.from("session_blocks").select("exercise_id,sessions!inner(team_id)").eq("sessions.team_id",TEAM_ID)]).then(([p,a,r,e,b])=>{setPlayers(p.data||[]);setActivities(a.data||[]);setAttendance(r.data||[]);setExercises(e.data||[]);setBlocks(b.data||[])})},[]);const completed=activities.filter(a=>a.status==="completed"),tr=completed.filter(a=>a.type==="training"),mt=completed.filter(a=>a.type==="match");const rec=(pid,aid)=>attendance.find(r=>r.player_id===pid&&r.activity_id===aid)?.status;const stats=players.map(p=>{const ta=tr.filter(a=>rec(p.id,a.id)),ma=mt.filter(a=>rec(p.id,a.id));const present=ta.filter(a=>rec(p.id,a.id)==="present").length,called=ma.filter(a=>rec(p.id,a.id)==="called_up").length;return{p,present,tt:ta.length,tp:ta.length?Math.round(present/ta.length*100):null,called,mt:ma.length,mp:ma.length?Math.round(called/ma.length*100):null,not:ma.filter(a=>rec(p.id,a.id)==="not_called_up").length,un:ma.filter(a=>rec(p.id,a.id)==="unavailable").length}});const usage=Object.values(blocks.reduce((o,b)=>{const e=exercises.find(x=>x.id===b.exercise_id);if(e){o[e.id]=o[e.id]||{e,count:0};o[e.id].count++}return o},{})).sort((a,b)=>b.count-a.count);return <><PageHead title="Análisis" kicker="Resumen" subtitle="Asistencia, convocatorias y uso de ejercicios"/><div className="analytics-top"><Kpi label="Entrenamientos" value={tr.length}/><Kpi label="Partidos" value={mt.length}/><Kpi label="Jugadores" value={players.filter(p=>p.active).length}/><Kpi label="Ejercicios usados" value={blocks.length}/></div><div className="analytics-two"><div className="card analysis-card"><h3>Ranking de ejercicios</h3>{usage.slice(0,10).map((x,i)=><div className="rank" key={x.e.id}><span>{i+1}</span><div><b>{x.e.name}</b><small>{x.e.type||""}</small></div><strong>{x.count}</strong></div>)}</div><div className="card analysis-card"><h3>Jugadores</h3><div className="mini-table"><table><thead><tr><th>Jugador</th><th>Entr.</th><th>Partidos</th></tr></thead><tbody>{stats.map(x=><tr key={x.p.id}><td>{x.p.number??"—"} · {x.p.name}</td><td>{x.tp==null?"—":`${x.tp}%`}</td><td>{x.mp==null?"—":`${x.mp}%`}</td></tr>)}</tbody></table></div></div></div></>}
function Kpi({label,value}){return <div className="kpi"><strong>{value}</strong><span>{label}</span></div>}

function Dashboard({setActive}){const [data,setData]=useState({ex:0,se:0,done:0,pl:0,next:null,match:null,avg:0});useEffect(()=>{(async()=>{const [e,s,p,a,r]=await Promise.all([supabase.from("exercises").select("*",{count:"exact",head:true}).eq("team_id",TEAM_ID),supabase.from("sessions").select("*").eq("team_id",TEAM_ID).order("session_date"),supabase.from("players").select("*").eq("team_id",TEAM_ID).eq("active",true),supabase.from("activities").select("*").eq("team_id",TEAM_ID).order("activity_date"),supabase.from("attendance").select("*,activities!inner(team_id,type,status)").eq("activities.team_id",TEAM_ID).eq("activities.type","training").eq("activities.status","completed")]);const today=iso(new Date()),sessions=s.data||[],acts=a.data||[],next=sessions.find(x=>x.session_date>=today&&x.status!=="completed"),match=acts.find(x=>x.type==="match"&&x.status!=="cancelled"&&x.activity_date>=today);const rows=r.data||[],avg=rows.length?Math.round(rows.filter(x=>x.status==="present").length/rows.length*100):0;setData({ex:e.count||0,se:sessions.length,done:sessions.filter(x=>x.status==="completed").length,pl:(p.data||[]).length,next,match,avg})})()},[]);const week=weekNumber(iso(new Date()));return <><PageHead title="Inicio" kicker={`BENJAMÍN C · ${SEASON_LABEL}`}/><div className="dashboard-grid"><section className="next-card card"><small>Próxima sesión</small><h2>{data.next?fmtDate(data.next.session_date,true):"Sin programar"}</h2><p>{data.next?.title||"Crea la siguiente sesión desde Planificación"}</p><button onClick={()=>setActive("planificacion")}>Abrir planificación →</button></section><section className="next-card card"><small>Próximo partido</small><h2>{data.match?fmtDate(data.match.activity_date,true):"Sin programar"}</h2><p>{data.match?.opponent?`vs ${data.match.opponent}`:"Partido de temporada"}</p><button onClick={()=>setActive("calendario")}>Abrir calendario →</button></section></div><div className="dashboard-kpis"><Kpi label="Temporada" value={SEASON_LABEL}/><Kpi label="Semana actual" value={week>=1?week:"—"}/><Kpi label="Ejercicios" value={data.ex}/><Kpi label="Jugadores" value={data.pl}/><Kpi label="Sesiones creadas" value={data.se}/><Kpi label="Sesiones realizadas" value={data.done}/><Kpi label="Asistencia media" value={`${data.avg}%`}/></div></>}

function Sidebar({active,setActive,open,setOpen}){
  return <aside className={open?"open":""}>
    <div className="brand"><img src="/logo-club.png" alt="Logo del club"/><div><small>Colegios Diocesanos</small><strong>BENJAMÍN C</strong></div></div>
    <nav>{MENU.map(item=>item.group
      ? <div className="nav-group" key={item.group}><div className="nav-title"><item.icon size={16}/><b>{item.group}</b></div>{item.children.map(c=><button className={active===c.id?"active":""} key={c.id} onClick={()=>{setActive(c.id);setOpen(false)}}>{c.label}</button>)}</div>
      : <button className={`root ${active===item.id?"active":""}`} key={item.id} onClick={()=>{setActive(item.id);setOpen(false)}}><item.icon size={17}/>{item.label}</button>
    )}</nav>
    <div className="app-identity" aria-label={`${APP_NAME}, versión ${APP_VERSION}, desarrollado por ${APP_DEVELOPER}`}>
      <div>{APP_NAME}</div>
      <div>v{APP_VERSION}</div>
      <div>Desarrollado por<br/><strong>{APP_DEVELOPER}</strong></div>
    </div>
  </aside>
}

function App(){const [active,setActive]=useState("inicio"),[open,setOpen]=useState(false);if(!configured)return <div className="fatal">Faltan las variables de Supabase.</div>;return <div className="app"><Sidebar active={active} setActive={setActive} open={open} setOpen={setOpen}/><div className="workspace"><header className="topbar"><button className="menu-btn" onClick={()=>setOpen(!open)}><Menu/></button><span>Programación entrenamientos · BENJAMÍN C</span></header><main>{active==="inicio"&&<Dashboard setActive={setActive}/>} {active==="planificacion"&&<PlanningPage/>} {active==="historico"&&<PlanningPage history/>} {active==="calendario"&&<CalendarPage/>} {active==="biblioteca"&&<Library/>} {active==="favoritos"&&<Library favorites/>} {active==="jugadores"&&<PlayersPage/>} {active==="asistencia"&&<AttendancePage/>} {active==="convocatorias"&&<AttendancePage matchesOnly/>} {active==="estadisticas"&&<AnalyticsPage/>}</main></div>{open&&<button className="scrim" onClick={()=>setOpen(false)}/>}</div>}
createRoot(document.getElementById("root")).render(<App/>);
