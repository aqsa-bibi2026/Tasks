import React,{useEffect,useMemo,useState} from 'react';
import {
  Activity,AlertTriangle,CalendarDays,CheckCircle2,ChevronLeft,ChevronRight,
  Download,Eye,Fingerprint,LoaderCircle,LogOut,Plus,Search,ShieldAlert,ShieldCheck,X
} from 'lucide-react';
import {api} from './api.js';

const categories=['all','auth','data','access','system'];
const severities=['all','info','warning','critical'];

const csv=(logs)=>{
  const h=['sequence_no','actor_email','actor_name','action','category','severity','entity_type','entity_id','message','ip_address','event_hash','created_at'];
  return [h.join(','),...logs.map(x=>h.map(k=>`"${String(x[k]??'').replaceAll('"','""')}"`).join(','))].join('\n');
};

function Drawer({log,onClose}){
  if(!log)return null;
  return <div className="backdrop" onMouseDown={onClose}>
    <aside className="drawer" onMouseDown={e=>e.stopPropagation()}>
      <div className="drawer-head">
        <div><span className="eyebrow">AUDIT EVENT #{log.sequence_no}</span><h2>{log.action}</h2></div>
        <button onClick={onClose}><X size={18}/></button>
      </div>
      <div className="verified"><ShieldCheck/><div><b>Immutable event</b><small>SHA-256 chained audit record.</small></div></div>
      <div className="detail-grid">
        <article><span>Actor</span><b>{log.actor_name}</b><small>{log.actor_email}</small></article>
        <article><span>Entity</span><b>{log.entity_type}</b><small>{log.entity_id||'—'}</small></article>
        <article><span>IP</span><b>{log.ip_address||'Not captured'}</b></article>
        <article><span>Created</span><b>{new Date(log.created_at).toLocaleString()}</b></article>
      </div>
      <section className="block"><span>Message</span><p>{log.message}</p></section>
      {log.before_data&&<section className="block"><span>Before</span><pre>{JSON.stringify(log.before_data,null,2)}</pre></section>}
      {log.after_data&&<section className="block"><span>After</span><pre>{JSON.stringify(log.after_data,null,2)}</pre></section>}
      <section className="block"><span>Metadata</span><pre>{JSON.stringify(log.metadata,null,2)}</pre></section>
      <section className="hashes"><span>Previous hash</span><code>{log.previous_hash}</code><span>Event hash</span><code>{log.event_hash}</code></section>
      <section className="block"><span>User agent</span><p>{log.user_agent||'Not captured'}</p></section>
    </aside>
  </div>
}

