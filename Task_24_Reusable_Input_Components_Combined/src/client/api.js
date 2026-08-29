const API_URL=import.meta.env.VITE_API_URL||'http://localhost:5000/api/v1';
export async function createIntake(payload){const r=await fetch(`${API_URL}/intakes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok){const e=new Error(d.message||'Request failed.');e.fieldErrors=d.errors||{};throw e;}return d;}
export async function fetchIntakeStats(){const r=await fetch(`${API_URL}/intakes/stats`);if(!r.ok)throw new Error('Unable to load intake stats.');return r.json();}
