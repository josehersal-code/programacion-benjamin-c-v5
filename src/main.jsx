import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen, CalendarDays, ChevronDown, ClipboardList, History, Home,
  Image as ImageIcon, LayoutDashboard, Menu, Pencil, Plus, RefreshCw,
  Search, Settings, ShieldCheck, Star, Trash2, TrendingUp, UserRound,
  Users, X, Save, ChevronLeft, ChevronRight, CalendarPlus, Printer, Eye, Copy, Check
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


function MesocycleModal({item,onClose,onSaved}){
  const [form,setForm]=useState(item||{
    name:"",start_date:"",end_date:"",objectives:"",sort_order:0
  });
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const set=(k,v)=>setForm(x=>({...x,[k]:v}));

  async function save(e){
    e.preventDefault();
    setError("");
    if(!form.name.trim()) return setError("Escribe el nombre del mesociclo.");
    if(form.start_date && form.end_date && form.end_date<form.start_date){
      return setError("La fecha final no puede ser anterior a la inicial.");
    }
    setBusy(true);
    const payload={
      team_id:TEAM_ID,
      name:form.name.trim(),
      start_date:form.start_date||null,
      end_date:form.end_date||null,
      objectives:form.objectives.trim()||null,
      sort_order:Number(form.sort_order)||0,
    };
    const query=item?.id
      ? supabase.from("mesocycles").update(payload).eq("id",item.id)
      : supabase.from("mesocycles").insert(payload);
    const {error}=await query;
    setBusy(false);
    if(error)return setError(error.message);
    onSaved();
  }

  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal mesocycle-modal">
      <header className="modal-head">
        <div><small>{item?"Editar mesociclo":"Nuevo mesociclo"}</small><h2>Planificación del periodo</h2></div>
        <button className="icon-button" onClick={onClose}><X/></button>
      </header>
      <form className="exercise-form" onSubmit={save}>
        <label className="full">Nombre
          <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Ej. Mesociclo 1 · Adaptación"/>
        </label>
        <label>Fecha de inicio
          <input type="date" value={form.start_date||""} onChange={e=>set("start_date",e.target.value)}/>
        </label>
        <label>Fecha final
          <input type="date" value={form.end_date||""} onChange={e=>set("end_date",e.target.value)}/>
        </label>
        <label className="full">Objetivos
          <textarea rows="7" value={form.objectives||""} onChange={e=>set("objectives",e.target.value)}
            placeholder="Objetivo general y objetivos específicos del mesociclo…"/>
        </label>
        {error&&<div className="error full">{error}</div>}
        <footer className="form-footer full">
          <button type="button" className="button secondary" onClick={onClose}>Cancelar</button>
          <button className="button primary icon-text" disabled={busy}><Save size={17}/>{busy?"Guardando…":"Guardar mesociclo"}</button>
        </footer>
      </form>
    </div>
  </div>
}

function formatDate(value){
  if(!value)return "Sin fecha";
  return new Intl.DateTimeFormat("es-ES",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value+"T12:00:00"));
}

