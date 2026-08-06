import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen, CalendarDays, ChevronDown, ClipboardList, History, Home,
  Image as ImageIcon, LayoutDashboard, Menu, Pencil, Plus, RefreshCw,
  Search, Settings, ShieldCheck, Star, Trash2, TrendingUp, UserRound,
  Users, X
} from "lucide-react";
import { configured, supabase, TEAM_ID } from "./lib/supabase";
import "./styles.css";

const PARTS = [
  ["calentamiento","Calentamiento"],
  ["inicial","Parte inicial"],
  ["principal","Parte principal"],
  ["partido","Partido / estrategia"],
  ["vuelta","Vuelta a la calma"],
];
const PART_LABEL = Object.fromEntries(PARTS);
const DIFF_LABEL = {baja:"Baja",media:"Media",alta:"Alta"};

const MENU = [
  {id:"inicio",label:"Inicio",icon:Home},
  {group:"Temporada",icon:CalendarDays,children:[
    {id:"mesociclos",label:"Mesociclos"},
    {id:"calendario",label:"Calendario"},
  ]},
  {group:"Sesiones",icon:ClipboardList,children:[
    {id:"planificador",label:"Planificador"},
    {id:"historial",label:"Historial"},
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
  {id:"estadisticas",label:"Estadísticas",icon:TrendingUp},
  {id:"configuracion",label:"Configuración",icon:Settings},
];

function resizeImage(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=reject;
    reader.onload=()=>{
      const img=new Image();
      img.onerror=reject;
      img.onload=()=>{
        const max=1200;
        let w=img.width,h=img.height;
        if(w>max){h=Math.round(h*max/w);w=max}
        if(h>max){w=Math.round(w*max/h);h=max}
        const c=document.createElement("canvas");
        c.width=w;c.height=h;
        c.getContext("2d").drawImage(img,0,0,w,h);
        resolve(c.toDataURL("image/jpeg",.8));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function ExerciseModal({exercise,onClose,onSaved}){
  const [form,setForm]=useState(exercise||{
    name:"",type:"",difficulty:"baja",part:"inicial",description:"",image_url:"",favorite:false
  });
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const set=(k,v)=>setForm(x=>({...x,[k]:v}));

  async function chooseImage(e){
    const file=e.target.files?.[0];
    if(!file)return;
    try{set("image_url",await resizeImage(file))}
    catch{setError("No se pudo procesar la imagen.")}
  }

  async function save(e){
    e.preventDefault();
    setError("");
    if(!form.name.trim()) return setError("Escribe un nombre para el ejercicio.");
    setBusy(true);
    const payload={
      team_id:TEAM_ID,
      name:form.name.trim(),
      type:form.type.trim()||null,
      difficulty:form.difficulty,
      part:form.part,
      description:form.description.trim()||null,
      image_url:form.image_url||null,
      favorite:Boolean(form.favorite),
    };
    let query=exercise?.id
      ? supabase.from("exercises").update(payload).eq("id",exercise.id)
      : supabase.from("exercises").insert(payload);
    let {error}=await query;
    if(error && error.message.toLowerCase().includes("favorite")){
      delete payload.favorite;
      query=exercise?.id
        ? supabase.from("exercises").update(payload).eq("id",exercise.id)
        : supabase.from("exercises").insert(payload);
      ({error}=await query);
    }
    setBusy(false);
    if(error)return setError(error.message);
    onSaved();
  }

  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal">
      <header className="modal-head">
        <div><small>{exercise?"Editar ejercicio":"Nuevo ejercicio"}</small><h2>Ficha del ejercicio</h2></div>
        <button className="icon-button" onClick={onClose}><X/></button>
      </header>
      <form className="exercise-form" onSubmit={save}>
        <label className="full">Nombre
          <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Ej. Posesión 5x2 + transición"/>
        </label>
        <label>Parte de la sesión
          <select value={form.part} onChange={e=>set("part",e.target.value)}>
            {PARTS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label>Dificultad
          <select value={form.difficulty} onChange={e=>set("difficulty",e.target.value)}>
            <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option>
          </select>
        </label>
        <label className="full">Tipología
          <input value={form.type||""} onChange={e=>set("type",e.target.value)} placeholder="Posesión, circuito técnico, finalización…"/>
        </label>
        <label className="full">Descripción
          <textarea rows="7" value={form.description||""} onChange={e=>set("description",e.target.value)} placeholder="Organización, desarrollo, consignas y variantes…"/>
        </label>
        <label className="favorite-check full">
          <input type="checkbox" checked={Boolean(form.favorite)} onChange={e=>set("favorite",e.target.checked)}/>
          <Star size={18}/> Marcar como favorito
        </label>
        <div className="image-field full">
          <span>Imagen del ejercicio</span>
          <label className="upload-button"><ImageIcon size={18}/>Seleccionar imagen
            <input hidden type="file" accept="image/*" onChange={chooseImage}/>
          </label>
          {form.image_url&&<div className="image-preview">
            <img src={form.image_url} alt="Vista previa"/>
            <button type="button" onClick={()=>set("image_url","")}>Quitar imagen</button>
          </div>}
        </div>
        {error&&<div className="error full">{error}</div>}
        <footer className="form-footer full">
          <button type="button" className="button secondary" onClick={onClose}>Cancelar</button>
          <button className="button primary" disabled={busy}>{busy?"Guardando…":"Guardar ejercicio"}</button>
        </footer>
      </form>
    </div>
  </div>
}

function Library({favoritesOnly=false,onCount}){
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [query,setQuery]=useState("");
  const [part,setPart]=useState("");
  const [diff,setDiff]=useState("");
  const [editing,setEditing]=useState(undefined);
  const [zoom,setZoom]=useState("");

  async function load(){
    if(!configured){setError("Faltan las variables de Supabase en Netlify.");setLoading(false);return}
    setLoading(true);setError("");
    const {data,error}=await supabase.from("exercises").select("*").eq("team_id",TEAM_ID).order("created_at",{ascending:false});
    setLoading(false);
    if(error)return setError(error.message);
    setItems(data||[]);onCount?.(data?.length||0);
  }
  useEffect(()=>{load()},[]);

  async function remove(ex){
    if(!confirm(`¿Eliminar "${ex.name}"?`))return;
    const {error}=await supabase.from("exercises").delete().eq("id",ex.id);
    if(error)return alert(error.message);
    load();
  }

  async function toggleFavorite(ex){
    if(!("favorite" in ex)){
      alert("Para activar favoritos hay que añadir primero la columna favorite en Supabase. La biblioteca funciona sin ella.");
      return;
    }
    const {error}=await supabase.from("exercises").update({favorite:!ex.favorite}).eq("id",ex.id);
    if(error)return alert(error.message);
    load();
  }

  const filtered=useMemo(()=>items.filter(ex=>{
    const q=query.toLowerCase().trim();
    return (!q||ex.name.toLowerCase().includes(q)||(ex.type||"").toLowerCase().includes(q))
      &&(!part||ex.part===part)&&(!diff||ex.difficulty===diff)
      &&(!favoritesOnly||Boolean(ex.favorite));
  }),[items,query,part,diff,favoritesOnly]);

  return <>
    <div className="page-title-row">
      <div><p className="overline">Biblioteca</p><h2>{favoritesOnly?"Ejercicios favoritos":"Ejercicios"}</h2>
        <p className="subtext">Biblioteca compartida del Benjamín C.</p></div>
      {!favoritesOnly&&<button className="button primary icon-text" onClick={()=>setEditing(null)}><Plus size={18}/>Nuevo ejercicio</button>}
    </div>
    <section className="filters card-panel">
      <label className="search-field"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nombre o tipología…"/></label>
      <select value={part} onChange={e=>setPart(e.target.value)}><option value="">Todas las partes</option>{PARTS.map(([v,l])=><option value={v} key={v}>{l}</option>)}</select>
      <select value={diff} onChange={e=>setDiff(e.target.value)}><option value="">Todas las dificultades</option><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select>
      <button className="button secondary icon-text" onClick={load}><RefreshCw size={17}/>Actualizar</button>
    </section>
    {error&&<div className="error">{error}</div>}
    {loading?<div className="empty">Cargando ejercicios…</div>:filtered.length===0?<section className="empty card-panel"><BookOpen size={38}/><h3>No hay ejercicios</h3><p>{favoritesOnly?"Todavía no hay ejercicios favoritos.":"Crea el primero con el botón “Nuevo ejercicio”."}</p></section>:
    <section className="exercise-grid">
      {filtered.map(ex=><article className="exercise-card" key={ex.id}>
        <div className="image-wrap">
          <button className="exercise-image" onClick={()=>ex.image_url&&setZoom(ex.image_url)}>
            {ex.image_url?<img src={ex.image_url} alt={ex.name}/>:<span><ImageIcon/>Sin imagen</span>}
          </button>
          <button className={`favorite-button ${ex.favorite?"active":""}`} onClick={()=>toggleFavorite(ex)} title="Favorito"><Star size={18} fill={ex.favorite?"currentColor":"none"}/></button>
        </div>
        <div className="exercise-content">
          <h3>{ex.name}</h3>
          <div className="tags"><span>{PART_LABEL[ex.part]||ex.part}</span>{ex.type&&<span>{ex.type}</span>}<span className={`difficulty ${ex.difficulty}`}>{DIFF_LABEL[ex.difficulty]||ex.difficulty}</span></div>
          <p>{ex.description||"Sin descripción."}</p>
          <div className="exercise-actions">
            <button className="button secondary icon-text" onClick={()=>setEditing(ex)}><Pencil size={16}/>Editar</button>
            <button className="delete-button" onClick={()=>remove(ex)}><Trash2 size={17}/></button>
          </div>
        </div>
      </article>)}
    </section>}
    {editing!==undefined&&<ExerciseModal exercise={editing} onClose={()=>setEditing(undefined)} onSaved={()=>{setEditing(undefined);load()}}/>}
    {zoom&&<div className="zoom" onClick={()=>setZoom("")}><button><X/></button><img src={zoom} alt="Imagen ampliada" onClick={e=>e.stopPropagation()}/></div>}
  </>
}

function Placeholder({title,text}){
  return <section className="placeholder card-panel"><h2>{title}</h2><p>{text}</p></section>
}

function Dashboard({counts,setActive}){
  const stats=[
    {label:"Ejercicios",value:counts.exercises,color:"blue",icon:BookOpen},
    {label:"Mesociclos",value:0,color:"green",icon:CalendarDays},
    {label:"Sesiones",value:0,color:"purple",icon:ClipboardList},
    {label:"Jugadores",value:0,color:"orange",icon:Users},
  ];
  const quick=[
    {label:"Nueva sesión",note:"Crear una nueva sesión",icon:Plus,target:"planificador",color:"blue"},
    {label:"Ver calendario",note:"Ver entrenamientos y partidos",icon:CalendarDays,target:"calendario",color:"green"},
    {label:"Buscar ejercicios",note:"Buscar en la biblioteca",icon:Search,target:"biblioteca",color:"purple"},
    {label:"Gestionar jugadores",note:"Ver y editar jugadores",icon:Users,target:"jugadores",color:"orange"},
  ];
  return <>
    <section className="hero card-panel">
      <div><p>Planificador de entrenamientos Fútbol 7</p><h2>Temporada 2026-2027</h2></div>
      <strong>BENJAMÍN C</strong>
    </section>
    <section className="stats-grid">{stats.map(({label,value,color,icon:Icon})=><article className="stat-card" key={label}>
      <div><strong className={color}>{value}</strong><span>{label}</span></div><i className={color}><Icon size={28}/></i>
    </article>)}</section>
    <section className="quick-panel card-panel"><h3>Accesos rápidos</h3><div className="quick-grid">
      {quick.map(({label,note,icon:Icon,target,color})=><button key={label} onClick={()=>setActive(target)}>
        <i className={color}><Icon size={25}/></i><span><b>{label}</b><small>{note}</small></span>
      </button>)}
    </div></section>
  </>
}

function Sidebar({active,setActive,open,setOpen}){
  return <aside className={open?"open":""}>
    <div className="brand"><img src="/logo-club.png" alt="Logo"/><div><small>Colegios Diocesanos</small><strong>BENJAMÍN C</strong></div></div>
    <nav>
      {MENU.map((item,index)=>{
        if(item.group){
          const Icon=item.icon;
          return <div className="nav-group" key={item.group}>
            <div className="nav-group-title"><Icon size={19}/><b>{item.group}</b></div>
            {item.children.map(child=><button key={child.id} className={active===child.id?"child active": "child"} onClick={()=>{setActive(child.id);setOpen(false)}}>{child.label}</button>)}
          </div>
        }
        const Icon=item.icon;
        return <button key={item.id} className={active===item.id?"top active":"top"} onClick={()=>{setActive(item.id);setOpen(false)}}><Icon size={19}/>{item.label}</button>
      })}
    </nav>
    <div className="team-select">BENJAMÍN C <ChevronDown size={16}/></div>
  </aside>
}

function App(){
  const [active,setActive]=useState("inicio");
  const [open,setOpen]=useState(false);
  const [counts,setCounts]=useState({exercises:0});
  const labels={
    inicio:"Inicio",mesociclos:"Mesociclos",calendario:"Calendario",planificador:"Planificador",
    historial:"Historial",biblioteca:"Ejercicios",favoritos:"Favoritos",jugadores:"Jugadores",
    asistencia:"Asistencia",convocatorias:"Convocatorias",estadisticas:"Estadísticas",configuracion:"Configuración"
  };

  return <div className="app">
    <Sidebar active={active} setActive={setActive} open={open} setOpen={setOpen}/>
    <div className="workspace">
      <header className="topbar"><button className="menu-button" onClick={()=>setOpen(!open)}><Menu/></button>
        <div><small>Programación</small><h1>{labels[active]||"Inicio"}</h1></div><span>BENJAMÍN C <ChevronDown size={16}/></span>
      </header>
      <main>
        {active==="inicio"&&<Dashboard counts={counts} setActive={setActive}/>}
        {active==="biblioteca"&&<Library onCount={n=>setCounts({exercises:n})}/>}
        {active==="favoritos"&&<Library favoritesOnly onCount={n=>setCounts({exercises:n})}/>}
        {active==="mesociclos"&&<Placeholder title="Mesociclos" text="Se desarrollará en la fase 2."/>}
        {active==="calendario"&&<Placeholder title="Calendario" text="Se desarrollará en la fase 2."/>}
        {active==="planificador"&&<Placeholder title="Planificador de sesiones" text="Se desarrollará en la fase 3."/>}
        {active==="historial"&&<Placeholder title="Historial de sesiones" text="Se desarrollará en la fase 3."/>}
        {active==="jugadores"&&<Placeholder title="Jugadores" text="Se desarrollará en la fase 4."/>}
        {active==="asistencia"&&<Placeholder title="Asistencia" text="Se desarrollará en la fase 5."/>}
        {active==="convocatorias"&&<Placeholder title="Convocatorias" text="Se desarrollará en la fase 5."/>}
        {active==="estadisticas"&&<Placeholder title="Estadísticas" text="Se desarrollará en la fase 6."/>}
        {active==="configuracion"&&<Placeholder title="Configuración" text="Datos generales del equipo."/>}
      </main>
    </div>
    {open&&<button className="scrim" onClick={()=>setOpen(false)}/>}
  </div>
}
createRoot(document.getElementById("root")).render(<App/>);
