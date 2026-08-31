import React,{useState} from 'react';
import {ArrowRight,Boxes,Eye,EyeOff,KeyRound,Layers3,LoaderCircle,Mail,Network,Sparkles} from 'lucide-react';
import {api} from './api.js';

export default function Login({onSuccess}){
  const [email,setEmail]=useState('admin@relatedesk.dev');
  const [password,setPassword]=useState('Admin@12345');
  const [show,setShow]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  async function submit(e){
    e.preventDefault();setLoading(true);setError('');
    try{onSuccess((await api.login({email,password})).user)}
    catch(e){setError(e.message)}
    finally{setLoading(false)}
  }

  return <div className="login-page">
    <section className="login-showcase">
      <div className="showcase-grid"/>
      <div className="brand login-brand">
        <span><Network size={25}/></span>
        <div><b>RelateDesk</b><small>Connected Operations Platform</small></div>
      </div>
      <div className="showcase-content">
        <span className="eyebrow">TASK 30 / RELATIONAL CRUD</span>
        <h1>Manage the work.<em> Understand the relationships.</em></h1>
        <p>A spacious operations workspace where clients, projects, teams and tasks stay connected in one clear business system.</p>
        <div className="showcase-features">
          <article><span><Layers3/></span><div><b>Nested relationships</b><small>Clients → projects → tasks with live relational counts.</small></div></article>
          <article><span><Boxes/></span><div><b>Advanced CRUD</b><small>Create, update and safely delete connected records.</small></div></article>
          <article><span><Sparkles/></span><div><b>Business UI</b><small>Responsive layout with polished motion and depth.</small></div></article>
        </div>
      </div>
    </section>

    <section className="login-panel">
      <form className="login-card" onSubmit={submit}>
        <span className="eyebrow">SECURE ADMIN ACCESS</span>
        <h2>Welcome to RelateDesk</h2>
        <p>Sign in to manage your relational workspace.</p>
        {error&&<div className="form-error">{error}</div>}

        <label><span><Mail size={16}/> Email address</span><div className="input-shell">
          <Mail size={19}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        </div></label>

        <label><span><KeyRound size={16}/> Password</span><div className="input-shell">
          <KeyRound size={19}/><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required/>
          <button type="button" onClick={()=>setShow(v=>!v)}>{show?<EyeOff/>:<Eye/>}</button>
        </div></label>

        <button className="primary login-submit" disabled={loading}>
          {loading?<><LoaderCircle className="spin"/> Signing in...</>:<>Open workspace <ArrowRight/></>}
        </button>

        <div className="demo">
          <span>Demo administrator</span>
          <code>admin@relatedesk.dev</code>
          <code>Admin@12345</code>
        </div>
      </form>
    </section>
  </div>
}
