const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api/v1';

async function req(path,options={}){
  const r=await fetch(`${API}${path}`,{
    credentials:'include',
    headers:{'Content-Type':'application/json',...(options.headers||{})},
    ...options
  });
  const d=await r.json();
  if(!r.ok){const e=new Error(d.message||'Request failed.');e.status=r.status;throw e}
  return d;
}

export const api={
  login:(body)=>req('/auth/login',{method:'POST',body:JSON.stringify(body)}),
  me:()=>req('/auth/me'),
  logout:()=>req('/auth/logout',{method:'POST'}),
  dashboard:()=>req('/dashboard'),
  clients:()=>req('/clients'),
  createClient:(body)=>req('/clients',{method:'POST',body:JSON.stringify(body)}),
  updateClient:(id,body)=>req(`/clients/${id}`,{method:'PATCH',body:JSON.stringify(body)}),
  deleteClient:(id)=>req(`/clients/${id}`,{method:'DELETE'}),
  projects:()=>req('/projects'),
  createProject:(body)=>req('/projects',{method:'POST',body:JSON.stringify(body)}),
  updateProject:(id,body)=>req(`/projects/${id}`,{method:'PATCH',body:JSON.stringify(body)}),
  deleteProject:(id)=>req(`/projects/${id}`,{method:'DELETE'}),
  addMember:(pid,mid)=>req(`/projects/${pid}/members`,{method:'POST',body:JSON.stringify({member_id:mid})}),
  removeMember:(pid,mid)=>req(`/projects/${pid}/members/${mid}`,{method:'DELETE'}),
  tasks:()=>req('/tasks'),
  createTask:(body)=>req('/tasks',{method:'POST',body:JSON.stringify(body)}),
  updateTask:(id,body)=>req(`/tasks/${id}`,{method:'PATCH',body:JSON.stringify(body)}),
  deleteTask:(id)=>req(`/tasks/${id}`,{method:'DELETE'})
};
