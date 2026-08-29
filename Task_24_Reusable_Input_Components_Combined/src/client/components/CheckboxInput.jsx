import React from 'react'; import { Check } from 'lucide-react';
export default function CheckboxInput({id,label,description,register}){return <label className="checkbox-component" htmlFor={id}><input id={id} type="checkbox" {...register}/><span className="check-box"><Check size={13}/></span><span><b>{label}</b><small>{description}</small></span></label>}
