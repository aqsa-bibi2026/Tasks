const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api/v1';
async function req(path,options={}){const r=await fetch(`${API}${path}`,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options});const d=await r.json();if(!r.ok){const e=new Error(d.message||'Request failed.');e.fieldErrors=d.errors||{};throw e}return d}
export const fetchProfile=()=>req('/profile');
export const updateProfile=p=>req('/profile',{method:'PUT',body:JSON.stringify(p)});
export async function uploadAvatar(file){const f=new FormData();f.append('avatar',file);const r=await fetch(`${API}/profile/avatar`,{method:'POST',body:f});const d=await r.json();if(!r.ok)throw new Error(d.message||'Avatar upload failed.');return d}
export const removeAvatar=()=>req('/profile/avatar',{method:'DELETE'});
