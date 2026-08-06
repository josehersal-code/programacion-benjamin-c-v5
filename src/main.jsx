import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen, CalendarDays, ClipboardList, Home, Image as ImageIcon, Menu,
  Pencil, Plus, RefreshCw, Search, Settings, ShieldCheck, Trash2,
  TrendingUp, Users, X
} from "lucide-react";
import { configured, supabase, TEAM_ID } from "./lib/supabase";
import "./styles.css";

const NAV = [
  ["inicio","Inicio",Home],
  ["biblioteca","Biblioteca",BookOpen],
  ["temporada","Temporada",CalendarDays],
  ["sesiones","Sesiones",ClipboardList],
  ["jugadores","Jugadores",Users],
  ["asistencia","Asistencia",ShieldCheck],
  ["analisis","Análisis",TrendingUp],
  ["configuracion","Configuración",Settings],
];

const PARTS = [
  ["calentamiento","Calentamiento"],
  ["inicial","Parte inicial"],
  ["principal","Parte principal"],
  ["partido","Partido / estrategia"],
  ["vuelta","Vuelta a la calma"],
];
const PART_LABEL = Object.fromEntries(PARTS);
const DIFF_LABEL = {baja:"Baja",media:"Media",alta:"Alta"};

function resizeImage(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=reject;
    reader.onload=()=>{
      const img=new Image();
      img.onerror=reject;
      img.onload=()=>{
        const max=1100;
        let w=img.width,h=img.height;
        if(w>max){h=Math.round(h*max/w);w=max}
        if(h>max){w=Math.round(w*max/h);h=max}
        const c=document.createElement("canvas");
        c.width=w;c.height=h;
        c.getContext("2d").drawImage(img,0,0,w,h);
        resolve(c.toDataURL("image/jpeg",.78));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function Modal({exercise,onClose,onSaved}){
  const [form,setForm]=useState(exercise||{
    name:"",type:"",difficulty:"baja",part:"inicial",description:"",image_url:""
  });
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const set=(k,v)=>setForm(x=>({...x,[k]:v}));

  async function chooseImage(e){
    const f=e.target.files?.[0];
    if(!f)return;
    try{set("image_url",await resizeImage(f))}
    catch{setError("No se pudo procesar la imagen")}
  }

  async function save(e){
    e.preventDefault();
    if(!form.name.trim()) return setError("Escribe un nombre");
    setBusy(true);setError("");
    const payload={
      team_id:TEAM_ID,
      name:form.name.trim(),
      type:form.type.trim()||null,
      difficulty:form.difficulty,
      part:form.part,
      description:form.description.trim()||null,
      image_url:form.image_url||null,
    };
    const q=exercise?.id
      ? supabase.from("exercises").update(payload).eq("id",exercise.id)
      : supabase.from("exercises").insert(payload);
    const {error}=await q;
    setBusy(false);
    if(error)return setError(error.message);
    onSaved();
  }

  return <div className="backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal">
      <header><div><small>{exercise?"Editar":"Nuevo"}</small><h2>Ejercicio</h2></div>
        <button className="icon" onClick={onClose}><X/></button></header>
      <form className="form" onSubmit={save}>
        <label className="full">Nombre<input value={form.name} onChange={e=>set("name",e.target.value)} /></label>
        <label>Parte<select value={form.part} onChange={e=>set("part",e.target.value)}>
          {PARTS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
        </select></label>
        <label>Dificultad<select value={form.difficulty} onChange={e=>set("difficulty",e.target.value)}>
          <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option>
        </select></label>
        <label className="full">Tipología<input value={form.type||""} onChange={e=>set("type",e.target.value)} /></label>
        <label className="full">Descripción<textarea rows="6" value={form.description||""} onChange={e=>set("description",e.target.value)} /></label>
        <div className="full upload-wrap">
          <span>Imagen</span>
          <label className="upload"><ImageIcon size={18}/>Seleccionar imagen<input hidden type="file" accept="image/*" onChange={chooseImage}/></label>
          {form.image_url&&<div className="preview"><img src={form.image_url}/><button type="button" onClick={()=>set("image_url","")}>Quitar imagen</button></div>}
        </div>
        {error&&<div className="error full">{error}</div>}
        <footer className="full"><button type="button" className="secondary" onClick={onClose}>Cancelar</button>
          <button className="primary" disabled={busy}>{busy?"Guardando…":"Guardar"}</button></footer>
      </form>
    </div>
  </div>
}

function Library({onCount}){
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [query,setQuery]=useState("");
  const [part,setPart]=useState("");
  const [diff,setDiff]=useState("");
  const [editing,setEditing]=useState(undefined);
  const [zoom,setZoom]=useState("");

  async function load(){
    if(!configured){setError("Faltan las variables de Supabase");setLoading(false);return}
    setLoading(true);setError("");
    const {data,error}=await supabase.from("exercises").select("*")
      .eq("team_id",TEAM_ID).order("created_at",{ascending:false});
    setLoading(false);
    if(error)return setError(error.message);
    setItems(data||[]);onCount(data?.length||0);
  }
  useEffect(()=>{load()},[]);

  async function remove(ex){
    if(!confirm(`¿Eliminar "${ex.name}"?`))return;
    const {error}=await supabase.from("exercises").delete().eq("id",ex.id);
    if(error)return alert(error.message);
    load();
  }

  const filtered=useMemo(()=>items.filter(ex=>{
    const q=query.toLowerCase().trim();
    return (!q||ex.name.toLowerCase().includes(q)||(ex.type||"").toLowerCase().includes(q))
      &&(!part||ex.part===part)&&(!diff||ex.difficulty===diff);
  }),[items,query,part,diff]);

  return <>
    <div className="section-head">
      <div><h2>Biblioteca de ejercicios</h2><p>Ejercicios compartidos del Benjamín C.</p></div>
      <button className="primary with-icon" onClick={()=>setEditing(null)}><Plus size={18}/>Nuevo ejercicio</button>
    </div>
    <div className="filters panel">
      <label className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar…"/></label>
      <select value={part} onChange={e=>setPart(e.target.value)}><option value="">Todas las partes</option>{PARTS.map(([v,l])=><option value={v} key={v}>{l}</option>)}</select>
      <select value={diff} onChange={e=>setDiff(e.target.value)}><option value="">Todas las dificultades</option><option>baja</option><option>media</option><option>alta</option></select>
      <button className="secondary with-icon" onClick={load}><RefreshCw size={17}/>Actualizar</button>
    </div>
    {error&&<div className="error">{error}</div>}
    {loading?<div className="empty">Cargando…</div>:filtered.length===0?<div className="empty panel"><BookOpen size={36}/><h3>No hay ejercicios</h3><p>Crea el primero.</p></div>:
    <div className="grid">
      {filtered.map(ex=><article className="card" key={ex.id}>
        <button className="card-img" onClick={()=>ex.image_url&&setZoom(ex.image_url)}>
          {ex.image_url?<img src={ex.image_url}/>:<span><ImageIcon/>Sin imagen</span>}
        </button>
        <div className="card-body"><h3>{ex.name}</h3>
          <div className="tags"><span>{PART_LABEL[ex.part]}</span>{ex.type&&<span>{ex.type}</span>}<span className={ex.difficulty}>{DIFF_LABEL[ex.difficulty]}</span></div>
          <p>{ex.description||"Sin descripción."}</p>
          <div className="card-actions"><button className="secondary with-icon" onClick={()=>setEditing(ex)}><Pencil size={16}/>Editar</button>
            <button className="danger" onClick={()=>remove(ex)}><Trash2 size={17}/></button></div>
        </div>
      </article>)}
    </div>}
    {editing!==undefined&&<Modal exercise={editing} onClose={()=>setEditing(undefined)} onSaved={()=>{setEditing(undefined);load()}}/>}
    {zoom&&<div className="zoom" onClick={()=>setZoom("")}><button><X/></button><img src={zoom} onClick={e=>e.stopPropagation()}/></div>}
  </>
}

function Placeholder({title,text}){
  return <div className="placeholder panel"><h2>{title}</h2><p>{text}</p></div>
}

function App(){
  const [active,setActive]=useState("inicio");
  const [open,setOpen]=useState(false);
  const [count,setCount]=useState(0);
  const current=NAV.find(([id])=>id===active);

  return <div className="app">
    <aside className={open?"open":""}>
      <div className="brand"><img src="/logo-club.png"/><div><small>Colegios Diocesanos</small><strong>BENJAMÍN C</strong></div></div>
      <nav>{NAV.map(([id,label,Icon])=><button key={id} className={active===id?"active":""} onClick={()=>{setActive(id);setOpen(false)}}><Icon size={19}/>{label}</button>)}</nav>
      <div className="aside-note">Temporada 2026-2027</div>
    </aside>
    <div className="workspace">
      <header><button className="menu" onClick={()=>setOpen(!open)}><Menu/></button><div><small>Programación</small><h1>{current?.[1]}</h1></div><span>BENJAMÍN C</span></header>
      <main>
        {active==="inicio"&&<>
          <section className="hero panel"><div><small>Planificador de entrenamientos Fútbol 7</small><h2>Temporada 2026-2027</h2><p>Aplicación sencilla para un único equipo.</p></div><b>BENJAMÍN C</b></section>
          <div className="stats"><article><strong>{count}</strong><span>Ejercicios</span></article><article><strong>0</strong><span>Mesociclos</span></article><article><strong>0</strong><span>Sesiones</span></article><article><strong>0</strong><span>Jugadores</span></article></div>
        </>}
        {active==="biblioteca"&&<Library onCount={setCount}/>}
        {active==="temporada"&&<Placeholder title="Temporada" text="Mesociclos y calendario se añadirán en el siguiente paso."/>}
        {active==="sesiones"&&<Placeholder title="Sesiones" text="Constructor sencillo de sesiones."/>}
        {active==="jugadores"&&<Placeholder title="Jugadores" text="Listado de jugadores."/>}
        {active==="asistencia"&&<Placeholder title="Asistencia" text="Entrenamientos y convocatorias."/>}
        {active==="analisis"&&<Placeholder title="Análisis" text="Porcentajes básicos."/>}
        {active==="configuracion"&&<Placeholder title="Configuración" text="Datos del equipo."/>}
      </main>
    </div>
    {open&&<button className="scrim" onClick={()=>setOpen(false)}/>}
  </div>
}
createRoot(document.getElementById("root")).render(<App/>);
