import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './styles.css';

const seedCustomers = [
  { id: 1, name: 'Ava Rodriguez', email: 'ava@northstar.co', company: 'Northstar Labs', status: 'Active', value: '$8,240', initials: 'AR', tone: 'purple' },
  { id: 2, name: 'Liam Chen', email: 'liam@vertex.io', company: 'Vertex Systems', status: 'Active', value: '$6,120', initials: 'LC', tone: 'blue' },
  { id: 3, name: 'Mia Thompson', email: 'mia@brightly.com', company: 'Brightly', status: 'Pending', value: '$4,890', initials: 'MT', tone: 'orange' },
  { id: 4, name: 'Noah Williams', email: 'noah@apexgroup.com', company: 'Apex Group', status: 'Active', value: '$3,760', initials: 'NW', tone: 'green' },
  { id: 5, name: 'Sofia Patel', email: 'sofia@lumina.ai', company: 'Lumina AI', status: 'Inactive', value: '$2,950', initials: 'SP', tone: 'pink' },
];

const navItems = [['grid', 'Overview'], ['users', 'Customers'], ['ticket', 'Tickets', '12'], ['chart', 'Analytics']];

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    ticket: <><path d="M2 9a3 3 0 0 0 0 6v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a3 3 0 0 0 0-6V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>, bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    plus: <path d="M12 5v14M5 12h14"/>, arrow: <path d="m9 18 6-6-6-6"/>, menu: <path d="M4 6h16M4 12h16M4 18h16"/>, close: <path d="M18 6 6 18M6 6l12 12"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function App() {
  const [active, setActive] = useState('Overview');
  const [customers, setCustomers] = useState(seedCustomers);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '' });

  useEffect(() => { axios.get('http://localhost:5000/api/customers').then(({ data }) => {
    if (data.length) setCustomers(data.map((c, i) => ({ ...c, status: c.status || 'Active', value: c.value || '$0', initials: c.name.split(' ').map(n => n[0]).join('').slice(0, 2), tone: ['purple','blue','orange','green','pink'][i % 5] })));
  }).catch(() => {}); }, []);
  const visible = useMemo(() => customers.filter(c => `${c.name} ${c.email} ${c.company}`.toLowerCase().includes(query.toLowerCase())), [customers, query]);
  async function addCustomer(e) { e.preventDefault(); const item = { ...form, id: Date.now(), status:'Active', value:'$0', initials:form.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(), tone:'purple' }; try { const {data}=await axios.post('http://localhost:5000/api/customers',form); item.id=data.id; } catch {} setCustomers(p=>[item,...p]); setForm({name:'',email:'',company:'',phone:''}); setModal(false); }

  return <div className="app-shell">
    <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><span className="brand-mark">◆</span><span>Clario</span></div><button className="mobile-close" onClick={()=>setMenuOpen(false)}><Icon name="close"/></button>
      <nav><p className="nav-label">WORKSPACE</p>{navItems.map(([icon,label,badge])=><button key={label} className={active===label?'nav-item active':'nav-item'} onClick={()=>{setActive(label);setMenuOpen(false)}}><Icon name={icon}/><span>{label}</span>{badge&&<em>{badge}</em>}</button>)}<p className="nav-label second">MANAGE</p><button className="nav-item"><Icon name="settings"/><span>Settings</span></button></nav>
      <div className="upgrade-card"><div className="spark">✦</div><strong>Upgrade to Pro</strong><p>Unlock advanced reports and automation.</p><button>View plans</button></div>
      <div className="profile"><span className="avatar dark">JD</span><span><strong>Jordan Davis</strong><small>Administrator</small></span><button>•••</button></div>
    </aside>{menuOpen&&<div className="backdrop" onClick={()=>setMenuOpen(false)}/>}
    <main><header><button className="menu-btn" onClick={()=>setMenuOpen(true)}><Icon name="menu"/></button><div className="global-search"><Icon name="search"/><input placeholder="Search anything..." value={query} onChange={e=>setQuery(e.target.value)}/><kbd>⌘ K</kbd></div><div className="header-actions"><button className="icon-btn"><Icon name="bell"/><i/></button><span className="separator"/><span className="avatar">JD</span></div></header>
      <section className="content"><div className="page-heading"><div><p className="eyebrow">FRIDAY, SEPTEMBER 18</p><h1>Good morning, Jordan <span>👋</span></h1><p>Here’s what’s happening with your customers today.</p></div><button className="primary" onClick={()=>setModal(true)}><Icon name="plus"/> Add customer</button></div>
        <div className="stats-grid"><Stat title="Total customers" value="2,482" trend="12.5%" icon="users" tone="violet" bars={[32,42,35,54,49,62,58,76,70,82]}/><Stat title="Open tickets" value="186" trend="8.2%" icon="ticket" tone="orange" bars={[52,45,59,41,50,37,43,31,35,24]}/><Stat title="Avg. response time" value="1h 24m" trend="18.3%" icon="chart" tone="blue" bars={[75,70,64,66,52,48,55,42,38,31]}/><Stat title="Customer satisfaction" value="94.8%" trend="4.1%" icon="chart" tone="green" bars={[36,43,38,52,55,62,58,69,73,84]}/></div>
        <div className="main-grid"><section className="panel customers-panel"><PanelHead title="Recent customers" sub="Your newest customer relationships" action="View all"/><div className="table-wrap"><table><thead><tr><th>CUSTOMER</th><th>COMPANY</th><th>STATUS</th><th>VALUE</th><th/></tr></thead><tbody>{visible.slice(0,5).map(c=><tr key={c.id}><td><div className="customer-cell"><span className={`avatar ${c.tone||'blue'}`}>{c.initials||c.name?.slice(0,2).toUpperCase()}</span><span><strong>{c.name}</strong><small>{c.email}</small></span></div></td><td>{c.company}</td><td><span className={`status ${String(c.status).toLowerCase()}`}><i/>{c.status}</span></td><td><strong>{c.value}</strong></td><td><button className="more">•••</button></td></tr>)}</tbody></table></div></section>
          <aside className="panel activity-panel"><PanelHead title="Recent activity" sub="Latest updates across your team"/><div className="activities"><Activity avatar="EM" tone="pink" text={<><strong>Emily Miller</strong> resolved ticket <b>#2841</b></>} time="8 min ago"/><Activity avatar="DK" tone="blue" text={<><strong>Daniel Kim</strong> added a new customer</>} time="24 min ago"/><Activity avatar="SJ" tone="green" text={<><strong>Sarah Johnson</strong> replied to <b>#2837</b></>} time="42 min ago"/><Activity avatar="MW" tone="orange" text={<><strong>Marcus Webb</strong> updated deal value</>} time="1 hour ago"/></div><button className="activity-link">View all activity <Icon name="arrow" size={15}/></button></aside></div>
        <section className="bottom-grid"><div className="panel chart-panel"><PanelHead title="Customer growth" sub="New customers over the last 6 months"/><div className="chart-area"><div className="chart-y"><span>600</span><span>450</span><span>300</span><span>150</span><span>0</span></div><svg viewBox="0 0 800 190" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6d5ce7" stopOpacity=".22"/><stop offset="1" stopColor="#6d5ce7" stopOpacity="0"/></linearGradient></defs><path className="area" d="M0 165 C75 155 100 130 160 138 S270 100 320 105 S420 77 480 86 S580 55 640 62 S730 20 800 27 V190 H0Z"/><path className="line" d="M0 165 C75 155 100 130 160 138 S270 100 320 105 S420 77 480 86 S580 55 640 62 S730 20 800 27"/></svg><div className="chart-x"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div></div></div><div className="panel tickets-panel"><PanelHead title="Tickets by status" sub="Current support distribution"/><div className="donut-wrap"><div className="donut"><div><strong>186</strong><small>Total</small></div></div><div className="legend"><p><i className="open-dot"/>Open <strong>84</strong></p><p><i className="progress-dot"/>In progress <strong>62</strong></p><p><i className="resolved-dot"/>Resolved <strong>40</strong></p></div></div></div></section>
      </section></main>
    {modal&&<div className="modal-backdrop" onMouseDown={()=>setModal(false)}><form className="modal" onSubmit={addCustomer} onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><h2>Add new customer</h2><p>Create a customer profile in your workspace.</p></div><button type="button" onClick={()=>setModal(false)}><Icon name="close"/></button></div><label>Full name<input required placeholder="e.g. Alex Morgan" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Email address<input required type="email" placeholder="alex@company.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><div className="form-row"><label>Company<input placeholder="Company name" value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/></label><label>Phone<input placeholder="+1 555 000 0000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="cancel" onClick={()=>setModal(false)}>Cancel</button><button className="primary">Add customer</button></div></form></div>}
  </div>;
}

function PanelHead({title,sub,action}) { return <div className="panel-head"><div><h2>{title}</h2><p>{sub}</p></div>{action?<button className="text-btn">{action} <Icon name="arrow" size={15}/></button>:<button className="more">•••</button>}</div> }
function Stat({title,value,trend,icon,tone,bars}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon name={icon}/></div><div className="stat-copy"><p>{title}</p><h3>{value}</h3><span className="trend">↗ {trend}</span><small>vs last month</small></div><div className={`mini-bars ${tone}`}>{bars.map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div></div> }
function Activity({avatar,tone,text,time}) { return <div className="activity"><span className={`avatar ${tone}`}>{avatar}</span><div><p>{text}</p><small>{time}</small></div></div> }
