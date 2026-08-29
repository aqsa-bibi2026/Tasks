import React from 'react'; import { Search,X } from 'lucide-react';
export default function SearchInput({value,onChange,placeholder='Search components...'}){return <div className="search-input"><Search size={17}/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>{value&&<button type="button" onClick={()=>onChange('')}><X size={15}/></button>}</div>}