function Mesocycles({onCount}){
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [editing,setEditing]=useState(undefined);

  async function load(){
    setLoading(true);setError("");
    const {data,error}=await supabase.from("mesocycles").select("*")
      .eq("team_id",TEAM_ID).order("sort_order").order("start_date");
    setLoading(false);
    if(error)return setError(error.message);
    setItems(data||[]);onCount?.(data?.length||0);
  }
  useEffect(()=>{load()},[]);

  async function remove(item){
    if(!confirm(`¿Eliminar "${item.name}"? Las sesiones vinculadas conservarán su fecha, pero quedarán sin mesociclo.`))return;
    const {error}=await supabase.from("mesocycles").delete().eq("id",item.id);
    if(error)return alert(error.message);
    load();
  }

  return <>
    <div className="page-title-row">
      <div><p className="overline">Temporada</p><h2>Mesociclos</h2>
        <p className="subtext">Divide la temporada en los periodos que necesites y modifica fechas y objetivos.</p></div>
      <button className="button primary icon-text" onClick={()=>setEditing(null)}><Plus size={18}/>Añadir mesociclo</button>
    </div>
    {error&&<div className="error">{error}</div>}
    {loading?<div className="empty">Cargando mesociclos…</div>:items.length===0?
      <section className="empty card-panel"><CalendarDays size={38}/><h3>No hay mesociclos</h3><p>Crea el primero para comenzar la planificación.</p></section>:
      <section className="mesocycle-grid">
        {items.map((item,index)=><article className="mesocycle-card card-panel" key={item.id}>
          <div className={`mesocycle-number tone-${index%4}`}>{index+1}</div>
          <div className="mesocycle-main">
            <div className="mesocycle-title"><div><small>MESOCICLO {index+1}</small><h3>{item.name}</h3></div>
              <div className="mesocycle-actions">
                <button className="icon-button bordered" onClick={()=>setEditing(item)} title="Editar"><Pencil size={17}/></button>
                <button className="delete-button" onClick={()=>remove(item)} title="Eliminar"><Trash2 size={17}/></button>
              </div>
            </div>
            <div className="date-range"><CalendarDays size={17}/><span>{formatDate(item.start_date)} — {formatDate(item.end_date)}</span></div>
            <div className="objective-box"><b>Objetivos</b><p>{item.objectives||"Sin objetivos definidos."}</p></div>
          </div>
        </article>)}
      </section>}
    {editing!==undefined&&<MesocycleModal item={editing} onClose={()=>setEditing(undefined)} onSaved={()=>{setEditing(undefined);load()}}/>}
  </>
}

