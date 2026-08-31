import React,{useEffect,useMemo,useState} from 'react';
import {
  ArrowUpRight,Building2,CalendarDays,CheckCircle2,CircleDollarSign,
  ClipboardList,FolderKanban,LayoutDashboard,LoaderCircle,LogOut,Menu,
  Network,Pencil,Plus,Search,Trash2,Users,X
} from 'lucide-react';
import {api} from './api.js';

const c0={name:'',industry:'',contact_name:'',contact_email:'',status:'active',annual_value:''};
const p0={client_id:'',name:'',description:'',status:'planning',priority:'medium',budget:'',due_date:''};
const t0={project_id:'',assignee_id:'',title:'',description:'',status:'todo',priority:'medium',due_date:''};

const pretty=v=>String(v||'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(v||0));

function Modal({open,title,sub,onClose,children}){
  if(!open)return null;
  return <div className="modal-bg" onMouseDown={onClose}><section className="modal" onMouseDown={e=>e.stopPropagation()}>
    <header><div><h2>{title}</h2><p>{sub}</p></div><button className="icon" onClick={onClose}><X/></button></header>{children}
  </section></div>
}

function Drawer({drawer,members,onClose,onAdd,onRemove}){
  const [member,setMember]=useState('');
  if(!drawer)return null;
  const {type,item}=drawer;
  return <div className="drawer-bg" onMouseDown={onClose}><aside className="drawer" onMouseDown={e=>e.stopPropagation()}>
    <header><div><span className="eyebrow">{type==='project'?'PROJECT RELATIONSHIPS':'CLIENT RELATIONSHIPS'}</span><h2>{item.name}</h2></div><button className="icon" onClick={onClose}><X/></button></header>

    {type==='client'?<>
      <div className="drawer-kpis">
        <article><FolderKanban/><span>Projects</span><b>{item.project_count||0}</b></article>
        <article><CheckCircle2/><span>Active</span><b>{item.active_project_count||0}</b></article>
        <article><CircleDollarSign/><span>Project Budget</span><b>{money(item.project_budget)}</b></article>
      </div>
      <section className="drawer-section"><h3>Client details</h3><dl>
        <div><dt>Industry</dt><dd>{item.industry}</dd></div>
        <div><dt>Contact</dt><dd>{item.contact_name}</dd></div>
        <div><dt>Email</dt><dd>{item.contact_email}</dd></div>
        <div><dt>Annual value</dt><dd>{money(item.annual_value)}</dd></div>
        <div><dt>Status</dt><dd>{pretty(item.status)}</dd></div>
      </dl></section>
    </>:<>
      <div className="drawer-kpis">
        <article><Users/><span>Members</span><b>{item.members?.length||0}</b></article>
        <article><CheckCircle2/><span>Tasks Done</span><b>{item.done_task_count||0}/{item.task_count||0}</b></article>
        <article><CircleDollarSign/><span>Budget</span><b>{money(item.budget)}</b></article>
      </div>
      <section className="drawer-section"><h3>Project details</h3><dl>
        <div><dt>Client</dt><dd>{item.client?.name||'—'}</dd></div>
        <div><dt>Status</dt><dd>{pretty(item.status)}</dd></div>
        <div><dt>Priority</dt><dd>{pretty(item.priority)}</dd></div>
        <div><dt>Due date</dt><dd>{item.due_date||'No date'}</dd></div>
      </dl><p className="description">{item.description}</p></section>

      <section className="drawer-section">
        <h3>Project members</h3><p className="hint">Many-to-many relationship</p>
        <div className="member-add">
          <select value={member} onChange={e=>setMember(e.target.value)}>
            <option value="">Choose team member...</option>
            {members.map(m=><option key={m.id} value={m.id}>{m.full_name} — {m.role}</option>)}
          </select>
          <button className="primary" disabled={!member} onClick={()=>{onAdd(item.id,member);setMember('')}}><Plus/> Add</button>
        </div>
        <div className="member-list">
          {(item.members||[]).map(m=><article key={m.id}><span className="avatar">{m.initials}</span><div><b>{m.full_name}</b><small>{m.role}</small></div><button className="icon danger" onClick={()=>onRemove(item.id,m.id)}><Trash2/></button></article>)}
          {!item.members?.length&&<div className="mini-empty">No members assigned.</div>}
        </div>
      </section>
    </>}
  </aside></div>
}

export default function Dashboard({user,onLoggedOut}){
  const [tab,setTab]=useState('overview');
  const [menu,setMenu]=useState(false);
  const [stats,setStats]=useState(null);
  const [members,setMembers]=useState([]);
  const [clients,setClients]=useState([]);
  const [projects,setProjects]=useState([]);
  const [tasks,setTasks]=useState([]);
  const [search,setSearch]=useState('');
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [toast,setToast]=useState('');
  const [modal,setModal]=useState(null);
  const [editing,setEditing]=useState(null);
  const [cf,setCf]=useState(c0);
  const [pf,setPf]=useState(p0);
  const [tf,setTf]=useState(t0);
  const [drawer,setDrawer]=useState(null);

  const tabs=[
    ['overview','Overview',LayoutDashboard],
    ['clients','Clients',Building2],
    ['projects','Projects',FolderKanban],
    ['tasks','Tasks',ClipboardList]
  ];

  function notify(m){setToast(m);setTimeout(()=>setToast(''),2500)}

  async function load(){
    setLoading(true);setError('');
    try{
      const [d,c,p,t]=await Promise.all([api.dashboard(),api.clients(),api.projects(),api.tasks()]);
      setStats(d.stats);setMembers(d.members);setClients(c.clients);setProjects(p.projects);setTasks(t.tasks);
      if(drawer?.type==='client'){
        const x=c.clients.find(v=>v.id===drawer.item.id);if(x)setDrawer({type:'client',item:x})
      }
      if(drawer?.type==='project'){
        const x=p.projects.find(v=>v.id===drawer.item.id);if(x)setDrawer({type:'project',item:x})
      }
    }catch(e){setError(e.message)}
    finally{setLoading(false)}
  }
  useEffect(()=>{load()},[]);

  const q=search.toLowerCase().trim();
  const fc=useMemo(()=>clients.filter(x=>!q||[x.name,x.industry,x.contact_name,x.contact_email].join(' ').toLowerCase().includes(q)),[clients,q]);
  const fp=useMemo(()=>projects.filter(x=>!q||[x.name,x.description,x.client?.name,x.priority].join(' ').toLowerCase().includes(q)),[projects,q]);
  const ft=useMemo(()=>tasks.filter(x=>!q||[x.title,x.description,x.project?.name,x.project?.client?.name,x.assignee?.full_name].join(' ').toLowerCase().includes(q)),[tasks,q]);

  function create(type){
    setEditing(null);
    if(type==='client')setCf(c0);
    if(type==='project')setPf(p0);
    if(type==='task')setTf(t0);
    setModal(type);
  }

  function edit(type,x){
    setEditing(x);setModal(type);
    if(type==='client')setCf({name:x.name,industry:x.industry,contact_name:x.contact_name,contact_email:x.contact_email,status:x.status,annual_value:x.annual_value});
    if(type==='project')setPf({client_id:x.client_id,name:x.name,description:x.description,status:x.status,priority:x.priority,budget:x.budget,due_date:x.due_date||''});
    if(type==='task')setTf({project_id:x.project_id,assignee_id:x.assignee_id||'',title:x.title,description:x.description,status:x.status,priority:x.priority,due_date:x.due_date||''});
  }

  async function save(type,e){
    e.preventDefault();setBusy(true);setError('');
    try{
      if(type==='client') editing?await api.updateClient(editing.id,cf):await api.createClient(cf);
      if(type==='project') editing?await api.updateProject(editing.id,pf):await api.createProject(pf);
      if(type==='task') editing?await api.updateTask(editing.id,tf):await api.createTask(tf);
      notify(`${pretty(type)} ${editing?'updated':'created'} successfully.`);
      setModal(null);await load();
    }catch(e){setError(e.message)}
    finally{setBusy(false)}
  }

  async function remove(type,id){
    if(!confirm(`Delete this ${type}?`))return;
    setBusy(true);
    try{
      if(type==='client')await api.deleteClient(id);
      if(type==='project')await api.deleteProject(id);
      if(type==='task')await api.deleteTask(id);
      notify(`${pretty(type)} deleted.`);await load();
    }catch(e){notify(e.message);setError(e.message)}
    finally{setBusy(false)}
  }

  async function addMember(pid,mid){
    setBusy(true);
    try{await api.addMember(pid,mid);notify('Project member added.');await load()}
    catch(e){notify(e.message)}
    finally{setBusy(false)}
  }

  async function removeMember(pid,mid){
    setBusy(true);
    try{await api.removeMember(pid,mid);notify('Project member removed.');await load()}
    catch(e){notify(e.message)}
    finally{setBusy(false)}
  }

  async function logout(){try{await api.logout()}finally{onLoggedOut()}}

  return <div className="app">
    <aside className={`sidebar ${menu?'open':''}`}>
      <div className="side-head">
        <div className="brand"><span><Network/></span><div><b>RelateDesk</b><small>Connected Operations</small></div></div>
        <button className="mobile-close" onClick={()=>setMenu(false)}><X/></button>
      </div>

      <nav>{tabs.map(([k,l,I])=><button key={k} className={tab===k?'active':''} onClick={()=>{setTab(k);setSearch('');setMenu(false)}}><I/><span>{l}</span></button>)}</nav>

      <div className="relation-box"><Network/><div><b>Relational model</b><p>Clients → Projects → Tasks</p><small>Project ↔ Team many-to-many</small></div></div>

      <div className="profile"><span className="avatar large">{user.fullName.split(' ').map(x=>x[0]).slice(0,2).join('')}</span><div><b>{user.fullName}</b><small>{user.email}</small><em>{user.role}</em></div></div>
      <button className="logout" onClick={logout}><LogOut/> Sign out</button>
    </aside>

    {menu&&<button className="overlay" onClick={()=>setMenu(false)}/>}

    <main className="main">
      <header className="topbar">
        <div className="top-left"><button className="menu" onClick={()=>setMenu(true)}><Menu/></button><div><span className="eyebrow">TASK 30 / ADVANCED CRUD</span><h1>{tabs.find(x=>x[0]===tab)?.[1]}</h1></div></div>
        <div className="top-actions">
          {tab!=='overview'&&<div className="search"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${tab}...`}/></div>}
          {tab==='clients'&&<button className="primary" onClick={()=>create('client')}><Plus/> New client</button>}
          {tab==='projects'&&<button className="primary" onClick={()=>create('project')}><Plus/> New project</button>}
          {tab==='tasks'&&<button className="primary" onClick={()=>create('task')}><Plus/> New task</button>}
        </div>
      </header>

      {error&&<div className="error"><span>{error}</span><button onClick={()=>setError('')}><X/></button></div>}

      {loading?<div className="loading"><LoaderCircle className="spin"/><b>Loading connected workspace...</b><p>Fetching relational data from Supabase.</p></div>:<>
        {tab==='overview'&&<div className="page">
          <section className="hero">
            <div><span className="eyebrow">RELATIONAL OPERATIONS HUB</span><h2>One workspace.<em> Every relationship visible.</em></h2><p>Manage clients, projects, people and tasks without losing the business context connecting them.</p>
              <div className="hero-actions"><button className="primary" onClick={()=>{setTab('projects');create('project')}}><Plus/> Create project</button><button className="secondary" onClick={()=>setTab('clients')}>Explore clients <ArrowUpRight/></button></div>
            </div>
            <div className="relation-visual">
              <span className="node n1"><Building2/> Clients</span><span className="node n2"><FolderKanban/> Projects</span><span className="node n3"><ClipboardList/> Tasks</span><span className="node n4"><Users/> Team</span><i className="line l1"/><i className="line l2"/>
            </div>
          </section>

          <section className="stats">
            {[
              ['Clients',stats.clients,'Connected accounts',Building2,'violet'],
              ['Projects',stats.projects,`${stats.activeProjects} active`,FolderKanban,'blue'],
              ['Open Tasks',stats.openTasks,'Across projects',ClipboardList,'amber'],
              ['Portfolio',money(stats.portfolioValue),`${money(stats.projectBudget)} budget`,CircleDollarSign,'green']
            ].map(([l,v,h,I,t],i)=><article className={`stat ${t}`} style={{animationDelay:`${i*70}ms`}} key={l}><span><I/></span><div><small>{l}</small><b>{v}</b><p>{h}</p></div></article>)}
          </section>

          <section className="overview-grid">
            <div className="panel"><div className="panel-head"><div><span className="eyebrow">PROJECT PORTFOLIO</span><h3>Recent projects</h3></div><button onClick={()=>setTab('projects')}>View all <ArrowUpRight/></button></div>
              <div className="mini-projects">{projects.slice(0,4).map(p=><article key={p.id} onClick={()=>setDrawer({type:'project',item:p})}><span className="mini-icon"><FolderKanban/></span><div><b>{p.name}</b><small>{p.client?.name}</small><div className="progress"><i style={{width:`${p.task_count?Math.round(p.done_task_count/p.task_count*100):0}%`}}/></div></div><span className={`status ${p.status}`}>{pretty(p.status)}</span></article>)}</div>
            </div>

            <div className="panel"><div className="panel-head"><div><span className="eyebrow">WORK QUEUE</span><h3>Latest tasks</h3></div><button onClick={()=>setTab('tasks')}>View all <ArrowUpRight/></button></div>
              <div className="mini-tasks">{tasks.slice(0,5).map(t=><article key={t.id}><span className={`dot ${t.priority}`}/><div><b>{t.title}</b><small>{t.project?.name} · {t.assignee?.full_name||'Unassigned'}</small></div><span className={`status ${t.status}`}>{pretty(t.status)}</span></article>)}</div>
            </div>
          </section>
        </div>}

        {tab==='clients'&&<div className="page">
          <div className="page-head"><div><h2>Client portfolio</h2><p>Each client shows connected projects and relational value.</p></div><span>{fc.length} clients</span></div>
          <section className="client-grid">{fc.map((c,i)=><article className="client-card" style={{animationDelay:`${i*50}ms`}} key={c.id}>
            <div className="card-top"><span className="client-logo">{c.name.slice(0,2).toUpperCase()}</span><div><button className="icon" onClick={()=>edit('client',c)}><Pencil/></button><button className="icon danger" onClick={()=>remove('client',c.id)}><Trash2/></button></div></div>
            <div className="client-title"><div><h3>{c.name}</h3><small>{c.industry}</small></div><span className={`status ${c.status}`}>{pretty(c.status)}</span></div>
            <div className="client-kpis"><div><small>Projects</small><b>{c.project_count}</b></div><div><small>Active</small><b>{c.active_project_count}</b></div><div><small>Annual value</small><b>{money(c.annual_value)}</b></div></div>
            <div className="contact"><b>{c.contact_name}</b><small>{c.contact_email}</small></div>
            <button className="card-link" onClick={()=>setDrawer({type:'client',item:c})}>View relationships <ArrowUpRight/></button>
          </article>)}</section>
        </div>}

        {tab==='projects'&&<div className="page">
          <div className="page-head"><div><h2>Project portfolio</h2><p>Projects connect clients, tasks and team members.</p></div><span>{fp.length} projects</span></div>
          <section className="project-grid">{fp.map((p,i)=>{
            const progress=p.task_count?Math.round(p.done_task_count/p.task_count*100):0;
            return <article className="project-card" style={{animationDelay:`${i*50}ms`}} key={p.id}>
              <div className="card-top"><div><span className={`priority ${p.priority}`}>{pretty(p.priority)} priority</span><h3>{p.name}</h3><small>{p.client?.name}</small></div><div><button className="icon" onClick={()=>edit('project',p)}><Pencil/></button><button className="icon danger" onClick={()=>remove('project',p.id)}><Trash2/></button></div></div>
              <p className="project-desc">{p.description}</p>
              <div className="project-progress"><div><span>Task progress</span><b>{progress}%</b></div><div className="progress big"><i style={{width:`${progress}%`}}/></div></div>
              <div className="project-info"><div><CircleDollarSign/><span>{money(p.budget)}</span></div><div><CalendarDays/><span>{p.due_date||'No date'}</span></div></div>
              <div className="project-foot"><div className="avatars">{(p.members||[]).slice(0,4).map(m=><span className="avatar" title={m.full_name} key={m.id}>{m.initials}</span>)}{!p.members?.length&&<small>No members</small>}</div><span className={`status ${p.status}`}>{pretty(p.status)}</span></div>
              <button className="card-link" onClick={()=>setDrawer({type:'project',item:p})}>Manage relationships <ArrowUpRight/></button>
            </article>
          })}</section>
        </div>}

        {tab==='tasks'&&<div className="page">
          <div className="page-head"><div><h2>Task workspace</h2><p>Every task belongs to a project and can have an assignee.</p></div><span>{ft.length} tasks</span></div>
          <section className="board">{['todo','in_progress','review','done'].map(s=>{
            const list=ft.filter(t=>t.status===s);
            return <div className="column" key={s}><header><div><span className={`column-dot ${s}`}/><h3>{pretty(s)}</h3></div><span>{list.length}</span></header><div className="column-body">
              {list.map((t,i)=><article className="task-card" style={{animationDelay:`${i*40}ms`}} key={t.id}>
                <div className="card-top"><span className={`priority ${t.priority}`}>{pretty(t.priority)}</span><div><button className="icon small" onClick={()=>edit('task',t)}><Pencil/></button><button className="icon small danger" onClick={()=>remove('task',t.id)}><Trash2/></button></div></div>
                <h4>{t.title}</h4><p>{t.description}</p>
                <div className="relation"><FolderKanban/><span>{t.project?.name}</span></div>
                <div className="relation muted"><Building2/><span>{t.project?.client?.name}</span></div>
                <footer><div>{t.assignee?<><span className="avatar">{t.assignee.initials}</span><small>{t.assignee.full_name}</small></>:<small>Unassigned</small>}</div><span><CalendarDays/>{t.due_date||'No date'}</span></footer>
              </article>)}
              {!list.length&&<div className="column-empty">No {pretty(s).toLowerCase()} tasks</div>}
            </div></div>
          })}</section>
        </div>}
      </>}

      <Drawer drawer={drawer} members={members} onClose={()=>setDrawer(null)} onAdd={addMember} onRemove={removeMember}/>

      <Modal open={modal==='client'} title={editing?'Edit client':'Create client'} sub="Parent record for connected projects." onClose={()=>setModal(null)}>
        <form className="form" onSubmit={e=>save('client',e)}><div className="form-grid">
          <label><span>Client name</span><input value={cf.name} onChange={e=>setCf({...cf,name:e.target.value})} required/></label>
          <label><span>Industry</span><input value={cf.industry} onChange={e=>setCf({...cf,industry:e.target.value})} required/></label>
          <label><span>Contact name</span><input value={cf.contact_name} onChange={e=>setCf({...cf,contact_name:e.target.value})} required/></label>
          <label><span>Contact email</span><input type="email" value={cf.contact_email} onChange={e=>setCf({...cf,contact_email:e.target.value})} required/></label>
          <label><span>Status</span><select value={cf.status} onChange={e=>setCf({...cf,status:e.target.value})}><option>active</option><option>prospect</option><option>inactive</option></select></label>
          <label><span>Annual value ($)</span><input type="number" min="0" value={cf.annual_value} onChange={e=>setCf({...cf,annual_value:e.target.value})}/></label>
        </div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setModal(null)}>Cancel</button><button className="primary" disabled={busy}>{busy?<LoaderCircle className="spin"/>:<CheckCircle2/>}{editing?'Save changes':'Create client'}</button></div></form>
      </Modal>

      <Modal open={modal==='project'} title={editing?'Edit project':'Create project'} sub="Link a project to a client and delivery details." onClose={()=>setModal(null)}>
        <form className="form" onSubmit={e=>save('project',e)}><div className="form-grid">
          <label className="full"><span>Client</span><select value={pf.client_id} onChange={e=>setPf({...pf,client_id:e.target.value})} required><option value="">Choose client...</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className="full"><span>Project name</span><input value={pf.name} onChange={e=>setPf({...pf,name:e.target.value})} required/></label>
          <label className="full"><span>Description</span><textarea value={pf.description} onChange={e=>setPf({...pf,description:e.target.value})}/></label>
          <label><span>Status</span><select value={pf.status} onChange={e=>setPf({...pf,status:e.target.value})}>{['planning','active','review','completed','on_hold'].map(x=><option key={x}>{x}</option>)}</select></label>
          <label><span>Priority</span><select value={pf.priority} onChange={e=>setPf({...pf,priority:e.target.value})}>{['low','medium','high','critical'].map(x=><option key={x}>{x}</option>)}</select></label>
          <label><span>Budget ($)</span><input type="number" min="0" value={pf.budget} onChange={e=>setPf({...pf,budget:e.target.value})}/></label>
          <label><span>Due date</span><input type="date" value={pf.due_date} onChange={e=>setPf({...pf,due_date:e.target.value})}/></label>
        </div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setModal(null)}>Cancel</button><button className="primary" disabled={busy}>{busy?<LoaderCircle className="spin"/>:<CheckCircle2/>}{editing?'Save changes':'Create project'}</button></div></form>
      </Modal>

      <Modal open={modal==='task'} title={editing?'Edit task':'Create task'} sub="Link task to a project and team member." onClose={()=>setModal(null)}>
        <form className="form" onSubmit={e=>save('task',e)}><div className="form-grid">
          <label className="full"><span>Project</span><select value={tf.project_id} onChange={e=>setTf({...tf,project_id:e.target.value})} required><option value="">Choose project...</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name} — {p.client?.name}</option>)}</select></label>
          <label className="full"><span>Task title</span><input value={tf.title} onChange={e=>setTf({...tf,title:e.target.value})} required/></label>
          <label className="full"><span>Description</span><textarea value={tf.description} onChange={e=>setTf({...tf,description:e.target.value})}/></label>
          <label><span>Assignee</span><select value={tf.assignee_id} onChange={e=>setTf({...tf,assignee_id:e.target.value})}><option value="">Unassigned</option>{members.map(m=><option key={m.id} value={m.id}>{m.full_name} — {m.role}</option>)}</select></label>
          <label><span>Status</span><select value={tf.status} onChange={e=>setTf({...tf,status:e.target.value})}>{['todo','in_progress','review','done'].map(x=><option key={x}>{x}</option>)}</select></label>
          <label><span>Priority</span><select value={tf.priority} onChange={e=>setTf({...tf,priority:e.target.value})}>{['low','medium','high','critical'].map(x=><option key={x}>{x}</option>)}</select></label>
          <label><span>Due date</span><input type="date" value={tf.due_date} onChange={e=>setTf({...tf,due_date:e.target.value})}/></label>
        </div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setModal(null)}>Cancel</button><button className="primary" disabled={busy}>{busy?<LoaderCircle className="spin"/>:<CheckCircle2/>}{editing?'Save changes':'Create task'}</button></div></form>
      </Modal>

      {toast&&<div className="toast"><CheckCircle2/><span>{toast}</span><button onClick={()=>setToast('')}><X/></button></div>}
    </main>
  </div>
}
