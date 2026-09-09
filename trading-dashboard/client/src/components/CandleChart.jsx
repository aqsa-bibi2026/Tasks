import React from 'react';

export default function CandleChart({ data }) {
  const width = 900;
  const height = 320;
  const padding = 26;
  const values = data.flat();
  const min = Math.min(...values) - 4;
  const max = Math.max(...values) + 4;
  const y = (v) => height - padding - ((v - min) / (max - min)) * (height - padding * 2);
  const slot = (width - padding * 2) / data.length;

  const path = data.map((d, i) => {
    const x = padding + i * slot + slot / 2;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y(d[3])}`;
  }).join(' ');

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Illustrative candlestick chart">
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(49, 204, 139, .28)" />
            <stop offset="100%" stopColor="rgba(49, 204, 139, 0)" />
          </linearGradient>
        </defs>
        {[0,1,2,3,4].map((i) => (
          <line key={i} x1={padding} x2={width-padding} y1={padding + i*(height-padding*2)/4} y2={padding + i*(height-padding*2)/4} className="grid-line" />
        ))}
        <path d={`${path} L ${width-padding-slot/2} ${height-padding} L ${padding+slot/2} ${height-padding} Z`} fill="url(#area)" opacity=".55" />
        {data.map(([open, high, low, close], i) => {
          const cx = padding + i * slot + slot / 2;
          const up = close >= open;
          const bodyY = Math.min(y(open), y(close));
          const bodyH = Math.max(3, Math.abs(y(close)-y(open)));
          return (
            <g key={i} className={up ? 'candle up' : 'candle down'}>
              <line x1={cx} x2={cx} y1={y(high)} y2={y(low)} />
              <rect x={cx-slot*.22} y={bodyY} width={slot*.44} height={bodyH} rx="2" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
