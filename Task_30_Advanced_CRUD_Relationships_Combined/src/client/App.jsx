import React,{useEffect,useState} from 'react';
import {LoaderCircle} from 'lucide-react';
import {api} from './api.js';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';

export default function App(){
  const [user,setUser]=useState(null);
  const [checking,setChecking]=useState(true);
  useEffect(()=>{api.me().then(x=>setUser(x.user)).catch(()=>setUser(null)).finally(()=>setChecking(false))},[]);
  if(checking)return <div className="boot"><LoaderCircle className="spin"/><b>Loading RelateDesk...</b></div>;
  if(!user)return <Login onSuccess={setUser}/>;
  return <Dashboard user={user} onLoggedOut={()=>setUser(null)}/>;
}
