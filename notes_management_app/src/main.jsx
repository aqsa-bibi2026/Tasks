import React,{useEffect,useMemo,useState} from "react";
import {createRoot} from "react-dom/client";
import "./style.css";

function App(){
 const [title,setTitle]=useState("");
 const [text,setText]=useState("");
 const [query,setQuery]=useState("");
 const [notes,setNotes]=useState(()=>{
    try { return JSON.parse(localStorage.getItem("notes-management-app") || "[]"); }
    catch { return []; }
 });
 const [editingId,setEditingId]=useState(null);

 useEffect(()=>{
    localStorage.setItem("notes-management-app",JSON.stringify(notes));
 },[notes]);

 function addNote(){
    if(!title.trim() || !text.trim()) return;
    if(editingId){
     setNotes(notes.map(note=>note.id===editingId ? {...note,title:title.trim(),text:text.trim()} : note));
    } else {
     setNotes([{id:Date.now(),title:title.trim(),text:text.trim(),createdAt:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})},...notes]);
    }
  setTitle("");
  setText("");
    setEditingId(null);
 }

 function remove(id){
    setNotes(notes.filter(note=>note.id!==id));
 }

 function editNote(note){
    setEditingId(note.id);
    setTitle(note.title);
    setText(note.text);
    window.scrollTo({top:0,behavior:"smooth"});
 }

 function cancelEdit(){
    setEditingId(null);
    setTitle("");
    setText("");
 }

 const filteredNotes=useMemo(()=>notes.filter(note=>`${note.title} ${note.text}`.toLowerCase().includes(query.toLowerCase())),[notes,query]);

 return <div className="app">
    <header className="topbar">
     <div className="brand"><span className="brand-mark">N</span><div><p className="eyebrow">PERSONAL WORKSPACE</p><h1>Notes <em>studio</em></h1></div></div>
     <div className="stats"><strong>{notes.length}</strong><span>{notes.length===1 ? "note" : "notes"} saved</span></div>
    </header>

    <main>
     <section className="composer">
        <div className="section-heading"><div><p className="eyebrow">{editingId ? "REFINE YOUR THOUGHT" : "CAPTURE AN IDEA"}</p><h2>{editingId ? "Edit note" : "Create a new note"}</h2></div><span className="shortcut">{editingId ? "Editing" : "Draft"}</span></div>
        <input value={title} placeholder="Give your note a title"
    onChange={e=>setTitle(e.target.value)}/>
        <textarea value={text} placeholder="Start writing something worth remembering..."
    onChange={e=>setText(e.target.value)}/>
        <div className="composer-footer"><span>{text.length} characters</span><div><button className="ghost" onClick={cancelEdit} disabled={!title&&!text}>Clear</button><button className="primary" onClick={addNote}>{editingId ? "Save changes" : "Add note"}<span>+</span></button></div></div>
     </section>

     <section className="library">
        <div className="library-heading"><div><p className="eyebrow">YOUR LIBRARY</p><h2>{query ? "Search results" : "Recent notes"}</h2></div><label className="search"><span>⌕</span><input value={query} placeholder="Search notes..." onChange={e=>setQuery(e.target.value)}/></label></div>
        {filteredNotes.length ? <div className="notes">{filteredNotes.map(note=>(
         <article className="card" key={note.id}>
            <div className="card-top"><span className="note-dot"></span><time>{note.createdAt}</time><button className="more" aria-label={`Delete ${note.title}`} onClick={()=>remove(note.id)}>×</button></div>
            <h3>{note.title}</h3>
            <p>{note.text}</p>
            <button className="edit" onClick={()=>editNote(note)}>Edit note <span>→</span></button>
         </article>
        ))}</div> : <div className="empty"><span className="empty-icon">✦</span><h3>{query ? "No notes found" : "Your notebook is waiting"}</h3><p>{query ? "Try a different search term." : "Write your first note above and keep your best ideas close."}</p></div>}
     </section>
    </main>
    <footer><span>Notes studio</span><span>Everything you write stays in this browser.</span>
    </footer>
 </div>
}

createRoot(document.getElementById("root")).render(<App/>);