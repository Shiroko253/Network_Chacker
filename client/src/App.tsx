// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const App: React.FC = () => {
  const [latencyData, setLatencyData] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);

  const recordLatency = async () => {
    const start = performance.now();
    try {
      await fetch('https://www.google.com', { method: 'HEAD', cache: 'no-store' });
      const latency = performance.now() - start;
      addData(latency);
      if (latency > 400) sendFluctuation(latency);
    } catch (err) {
      addData(null);
      sendDisconnection((err as Error).message);
    }
  };

  const addData = (latency: number | null) => {
    setLatencyData((prev: number[]) => [...prev.slice(-49), latency ?? 0]);
    setTimestamps((prev: string[]) => [...prev.slice(-49), new Date().toLocaleTimeString()]);
  };

  const sendFluctuation = async (latency: number) => {
    await fetch('/api/record-fluctuation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latency, timestamp: new Date().toISOString() })
    });
  };

  const sendDisconnection = async (error: string) => {
    await fetch('/api/record-disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error, timestamp: new Date().toISOString() })
    });
  };

  useEffect(() => {
    const interval = setInterval(recordLatency, 3000);
    return () => clearInterval(interval);
  }, []);

  const data = {
    labels: timestamps,
    datasets: [
      {
        label: '延遲 (ms)',
        data: latencyData,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false
      }
    ]
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">網絡延遲監測器</h1>
      <Line data={data} />
    </div>
  );
};

export default App;