function monthKey(date){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
}
function toISO(date){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function SeasonCalendar(){
  const [month,setMonth]=useState(new Date(2026,8,1));
  const [mesocycles,setMesocycles]=useState([]);
  const [sessions,setSessions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  async function load(){
    setLoading(true);setError("");
    const start=new Date(month.getFullYear(),month.getMonth(),1);
    const end=new Date(month.getFullYear(),month.getMonth()+1,0);
    const [m,s]=await Promise.all([
      supabase.from("mesocycles").select("*").eq("team_id",TEAM_ID).order("sort_order"),
      supabase.from("sessions").select("*").eq("team_id",TEAM_ID)
        .gte("session_date",toISO(start)).lte("session_date",toISO(end)).order("session_date")
    ]);
    setLoading(false);
    if(m.error||s.error)return setError((m.error||s.error).message);
    setMesocycles(m.data||[]);setSessions(s.data||[]);
  }
  useEffect(()=>{load()},[month]);

  const cells=useMemo(()=>{
    const first=new Date(month.getFullYear(),month.getMonth(),1);
    const last=new Date(month.getFullYear(),month.getMonth()+1,0);
    const mondayIndex=(first.getDay()+6)%7;
    const list=[];
    for(let i=0;i<mondayIndex;i++)list.push(null);
    for(let d=1;d<=last.getDate();d++)list.push(new Date(month.getFullYear(),month.getMonth(),d));
    while(list.length%7)list.push(null);
    return list;
  },[month]);

  function cycleFor(iso){
    return mesocycles.find(m=>(!m.start_date||iso>=m.start_date)&&(!m.end_date||iso<=m.end_date));
  }

  return <>
    <div className="page-title-row">
      <div><p className="overline">Temporada</p><h2>Calendario</h2>
        <p className="subtext">Vista mensual de los mesociclos y de las sesiones que se crearán en la siguiente fase.</p></div>
      <button className="button secondary icon-text" onClick={load}><RefreshCw size={17}/>Actualizar</button>
    </div>
    <section className="calendar-panel card-panel">
      <header className="calendar-toolbar">
        <button className="icon-button bordered" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft/></button>
        <h3>{new Intl.DateTimeFormat("es-ES",{month:"long",year:"numeric"}).format(month)}</h3>
        <button className="icon-button bordered" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight/></button>
      </header>
      {error&&<div className="error">{error}</div>}
      {loading?<div className="empty">Cargando calendario…</div>:<>
        <div className="weekday-row">{["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(x=><b key={x}>{x}</b>)}</div>
        <div className="calendar-grid">
          {cells.map((date,index)=>{
            if(!date)return <div className="calendar-cell empty-day" key={`e${index}`}/>;
            const iso=toISO(date), cycle=cycleFor(iso);
            const daySessions=sessions.filter(s=>s.session_date===iso);
            return <div className="calendar-cell" key={iso}>
              <span className="day-number">{date.getDate()}</span>
              {cycle&&<div className="cycle-pill">{cycle.name}</div>}
              {daySessions.map(s=><div className="session-pill" key={s.id}>Sesión {s.kind}{s.title?` · ${s.title}`:""}</div>)}
            </div>
          })}
        </div>
      </>}
    </section>
    <section className="calendar-legend card-panel">
      <span><i className="legend-cycle"/>Mesociclo activo</span>
      <span><i className="legend-session"/>Sesión programada</span>
    </section>
  </>
}



const SESSION_PARTS = [
  {id:"calentamiento",label:"Calentamiento",time:"5-10 min"},
  {id:"inicial",label:"Parte inicial",time:"15-20 min"},
  {id:"principal",label:"Parte principal",time:"15-20 min"},
  {id:"partido",label:"Partido / estrategia",time:"10-15 min"},
  {id:"vuelta",label:"Vuelta a la calma",time:"5-10 min"},
];

function ExercisePicker({part,selectedId,onChoose,onClose}){
  const [items,setItems]=useState([]);
  const [query,setQuery]=useState("");
  const [diff,setDiff]=useState("");
  const [loading,setLoading]=useState(true);
  const [zoom,setZoom]=useState("");

  useEffect(()=>{
    supabase.from("exercises").select("*").eq("team_id",TEAM_ID).order("name")
      .then(({data})=>{setItems(data||[]);setLoading(false)});
  },[]);

  const filtered=useMemo(()=>items.filter(ex=>{
    const q=query.trim().toLowerCase();
    return (!q||ex.name.toLowerCase().includes(q)||(ex.type||"").toLowerCase().includes(q))
      &&(!diff||ex.difficulty===diff)
      &&(ex.part===part||true);
  }).sort((a,b)=>{
    const ap=a.part===part?0:1,bp=b.part===part?0:1;
    return ap-bp||a.name.localeCompare(b.name);
  }),[items,query,diff,part]);

  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal picker-modal">
      <header className="modal-head">
        <div><small>Elegir ejercicio</small><h2>{PART_LABEL[part]||part}</h2></div>
        <button className="icon-button" onClick={onClose}><X/></button>
      </header>
      <div className="picker-tools">
        <label className="search-field"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nombre o tipología…"/></label>
        <select value={diff} onChange={e=>setDiff(e.target.value)}>
          <option value="">Todas las dificultades</option>
          <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option>
        </select>
      </div>
      <div className="picker-scroll">
        {loading?<div className="empty">Cargando ejercicios…</div>:
        <div className="picker-grid">
          {filtered.map(ex=><article className={`picker-card ${selectedId===ex.id?"selected":""}`} key={ex.id}>
            <button className="picker-image" type="button" onClick={()=>ex.image_url&&setZoom(ex.image_url)}>
              {ex.image_url?<img src={ex.image_url} alt={ex.name}/>:<span><ImageIcon/>Sin imagen</span>}
            </button>
            <div className="picker-content">
              <h3>{ex.name}</h3>
              <div className="tags">
                <span>{PART_LABEL[ex.part]||ex.part}</span>
                {ex.type&&<span>{ex.type}</span>}
                <span className={`difficulty ${ex.difficulty}`}>{DIFF_LABEL[ex.difficulty]||ex.difficulty}</span>
              </div>
              <p>{ex.description||"Sin descripción."}</p>
              <button type="button" className="button primary icon-text" onClick={()=>onChoose(ex)}>
                <Check size={17}/>{selectedId===ex.id?"Seleccionado":"Elegir"}
              </button>
            </div>
          </article>)}
        </div>}
      </div>
      <footer className="picker-footer">
        <button type="button" className="button secondary" onClick={()=>onChoose(null)}>Vaciar bloque</button>
        <button type="button" className="button secondary" onClick={onClose}>Cerrar</button>
      </footer>
    </div>
    {zoom&&<div className="zoom nested" onClick={()=>setZoom("")}><button><X/></button><img src={zoom} onClick={e=>e.stopPropagation()}/></div>}
  </div>
}

function SessionEditor({session,onClose,onSaved}){
  const emptyBlocks=Object.fromEntries(SESSION_PARTS.map(p=>[p.id,null]));
  const [form,setForm]=useState({
    session_date:session?.session_date||"",
    kind:session?.kind||"A",
    title:session?.title||"",
    goal:session?.goal||"",
    mesocycle_id:session?.mesocycle_id||"",
    goalkeeper_notes:session?.goalkeeper_notes||"",
    notes:session?.notes||"",
  });
  const [blocks,setBlocks]=useState(emptyBlocks);
  const [mesocycles,setMesocycles]=useState([]);
  const [pickerPart,setPickerPart]=useState("");
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(Boolean(session?.id));
  const [error,setError]=useState("");
  const set=(k,v)=>setForm(x=>({...x,[k]:v}));

  useEffect(()=>{
    supabase.from("mesocycles").select("*").eq("team_id",TEAM_ID).order("sort_order")
      .then(({data})=>setMesocycles(data||[]));
    if(session?.id){
      supabase.from("session_blocks").select("part,exercise_id,exercises(*)").eq("session_id",session.id)
        .then(({data,error})=>{
          if(error)setError(error.message);
          const next={...emptyBlocks};
          (data||[]).forEach(row=>next[row.part]=row.exercises||null);
          setBlocks(next);setLoading(false);
        });
    }
  },[]);

  async function save(e){
    e.preventDefault();setError("");
    if(!form.session_date)return setError("Selecciona una fecha.");
    setBusy(true);
    const payload={
      team_id:TEAM_ID,
      mesocycle_id:form.mesocycle_id||null,
      session_date:form.session_date,
      kind:form.kind,
      title:form.title.trim()||null,
      goal:form.goal.trim()||null,
      goalkeeper_notes:form.goalkeeper_notes.trim()||null,
      notes:form.notes.trim()||null,
    };
    let sessionId=session?.id;
    if(sessionId){
      const {error}=await supabase.from("sessions").update(payload).eq("id",sessionId);
      if(error){setBusy(false);return setError(error.message)}
    }else{
      const {data,error}=await supabase.from("sessions").insert(payload).select("id").single();
      if(error){setBusy(false);return setError(error.message)}
      sessionId=data.id;
    }

    const rows=SESSION_PARTS.filter(p=>blocks[p.id]).map((p,index)=>({
      session_id:sessionId,exercise_id:blocks[p.id].id,part:p.id,sort_order:index
    }));
    const {error:deleteError}=await supabase.from("session_blocks").delete().eq("session_id",sessionId);
    if(deleteError){setBusy(false);return setError(deleteError.message)}
    if(rows.length){
      const {error:blockError}=await supabase.from("session_blocks").insert(rows);
      if(blockError){setBusy(false);return setError(blockError.message)}
    }
    setBusy(false);onSaved(sessionId);
  }

  if(loading)return <div className="modal-backdrop"><div className="modal"><div className="empty">Cargando sesión…</div></div></div>;

  return <div className="modal-backdrop session-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal session-editor-modal">
      <header className="modal-head">
        <div><small>{session?"Editar sesión":"Nueva sesión"}</small><h2>Planificador de entrenamiento</h2></div>
        <button className="icon-button" onClick={onClose}><X/></button>
      </header>
      <form className="session-editor-form" onSubmit={save}>
        <section className="session-meta">
          <label>Fecha<input type="date" value={form.session_date} onChange={e=>set("session_date",e.target.value)}/></label>
          <label>Sesión<select value={form.kind} onChange={e=>set("kind",e.target.value)}><option value="A">A</option><option value="B">B</option></select></label>
          <label>Mesociclo<select value={form.mesocycle_id} onChange={e=>set("mesocycle_id",e.target.value)}>
            <option value="">Sin asignar</option>{mesocycles.map(m=><option value={m.id} key={m.id}>{m.name}</option>)}
          </select></label>
          <label className="wide">Título<input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Ej. Conservación y finalización"/></label>
          <label className="wide">Objetivo de la sesión<textarea rows="3" value={form.goal} onChange={e=>set("goal",e.target.value)} placeholder="Objetivo técnico, táctico o actitudinal…"/></label>
        </section>

        <section className="blocks-editor">
          {SESSION_PARTS.map(part=>{
            const ex=blocks[part.id];
            return <article className="session-block-card" key={part.id}>
              <header><div><h3>{part.label}</h3><small>{part.time}</small></div>
                <button type="button" className="button secondary" onClick={()=>setPickerPart(part.id)}>{ex?"Cambiar":"Elegir ejercicio"}</button>
              </header>
              {ex?<div className="selected-exercise">
                <button type="button" className="selected-image" onClick={()=>ex.image_url&&window.open(ex.image_url,"_blank")}>
                  {ex.image_url?<img src={ex.image_url} alt={ex.name}/>:<ImageIcon/>}
                </button>
                <div><h4>{ex.name}</h4><div className="tags">{ex.type&&<span>{ex.type}</span>}<span className={`difficulty ${ex.difficulty}`}>{DIFF_LABEL[ex.difficulty]}</span></div><p>{ex.description||"Sin descripción."}</p></div>
              </div>:<div className="empty-block">No se ha elegido ningún ejercicio.</div>}
            </article>
          })}
        </section>

        <section className="session-notes">
          <label>Trabajo específico de porteros<textarea rows="4" value={form.goalkeeper_notes} onChange={e=>set("goalkeeper_notes",e.target.value)} placeholder="Trabajo separado o adaptaciones para porteros…"/></label>
          <label>Observaciones<textarea rows="4" value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Material, incidencias, ajustes o recordatorios…"/></label>
        </section>
        {error&&<div className="error">{error}</div>}
        <footer className="session-editor-footer">
          <button type="button" className="button secondary" onClick={onClose}>Cancelar</button>
          <button className="button primary icon-text" disabled={busy}><Save size={17}/>{busy?"Guardando…":"Guardar sesión"}</button>
        </footer>
      </form>
    </div>
    {pickerPart&&<ExercisePicker part={pickerPart} selectedId={blocks[pickerPart]?.id}
      onChoose={ex=>{setBlocks(x=>({...x,[pickerPart]:ex}));setPickerPart("")}} onClose={()=>setPickerPart("")}/>}
  </div>
}

function printSession(session,blocks){
  const rows=SESSION_PARTS.map(part=>{
    const ex=blocks.find(b=>b.part===part.id)?.exercises;
    return `<section class="block"><header><b>${part.label}</b><span>${part.time}</span></header>
      <div class="body">${ex?.image_url?`<img src="${ex.image_url}">`:`<div class="noimg">Sin imagen</div>`}
      <div><h3>${ex?.name||"Sin ejercicio"}</h3><p>${ex?.description||""}</p></div></div></section>`;
  }).join("");
  const win=window.open("","_blank");
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${session.title||"Sesión"}</title>
  <style>@page{size:A4;margin:10mm}body{font-family:Arial;color:#17233b;margin:0}.head{border-bottom:3px solid #1676de;padding-bottom:8px;margin-bottom:10px}.head h1{margin:0}.meta{display:flex;gap:15px;margin-top:5px}.goal,.notes{border:1px solid #bbb;padding:8px;margin:8px 0}.block{border:1px solid #aaa;margin:7px 0;break-inside:avoid}.block header{background:#eef4fa;padding:6px 8px;display:flex;justify-content:space-between}.body{display:grid;grid-template-columns:34% 1fr;gap:10px;padding:8px}.body img{width:100%;height:120px;object-fit:contain}.noimg{height:120px;display:grid;place-items:center;background:#eee}.body h3{margin:0 0 5px}.body p{font-size:12px;margin:0;white-space:pre-wrap}.notes h3{margin:0 0 4px}</style></head>
  <body><div class="head"><h1>${session.title||`Sesión ${session.kind}`}</h1><div class="meta"><span>${session.session_date}</span><span>Sesión ${session.kind}</span><span>BENJAMÍN C</span></div></div>
  ${session.goal?`<div class="goal"><b>Objetivo:</b> ${session.goal}</div>`:""}${rows}
  ${session.goalkeeper_notes?`<div class="notes"><h3>Porteros</h3>${session.goalkeeper_notes}</div>`:""}
  ${session.notes?`<div class="notes"><h3>Observaciones</h3>${session.notes}</div>`:""}
  <script>window.onload=()=>window.print()</script></body></html>`);
  win.document.close();
}

function SessionPreview({session,onClose}){
  const [blocks,setBlocks]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("session_blocks").select("*,exercises(*)").eq("session_id",session.id).order("sort_order")
      .then(({data})=>{setBlocks(data||[]);setLoading(false)});
  },[]);
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal session-preview-modal">
      <header className="modal-head"><div><small>{session.session_date} · Sesión {session.kind}</small><h2>{session.title||"Sesión de entrenamiento"}</h2></div>
        <button className="icon-button" onClick={onClose}><X/></button></header>
      <div className="session-preview-scroll">
        {session.goal&&<div className="objective-box"><b>Objetivo</b><p>{session.goal}</p></div>}
        {loading?<div className="empty">Cargando…</div>:SESSION_PARTS.map(part=>{
          const ex=blocks.find(b=>b.part===part.id)?.exercises;
          return <article className="preview-block" key={part.id}><header><b>{part.label}</b><span>{part.time}</span></header>
            {ex?<div><div className="preview-img">{ex.image_url?<img src={ex.image_url}/>:<ImageIcon/>}</div>
              <section><h3>{ex.name}</h3><p>{ex.description||""}</p></section></div>:<p className="no-exercise">Sin ejercicio.</p>}
          </article>
        })}
        {session.goalkeeper_notes&&<div className="objective-box"><b>Porteros</b><p>{session.goalkeeper_notes}</p></div>}
        {session.notes&&<div className="objective-box"><b>Observaciones</b><p>{session.notes}</p></div>}
      </div>
      <footer className="picker-footer"><button className="button primary icon-text" onClick={()=>printSession(session,blocks)}><Printer size={17}/>Imprimir A4</button><button className="button secondary" onClick={onClose}>Cerrar</button></footer>
    </div>
  </div>
}

function SessionsPage({history=false,onCount}){
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [editing,setEditing]=useState(undefined);
  const [preview,setPreview]=useState(null);
  const [filter,setFilter]=useState("all");

  async function load(){
    setLoading(true);setError("");
    const {data,error}=await supabase.from("sessions").select("*,mesocycles(name)")
      .eq("team_id",TEAM_ID).order("session_date",{ascending:history});
    setLoading(false);
    if(error)return setError(error.message);
    setItems(data||[]);onCount?.(data?.length||0);
  }
  useEffect(()=>{load()},[history]);

  async function remove(item){
    if(!confirm(`¿Eliminar la sesión del ${formatDate(item.session_date)}?`))return;
    const {error}=await supabase.from("sessions").delete().eq("id",item.id);
    if(error)return alert(error.message);
    load();
  }

  async function duplicate(item){
    const {data:blocks}=await supabase.from("session_blocks").select("*").eq("session_id",item.id);
    const {data:newSession,error}=await supabase.from("sessions").insert({
      team_id:TEAM_ID,mesocycle_id:item.mesocycle_id,session_date:item.session_date,kind:item.kind,
      title:`Copia de ${item.title||`Sesión ${item.kind}`}`,goal:item.goal,
      goalkeeper_notes:item.goalkeeper_notes,notes:item.notes
    }).select("id").single();
    if(error)return alert(error.message);
    if(blocks?.length)await supabase.from("session_blocks").insert(blocks.map(b=>({
      session_id:newSession.id,exercise_id:b.exercise_id,part:b.part,sort_order:b.sort_order
    })));
    load();
  }

  const today=toISO(new Date());
  const filtered=items.filter(s=>filter==="all"||(filter==="upcoming"?s.session_date>=today:s.session_date<today));

  return <>
    <div className="page-title-row"><div><p className="overline">Sesiones</p><h2>{history?"Historial":"Planificador"}</h2>
      <p className="subtext">{history?"Consulta sesiones anteriores y vuelve a imprimirlas.":"Crea y modifica sesiones con los cinco bloques de entrenamiento."}</p></div>
      {!history&&<button className="button primary icon-text" onClick={()=>setEditing(null)}><Plus size={18}/>Nueva sesión</button>}
    </div>
    <section className="session-filter card-panel">
      <button className={filter==="all"?"active":""} onClick={()=>setFilter("all")}>Todas</button>
      <button className={filter==="upcoming"?"active":""} onClick={()=>setFilter("upcoming")}>Próximas</button>
      <button className={filter==="past"?"active":""} onClick={()=>setFilter("past")}>Anteriores</button>
      <button className="refresh-session" onClick={load}><RefreshCw size={17}/>Actualizar</button>
    </section>
    {error&&<div className="error">{error}</div>}
    {loading?<div className="empty">Cargando sesiones…</div>:filtered.length===0?<section className="empty card-panel"><ClipboardList size={38}/><h3>No hay sesiones</h3><p>{history?"Todavía no hay sesiones anteriores.":"Crea la primera sesión de entrenamiento."}</p></section>:
    <section className="session-list">
      {filtered.map(item=><article className="session-row card-panel" key={item.id}>
        <div className="session-date-box"><strong>{new Date(item.session_date+"T12:00:00").getDate()}</strong><span>{new Intl.DateTimeFormat("es-ES",{month:"short"}).format(new Date(item.session_date+"T12:00:00"))}</span></div>
        <div className="session-row-main"><div className="session-row-title"><span className="kind-badge">Sesión {item.kind}</span><h3>{item.title||"Entrenamiento"}</h3></div>
          <p>{item.goal||"Sin objetivo definido."}</p><small>{item.mesocycles?.name||"Sin mesociclo"}</small></div>
        <div className="session-row-actions">
          <button className="icon-button bordered" onClick={()=>setPreview(item)} title="Ver"><Eye size={18}/></button>
          {!history&&<button className="icon-button bordered" onClick={()=>setEditing(item)} title="Editar"><Pencil size={18}/></button>}
          {!history&&<button className="icon-button bordered" onClick={()=>duplicate(item)} title="Duplicar"><Copy size={18}/></button>}
          {!history&&<button className="delete-button" onClick={()=>remove(item)} title="Eliminar"><Trash2 size={18}/></button>}
        </div>
      </article>)}
    </section>}
    {editing!==undefined&&<SessionEditor session={editing} onClose={()=>setEditing(undefined)} onSaved={()=>{setEditing(undefined);load()}}/>}
    {preview&&<SessionPreview session={preview} onClose={()=>setPreview(null)}/>}
  </>
}


function Placeholder({title,text}){
  return <section className="placeholder card-panel"><h2>{title}</h2><p>{text}</p></section>
}

function Dashboard({counts,setActive}){
  const stats=[
    {label:"Ejercicios",value:counts.exercises,color:"blue",icon:BookOpen},
    {label:"Mesociclos",value:counts.mesocycles||0,color:"green",icon:CalendarDays},
    {label:"Sesiones",value:counts.sessions||0,color:"purple",icon:ClipboardList},
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
  const [counts,setCounts]=useState({exercises:0,mesocycles:0,sessions:0});
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
        {active==="biblioteca"&&<Library onCount={n=>setCounts(c=>({...c,exercises:n}))}/>} 
        {active==="favoritos"&&<Library favoritesOnly onCount={n=>setCounts({exercises:n})}/>}
        {active==="mesociclos"&&<Mesocycles onCount={n=>setCounts(c=>({...c,mesocycles:n}))}/>} 
        {active==="calendario"&&<SeasonCalendar/>} 
        {active==="planificador"&&<SessionsPage onCount={n=>setCounts(c=>({...c,sessions:n}))}/>} 
        {active==="historial"&&<SessionsPage history onCount={n=>setCounts(c=>({...c,sessions:n}))}/>} 
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
