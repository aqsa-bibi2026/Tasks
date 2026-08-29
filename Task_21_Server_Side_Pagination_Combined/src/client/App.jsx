import React,{useEffect,useMemo,useState} from 'react';
import {ArrowDownUp,BarChart3,ChevronLeft,ChevronRight,ChevronsLeft,ChevronsRight,CircleDollarSign,Database,Layers3,LoaderCircle,Plus,RefreshCcw,Rows3,Server,ShieldCheck,Trash2} from 'lucide-react';
import {keepPreviousData,useMutation,useQuery,useQueryClient} from '@tanstack/react-query';
import {createDemoOrder,deleteOrder,fetchOrders,fetchStats} from './api.js';

const pageSizes=[5,10,20,50];
const sortOptions=[['newest','Newest first'],['oldest','Oldest first'],['amount_high','Amount: high to low'],['amount_low','Amount: low to high'],['company_az','Company: A–Z']];
const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(v||0));
const dateTime=v=>new Intl.DateTimeFormat('en',{month:'short',day:'2-digit',year:'numeric'}).format(new Date(v));
function pageButtons(current,total){const start=Math.max(1,Math.min(current-2,Math.max(1,total-4)));return Array.from({length:Math.min(5,total-start+1)},(_,i)=>start+i);}

export default function App(){
  const qc=useQueryClient();
  const [page,setPage]=useState(1),[limit,setLimit]=useState(10),[sort,setSort]=useState('newest'),[notice,setNotice]=useState('');
  const orders=useQuery({queryKey:['orders',{page,limit,sort}],queryFn:()=>fetchOrders({page,limit,sort}),placeholderData:keepPreviousData});
  const statsQ=useQuery({queryKey:['order-stats'],queryFn:fetchStats,staleTime:45000});
  const createM=useMutation({mutationFn:createDemoOrder,onSuccess:async d=>{setNotice(d.message);setPage(1);setSort('newest');await Promise.all([qc.invalidateQueries({queryKey:['orders']}),qc.invalidateQueries({queryKey:['order-stats']})]);}});
  const deleteM=useMutation({mutationFn:deleteOrder,onSuccess:async d=>{setNotice(d.message);await Promise.all([qc.invalidateQueries({queryKey:['orders']}),qc.invalidateQueries({queryKey:['order-stats']})]);}});
  const response=orders.data||{},rows=response.rows||[],p=response.pagination||{page,limit,total:0,totalPages:1,hasPreviousPage:false,hasNextPage:false,from:0,to:0},stats=statsQ.data?.stats||{};
  const nums=useMemo(()=>pageButtons(p.page,p.totalPages),[p.page,p.totalPages]);
  useEffect(()=>{if(p.hasNextPage){const n=p.page+1;qc.prefetchQuery({queryKey:['orders',{page:n,limit,sort}],queryFn:()=>fetchOrders({page:n,limit,sort}),staleTime:20000});}},[p.page,p.hasNextPage,limit,sort,qc]);
  const refresh=async()=>{setNotice('Fresh page data requested.');await Promise.all([qc.invalidateQueries({queryKey:['orders']}),qc.invalidateQueries({queryKey:['order-stats']})]);};

  return <div className="shell">
    <aside><div className="brand"><span><Rows3 size={21}/></span><div><b>PageFlow</b><small>Enterprise Data Console</small></div></div>
      <nav><button className="active"><Layers3 size={18}/>Paginated records</button><button disabled><BarChart3 size={18}/>Analytics</button><button disabled><Server size={18}/>API monitoring</button></nav>
      <div className="sidecard"><ShieldCheck size={19}/><b>Server-side pagination</b><p>Only the current page is requested from Supabase instead of loading the full dataset.</p><code>.range(from, to)</code></div>
      <div className="task">TASK 21<strong>Server-Side Pagination</strong></div>
    </aside>
    <main>
      <header><div><div className="eyebrow">DATA DELIVERY / PAGINATION</div><h1>Scale through <em>every page.</em></h1><p>Exact totals, cached page navigation and efficient Supabase range queries.</p></div>
        <div className="actions"><button className="secondary" onClick={refresh}><RefreshCcw size={17} className={orders.isFetching?'spin':''}/>Refresh</button><button className="primary" disabled={createM.isPending} onClick={()=>createM.mutate()}>{createM.isPending?<LoaderCircle size={17} className="spin"/>:<Plus size={17}/>}Add demo order</button></div>
      </header>
      <section className="stats">
        <article><span><Database size={19}/></span><div><small>TOTAL RECORDS</small><b>{stats.totalRecords||0}</b></div></article>
        <article><span><Rows3 size={19}/></span><div><small>CURRENT PAGE</small><b>{p.page}<em>/{p.totalPages}</em></b></div></article>
        <article><span><ShieldCheck size={19}/></span><div><small>ACTIVE ORDERS</small><b>{stats.active||0}</b></div></article>
        <article><span><CircleDollarSign size={19}/></span><div><small>TOTAL VALUE</small><b>{money(stats.totalValue||0)}</b></div></article>
      </section>
      <section className="toolbar"><div><div className="eyebrow">PAGINATION CONTROLS</div><h2>Customer orders</h2></div>
        <label><span>Rows per page</span><select value={limit} onChange={e=>{setLimit(Number(e.target.value));setPage(1)}}>{pageSizes.map(n=><option key={n}>{n}</option>)}</select></label>
        <label><span><ArrowDownUp size={13}/>Sort</span><select value={sort} onChange={e=>{setSort(e.target.value);setPage(1)}}>{sortOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
      </section>
      {notice&&<div className="notice"><ShieldCheck size={16}/>{notice}</div>}
      <section className="tablecard"><div className="headline"><div><b>Showing {p.from}–{p.to}</b> <span>of {p.total} records</span></div><div className="fetchstate">{orders.isFetching?<><LoaderCircle size={14} className="spin"/>Fetching page</>:<><ShieldCheck size={14}/>Page cached</>}</div></div>
        {orders.isLoading?<div className="empty"><LoaderCircle size={30} className="spin"/><h3>Loading first page</h3></div>:orders.isError?<div className="empty"><Server size={30}/><h3>Pagination request failed</h3><p>{orders.error?.message}</p></div>:
        <div className="tablewrap"><table><thead><tr><th>#</th><th>ORDER</th><th>COMPANY</th><th>CONTACT</th><th>PLAN</th><th>STATUS</th><th>AMOUNT</th><th>CREATED</th><th></th></tr></thead><tbody>{rows.map((r,i)=><tr key={r.id}><td className="muted">{p.from+i}</td><td><strong>{r.order_code}</strong></td><td>{r.company}</td><td className="muted">{r.contact_name}</td><td>{r.plan}</td><td><span className={`status ${r.status}`}>{r.status}</span></td><td><strong>{money(r.amount)}</strong></td><td className="muted">{dateTime(r.created_at)}</td><td><button className="delete" disabled={deleteM.isPending} onClick={()=>deleteM.mutate(r.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>}
        <div className="pager"><div>Page <b>{p.page}</b> of <b>{p.totalPages}</b></div><div className="pagerbuttons"><button disabled={!p.hasPreviousPage} onClick={()=>setPage(1)}><ChevronsLeft size={17}/></button><button disabled={!p.hasPreviousPage} onClick={()=>setPage(v=>Math.max(1,v-1))}><ChevronLeft size={17}/></button>{nums.map(n=><button key={n} className={p.page===n?'active':''} onClick={()=>setPage(n)}>{n}</button>)}<button disabled={!p.hasNextPage} onClick={()=>setPage(v=>Math.min(p.totalPages,v+1))}><ChevronRight size={17}/></button><button disabled={!p.hasNextPage} onClick={()=>setPage(p.totalPages)}><ChevronsRight size={17}/></button></div></div>
      </section>
      <section className="concepts"><article><b>Exact count</b><p>Total rows calculate accurate page numbers.</p></article><article><b>Range query</b><p>Page 3 with 10 rows becomes `.range(20, 29)`.</p></article><article><b>Cached pages</b><p>Each page has its own React Query cache key.</p></article><article><b>Next-page prefetch</b><p>The next page is warmed before you click it.</p></article></section>
    </main>
  </div>;
}
