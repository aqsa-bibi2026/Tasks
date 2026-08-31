const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api/v1';

async function request(path,options={}){
  const response=await fetch(`${API}${path}`,{
    credentials:'include',
    headers:{'Content-Type':'application/json',...(options.headers||{})},
    ...options
  });
  const data=await response.json();
  if(!response.ok){
    const e=new Error(data.message||'Request failed.');
    e.status=response.status;
    throw e;
  }
  return data;
}

export const api={
  login:(body)=>request('/auth/login',{method:'POST',body:JSON.stringify(body)}),
  me:()=>request('/auth/me'),
  logout:()=>request('/auth/logout',{method:'POST'}),
  logs:(f)=>{
    const p=new URLSearchParams(Object.entries(f).filter(([,v])=>v!==''&&v!==undefined).map(([k,v])=>[k,String(v)]));
    return request(`/audit?${p.toString()}`);
  },
  stats:()=>request('/audit/stats'),
  integrity:()=>request('/audit/integrity'),
  demo:()=>request('/audit/demo',{method:'POST'})
};
