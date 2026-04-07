import { useEffect, useRef } from 'react';

export default function TradingViewChart() {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: 'TVC:UKOIL',
      interval: '60',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: '#05070a',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      backgroundColor: 'rgba(5, 7, 10, 1)',
      gridColor: 'rgba(26, 35, 50, 0.6)',
      allow_symbol_change: true,
      support_host: 'https://www.tradingview.com',
    });
    ref.current.appendChild(script);
  }, []);

  return (
    <div className="h-full w-full" style={{ minHeight: 300 }}>
      <div ref={ref} className="tradingview-widget-container h-full w-full" />
    </div>
  );
}
