import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Activity, 
  Battery, 
  Zap, 
  Thermometer, 
  TrendingUp, 
  AlertTriangle,
  Cpu,
  Globe,
  Settings,
  Bell
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SystemStats {
  coilTemp: number;
  energyProduced: number;
  energyStored: number;
  energyConsumed: number;
  timestamp: string;
  history: Array<{
    time: string;
    produced: number;
    consumed: number;
  }>;
}

export default function App() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));
    newSocket.on('stats_update', (data: SystemStats) => {
      setStats(data);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-zinc-400 font-mono">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-12 h-12 animate-pulse text-emerald-500" />
          <p className="text-sm tracking-widest uppercase">Initializing MagnoGen Core...</p>
        </div>
      </div>
    );
  }

  const isTempHigh = stats.coilTemp > 80;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              connected ? "bg-emerald-500 led-glow-green" : "bg-red-500 led-glow-red"
            )} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              System Status: {connected ? 'Online' : 'Offline'}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Globe className="text-emerald-500 w-8 h-8" />
            MagnoGen <span className="text-zinc-500 font-light">v2.4</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Earth's Magnetic Field Energy Harvester</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
            <Settings size={20} />
          </button>
          <div className="h-10 w-px bg-zinc-800 mx-2 hidden md:block" />
          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
            <Cpu className="text-blue-500" size={20} />
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase font-mono leading-none">Core Load</p>
              <p className="text-sm font-bold font-mono">14.2%</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Coil Temperature Gauge */}
        <div className={cn(
          "stat-card relative overflow-hidden",
          isTempHigh && "border-red-500/50 bg-red-500/5"
        )}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-zinc-800/50">
              <Thermometer className={cn(isTempHigh ? "text-red-500" : "text-orange-500")} size={24} />
            </div>
            {isTempHigh && (
              <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold uppercase animate-bounce">
                <AlertTriangle size={12} /> Critical
              </div>
            )}
          </div>
          <p className="text-zinc-500 text-xs uppercase font-mono tracking-wider mb-1">Coil Temp</p>
          <h2 className="text-4xl font-bold font-mono tracking-tighter">
            {stats.coilTemp}°<span className="text-2xl text-zinc-500">C</span>
          </h2>
          
          <div className="mt-6 h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                stats.coilTemp < 60 ? "bg-emerald-500" : stats.coilTemp < 80 ? "bg-orange-500" : "bg-red-500"
              )}
              style={{ width: `${stats.coilTemp}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono text-zinc-600">
            <span>20°C</span>
            <span>100°C</span>
          </div>
        </div>

        {/* Energy Produced */}
        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-zinc-800/50">
              <Zap className="text-emerald-500" size={24} />
            </div>
            <div className="text-emerald-500 flex items-center gap-1 text-[10px] font-bold uppercase">
              <TrendingUp size={12} /> +2.4%
            </div>
          </div>
          <p className="text-zinc-500 text-xs uppercase font-mono tracking-wider mb-1">Energy Produced</p>
          <h2 className="text-4xl font-bold font-mono tracking-tighter">
            {stats.energyProduced}<span className="text-2xl text-zinc-500">W</span>
          </h2>
          <div className="mt-4 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.history}>
                <Area type="monotone" dataKey="produced" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Stored (Battery) */}
        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-zinc-800/50">
              <Battery className="text-blue-500" size={24} />
            </div>
          </div>
          <p className="text-zinc-500 text-xs uppercase font-mono tracking-wider mb-1">Storage Capacity</p>
          <div className="flex items-end gap-2">
            <h2 className="text-4xl font-bold font-mono tracking-tighter">
              {stats.energyStored}<span className="text-2xl text-zinc-500">%</span>
            </h2>
          </div>
          
          <div className="mt-6 flex gap-1 h-8">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i}
                className={cn(
                  "flex-1 rounded-sm transition-all duration-500",
                  i < Math.floor(stats.energyStored / 10) 
                    ? "bg-blue-500 led-glow-blue" 
                    : "bg-zinc-800"
                )}
              />
            ))}
          </div>
          <p className="mt-3 text-[10px] font-mono text-zinc-500 uppercase text-center">
            Lithium-Ion Array: Nominal
          </p>
        </div>

        {/* Energy Consumed */}
        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-zinc-800/50">
              <Activity className="text-purple-500" size={24} />
            </div>
          </div>
          <p className="text-zinc-500 text-xs uppercase font-mono tracking-wider mb-1">Energy Consumed</p>
          <h2 className="text-4xl font-bold font-mono tracking-tighter">
            {stats.energyConsumed}<span className="text-2xl text-zinc-500">W</span>
          </h2>
          <div className="mt-4 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.history.slice(-10)}>
                <Bar dataKey="consumed" fill="#a855f7" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Large Charts Section */}
        <div className="md:col-span-2 lg:col-span-3 glass-panel p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={20} />
              Generation vs Consumption
            </h3>
            <div className="flex gap-4 text-[10px] font-mono uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-zinc-400">Produced</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-zinc-400">Consumed</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${val}W`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111827', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono'
                  }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="produced" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 4, fill: '#10b981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="consumed" 
                  stroke="#a855f7" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 4, fill: '#a855f7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar / Secondary Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-panel p-6 flex-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4 font-mono">System Logs</h3>
            <div className="space-y-4">
              {[
                { time: '09:42:11', msg: 'Magnetic flux peak detected', type: 'info' },
                { time: '09:40:05', msg: 'Storage cell #4 balanced', type: 'success' },
                { time: '09:38:22', msg: 'Coil temp stabilized', type: 'success' },
                { time: '09:35:10', msg: 'Core frequency adjustment', type: 'warning' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="text-zinc-600 font-mono shrink-0">{log.time}</span>
                  <span className={cn(
                    "font-medium",
                    log.type === 'warning' ? "text-orange-500" : log.type === 'success' ? "text-emerald-500" : "text-blue-500"
                  )}>{log.msg}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors">
              View All Logs
            </button>
          </div>

          <div className="glass-panel p-6 bg-emerald-500/5 border-emerald-500/20">
            <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-2 font-mono">Efficiency</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono">94.8</span>
              <span className="text-emerald-500/60 font-mono text-sm">%</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
              Current conversion rate from magnetic flux to electrical potential is within optimal parameters.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-[10px] font-mono uppercase tracking-widest">
        <p>© 2026 MagnoGen Systems • Earth Magnetic Field Energy Project</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-400">Documentation</a>
          <a href="#" className="hover:text-zinc-400">API Reference</a>
          <a href="#" className="hover:text-zinc-400">Support</a>
        </div>
      </footer>
    </div>
  );
}
