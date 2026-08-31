import React,{useState} from 'react';
import {ArrowRight,Eye,EyeOff,Fingerprint,KeyRound,LoaderCircle,LockKeyhole,Mail,ShieldCheck} from 'lucide-react';
import {api} from './api.js';

export default function Login({onSuccess}){
  const [email,setEmail]=useState('auditor@auditvault.dev');
  const [password,setPassword]=useState('Auditor@12345');
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
    <section className="login-left">
      <div className="grid-bg"/>
      <div className="brand login-brand">
        <span><Fingerprint size={22}/></span>
        <div><b>AuditVault</b><small>Immutable Event Intelligence</small></div>
      </div>

      <div className="login-copy">
        <span className="eyebrow">TASK 29 / AUDIT LOGS</span>
        <h1>Every action.<em> Permanently accountable.</em></h1>
        <p>A tamper-resistant audit trail for business actions, access changes and system events.</p>

        <div className="trust-grid">
          <article><ShieldCheck/><div><b>Append only</b><small>Historical events cannot be edited or deleted.</small></div></article>
          <article><Fingerprint/><div><b>Hash chained</b><small>Every event is cryptographically linked.</small></div></article>
          <article><LockKeyhole/><div><b>Secure access</b><small>Protected auditor APIs and cookie sessions.</small></div></article>
        </div>
      </div>
    </section>

    <section className="login-right">
      <form className="login-card" onSubmit={submit}>
        <span className="eyebrow">AUDITOR ACCESS</span>
        <h2>Open the audit console</h2>
        <p>Authenticate to review immutable business events.</p>
        {error&&<div className="login-error">{error}</div>}

        <label><span><Mail size={14}/> Email</span><div className="input-shell">
          <Mail size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        </div></label>

        <label><span><KeyRound size={14}/> Password</span><div className="input-shell">
          <KeyRound size={17}/><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required/>
          <button type="button" onClick={()=>setShow(v=>!v)}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button>
        </div></label>

        <button className="primary" disabled={loading}>
          {loading?<><LoaderCircle className="spin" size={17}/> Authenticating...</>:<>Enter AuditVault <ArrowRight size={17}/></>}
        </button>
        <code className="demo">auditor@auditvault.dev · Auditor@12345</code>
      </form>
    </section>
  </div>
}