export default function Dashboard({user,onLoggedOut}){
  const [logs,setLogs]=useState([]);
  const [stats,setStats]=useState({total:0,critical:0,auth:0,today:0});
  const [page,setPage]=useState(1);
  const [pageSize,setPageSize]=useState(10);
  const [pages,setPages]=useState(1);
  const [total,setTotal]=useState(0);
  const [search,setSearch]=useState('');
  const [q,setQ]=useState('');
  const [category,setCategory]=useState('all');
  const [severity,setSeverity]=useState('all');
  const [from,setFrom]=useState('');
  const [to,setTo]=useState('');
  const [selected,setSelected]=useState(null);
  const [integrity,setIntegrity]=useState(null);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [toast,setToast]=useState('');

  useEffect(()=>{
    const t=setTimeout(()=>{setPage(1);setQ(search.trim())},400);
    return()=>clearTimeout(t);
  },[search]);

  async function load(){
    setLoading(true);setError('');
    try{
      const [a,s]=await Promise.all([
        api.logs({page,pageSize,q,category,severity,from,to}),
        api.stats()
      ]);
      setLogs(a.logs);setPages(a.pagination.totalPages);setTotal(a.pagination.total);setStats(s.stats);
    }catch(e){setError(e.message)}
    finally{setLoading(false)}
  }

  useEffect(()=>{load()},[page,pageSize,q,category,severity,from,to]);

  function notify(m){setToast(m);setTimeout(()=>setToast(''),2400)}

  async function verify(){
    setBusy(true);
    try{
      const r=(await api.integrity()).integrity;
      setIntegrity(r);
      notify(r.valid?`Integrity verified: ${r.checked} events.`:`Integrity issue at #${r.brokenAt}.`);
    }catch(e){setError(e.message)}
    finally{setBusy(false)}
  }

  async function demo(){
    setBusy(true);
    try{await api.demo();await load();notify('New immutable audit event appended.')}
    catch(e){setError(e.message)}
    finally{setBusy(false)}
  }

  function exportCsv(){
    const blob=new Blob([csv(logs)],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=`auditvault-page-${page}.csv`;a.click();
    URL.revokeObjectURL(url);notify('CSV exported.');
  }

  const cards=useMemo(()=>[
    ['Total Events',stats.total,'Immutable history',Activity,'blue'],
    ['Critical',stats.critical,'High-risk events',ShieldAlert,'red'],
    ['Auth Events',stats.auth,'Session activity',Fingerprint,'violet'],
    ['Today',stats.today,'Events today',CalendarDays,'green']
  ],[stats]);

  async function logout(){
    try{await api.logout()}finally{onLoggedOut()}
  }

  return <div className="dash">
    <aside className="sidebar">
      <div className="brand"><span><Fingerprint size={21}/></span><div><b>AuditVault</b><small>Immutable Event Intelligence</small></div></div>
      <nav><button className="active"><Activity/> Audit Trail</button><button disabled><ShieldCheck/> Integrity</button></nav>
      <div className="policy"><ShieldCheck/><div><b>Append-only policy</b><small>UPDATE and DELETE are blocked at database level.</small></div></div>
      <div className="profile"><span>{user.fullName.split(' ').map(x=>x[0]).slice(0,2).join('')}</span><div><b>{user.fullName}</b><small>{user.email}</small><em>{user.role}</em></div></div>
      <button className="logout" onClick={logout}><LogOut/> Sign out</button>
    </aside>

    <main className="workspace">
      <header>
        <div><span className="eyebrow">AUDIT & COMPLIANCE CONSOLE</span><h1>Trace every action.<em> Prove integrity.</em></h1><p>Searchable, hash-chained and append-only business event history.</p></div>
        <div className="actions">
          <button className="secondary" onClick={exportCsv} disabled={!logs.length}><Download/> Export CSV</button>
          <button className="secondary" onClick={verify} disabled={busy}><ShieldCheck/> Verify integrity</button>
          <button className="primary" onClick={demo} disabled={busy}><Plus/> Append demo event</button>
        </div>
      </header>

      <section className="stats">
        {cards.map(([label,value,helper,Icon,tone],i)=><article className={`stat ${tone}`} key={label} style={{animationDelay:`${i*65}ms`}}>
          <span><Icon/></span><div><small>{label}</small><b>{value}</b><em>{helper}</em></div>
        </article>)}
      </section>

      {integrity&&<section className={`integrity ${integrity.valid?'ok':'bad'}`}>
        {integrity.valid?<CheckCircle2/>:<AlertTriangle/>}<div><b>{integrity.valid?'Audit chain verified':'Integrity issue detected'}</b><small>{integrity.reason}. Checked {integrity.checked} events.</small></div>
      </section>}

      <section className="audit">
        <div className="toolbar">
          <div className="search"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search actor, action, entity, message..."/></div>
          <select value={category} onChange={e=>{setCategory(e.target.value);setPage(1)}}>{categories.map(x=><option key={x}> {x}</option>)}</select>
          <select value={severity} onChange={e=>{setSeverity(e.target.value);setPage(1)}}>{severities.map(x=><option key={x}> {x}</option>)}</select>
        </div>

        <div className="dates">
          <label>From <input type="date" value={from} onChange={e=>{setFrom(e.target.value);setPage(1)}}/></label>
          <label>To <input type="date" value={to} onChange={e=>{setTo(e.target.value);setPage(1)}}/></label>
          <label>Rows <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1)}}>{[5,10,20,50].map(x=><option key={x}>{x}</option>)}</select></label>
        </div>

        {loading?<div className="state"><LoaderCircle className="spin"/> Loading immutable audit trail...</div>:
         error?<div className="state error">{error}</div>:
         <div className="table-wrap">
           <table><thead><tr><th>#</th><th>Actor</th><th>Action</th><th>Entity</th><th>Category</th><th>Severity</th><th>Time</th><th/></tr></thead>
           <tbody>{logs.map(log=><tr key={log.id}>
             <td><strong className="seq">#{log.sequence_no}</strong></td>
             <td><b>{log.actor_name}</b><small>{log.actor_email}</small></td>
             <td><span className="action">{log.action}</span></td>
             <td><b>{log.entity_type}</b><small>{log.entity_id||'—'}</small></td>
             <td><span className={`badge ${log.category}`}>{log.category}</span></td>
             <td><span className={`sev ${log.severity}`}>{log.severity}</span></td>
             <td><b>{new Date(log.created_at).toLocaleDateString()}</b><small>{new Date(log.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</small></td>
             <td><button className="view" onClick={()=>setSelected(log)}><Eye/></button></td>
           </tr>)}
           {!logs.length&&<tr><td colSpan="8" className="empty">No audit events match these filters.</td></tr>}
           </tbody></table>

           <div className="pager"><span><ShieldCheck/> {total} immutable events</span><div>
             <button disabled={page<=1} onClick={()=>setPage(page-1)}><ChevronLeft/></button><b>Page {page} / {pages}</b><button disabled={page>=pages} onClick={()=>setPage(page+1)}><ChevronRight/></button>
           </div></div>
         </div>}
      </section>
    </main>

    <Drawer log={selected} onClose={()=>setSelected(null)}/>
    {toast&&<div className="toast"><CheckCircle2/>{toast}</div>}
  </div>
}
