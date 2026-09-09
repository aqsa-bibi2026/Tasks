import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Bell, ChevronDown, Search, Wallet } from 'lucide-react';
import CandleChart from './components/CandleChart.jsx';
import Sidebar from './components/Sidebar.jsx';
import { candleSeed, marketSeed, portfolioSeed } from './data/market.js';

const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

function App() {
  const [active, setActive] = useState('Overview');
  const [market, setMarket] = useState(marketSeed);
  const [selected, setSelected] = useState('NVDA');
  const [side, setSide] = useState('Buy');
  const [qty, setQty] = useState(1);
  const [orders, setOrders] = useState([
    { id: 1003, symbol: 'AAPL', side: 'Buy', qty: 5, price: 226.10, status: 'Filled' },
    { id: 1002, symbol: 'TSLA', side: 'Sell', qty: 2, price: 251.44, status: 'Filled' },
    { id: 1001, symbol: 'NVDA', side: 'Buy', qty: 3, price: 139.86, status: 'Filled' }
  ]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const id = setInterval(() => {
      setMarket(prev => prev.map(item => ({
        ...item,
        price: Math.max(1, +(item.price * (1 + (Math.random() - .5) * .0015)).toFixed(2))
      })));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const stock = market.find(m => m.symbol === selected) ?? market[0];
  const portfolioValue = useMemo(() => portfolioSeed.reduce((s, p) => s + p.shares * (market.find(m => m.symbol === p.symbol)?.price ?? p.price), 0), [market]);
  const invested = portfolioSeed.reduce((s, p) => s + p.shares * p.avg, 0);
  const gain = portfolioValue - invested;

  const placeOrder = async () => {
    const order = { symbol: selected, side, qty: Number(qty), price: stock.price };
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) });
      const saved = await res.json();
      setOrders(o => [saved, ...o]);
    } catch {
      setOrders(o => [{ id: Date.now(), ...order, status: 'Simulated' }, ...o]);
    }
    setToast(`${side} order placed for ${qty} ${selected}`);
    setTimeout(() => setToast(''), 2600);
  };

  return (
    <div className="app-shell">
      <Sidebar active={active} onChange={setActive} />
      <main className="main">
        <header className="topbar">
          <div><p className="eyebrow">Trading workspace</p><h1>{active}</h1></div>
          <div className="top-actions">
            <label className="search"><Search size={17}/><input placeholder="Search symbol or company" /></label>
            <button className="icon-btn"><Bell size={19}/><span className="dot"/></button>
            <button className="deposit"><Wallet size={17}/> Deposit</button>
          </div>
        </header>

        <section className="stats-grid">
          <article className="stat-card hero-stat"><div><span>Portfolio value</span><h2>{money(portfolioValue)}</h2><p className="positive"><ArrowUpRight size={16}/> {money(gain)} total gain</p></div><div className="mini-ring"><strong>+{((gain/invested)*100).toFixed(1)}%</strong><span>return</span></div></article>
          <article className="stat-card"><span>Buying power</span><h3>$12,480.00</h3><p className="muted">Available to trade</p></article>
          <article className="stat-card"><span>Today's P&L</span><h3 className="positive">+$684.21</h3><p className="positive"><ArrowUpRight size={15}/> +2.18%</p></article>
          <article className="stat-card"><span>Open orders</span><h3>04</h3><p className="muted">2 limit · 2 stop</p></article>
        </section>

        <section className="market-strip">
          {market.slice(0,5).map(m => <button key={m.symbol} onClick={() => setSelected(m.symbol)} className={selected===m.symbol?'selected':''}><strong>{m.symbol}</strong><span>{money(m.price)}</span><em className={m.change>=0?'positive':'negative'}>{m.change>=0?'+':''}{m.change}%</em></button>)}
        </section>

        <section className="content-grid">
          <article className="panel chart-panel">
            <div className="panel-head"><div><span className="symbol-name">{stock.symbol}</span><h2>{money(stock.price)}</h2><p className={stock.change>=0?'positive':'negative'}>{stock.change>=0?<ArrowUpRight size={15}/>:<ArrowDownRight size={15}/>} {stock.change>=0?'+':''}{stock.change}% today</p></div><div className="range-tabs"><button>1D</button><button className="active">1W</button><button>1M</button><button>1Y</button></div></div>
            <CandleChart data={candleSeed}/>
            <div className="chart-foot"><span>Illustrative market data</span><span>Vol {stock.volume}</span></div>
          </article>

          <aside className="panel order-panel">
            <div className="panel-head compact"><div><p className="eyebrow">Quick trade</p><h3>{selected}</h3></div><button className="plain">Market <ChevronDown size={15}/></button></div>
            <div className="side-toggle"><button className={side==='Buy'?'active buy':''} onClick={()=>setSide('Buy')}>Buy</button><button className={side==='Sell'?'active sell':''} onClick={()=>setSide('Sell')}>Sell</button></div>
            <label className="field"><span>Quantity</span><input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)}/></label>
            <label className="field"><span>Market price</span><div className="fake-input">{money(stock.price)}</div></label>
            <div className="order-summary"><div><span>Estimated total</span><strong>{money(stock.price * Number(qty || 0))}</strong></div><div><span>Est. fee</span><strong>$0.00</strong></div></div>
            <button className={`trade-btn ${side.toLowerCase()}`} onClick={placeOrder}>{side} {selected}</button>
            <p className="disclaimer">Demo interface only — no real trades are executed.</p>
          </aside>
        </section>

        <section className="lower-grid">
          <article className="panel"><div className="panel-title"><h3>Watchlist</h3><button>View all</button></div><div className="table-wrap"><table><thead><tr><th>Asset</th><th>Price</th><th>Change</th><th>Volume</th></tr></thead><tbody>{market.map(m=><tr key={m.symbol} onClick={()=>setSelected(m.symbol)}><td><strong>{m.symbol}</strong><small>{m.name}</small></td><td>{money(m.price)}</td><td className={m.change>=0?'positive':'negative'}>{m.change>=0?'+':''}{m.change}%</td><td>{m.volume}</td></tr>)}</tbody></table></div></article>
          <article className="panel"><div className="panel-title"><h3>Recent orders</h3><button>History</button></div><div className="orders">{orders.slice(0,5).map(o=><div className="order-row" key={o.id}><div className={`order-icon ${o.side.toLowerCase()}`}>{o.side==='Buy'?<ArrowDownRight size={17}/>:<ArrowUpRight size={17}/>}</div><div><strong>{o.side} {o.symbol}</strong><small>{o.qty} shares · {money(o.price)}</small></div><span className="status">{o.status}</span></div>)}</div></article>
        </section>
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;
