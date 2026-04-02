import { motion } from "framer-motion";
import { 
  TrendingUp, Users, ShoppingCart, 
  IndianRupee, Package, Star, Clock,
  ArrowUpRight, Gem, Crown, Zap, Tag,
  Server, Database, Cloud, Cpu, Activity, AlertCircle, CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import PageLoader from "../components/PageLoader";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  uniqueCustomers: number;
  recentOrders: any[];
  categoryStats: any[];
  chartData: any[];
}

interface HealthData {
  backend: { status: string; responseTime: number; uptime: string; uptimeSeconds: number; nodeVersion: string; platform: string };
  database: { status: string; latency: number; dataSize: number; storageSize: number; collections: number; indexes: number; objects: number; usedPercent: number };
  cloudinary: { usedBytes: number; limitBytes: number; usedPercent: number; totalResources: number; plan: string };
  memory: { heapUsed: number; heapTotal: number; heapPercent: number; rss: number };
  orders: { total: number; pending: number; processing: number; shipped: number; delivered: number; cancelled: number };
  timestamp: string;
}

const COLORS = ['#D4AF37', '#8B7500', '#B8860B', '#FFD700', '#DAA520'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const [statsRes, healthRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/health`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      setStats(await statsRes.json());
      if (healthRes.ok) setHealth(await healthRes.json());
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
      setHealthLoading(false);
    }
  };

  const refreshHealth = async () => {
    setHealthLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const healthRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/health`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (healthRes.ok) setHealth(await healthRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setHealthLoading(false);
    }
  };

  const cards = stats ? [
    { name: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, trend: "+12.4%", color: "text-rk-gold" },
    { name: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, trend: "+8.2%", color: "text-emerald-500" },
    { name: "Total Products", value: stats.totalProducts, icon: Gem, trend: "+3 new", color: "text-blue-400" },
    { name: "Total Customers", value: stats.uniqueCustomers, icon: Crown, trend: "98.4%", color: "text-purple-400" },
  ] : [];

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-8">
           <Star size={32} className="rotate-45" />
        </div>
        <h2 className="text-2xl font-display uppercase tracking-widest text-white mb-4">Data Load Failed</h2>
        <p className="text-[#555] text-xs uppercase tracking-[0.3em] max-w-xs leading-loose mb-10">{error}</p>
        <button 
          onClick={() => { setError(""); setLoading(true); fetchStats(); }}
          className="admin-btn-outline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header Area */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-[1px] gold-gradient"></div>
            <span className="text-rk-gold text-[10px] uppercase tracking-[0.5em] font-black">Admin Panel</span>
          </div>
          <h1 className="text-5xl font-display uppercase tracking-[0.1em] text-[#F5F5F5] font-black mb-4 flex items-center gap-6">
            Dashboard <span className="gold-gradient-text italic font-medium lowercase tracking-normal font-cormorant text-[3.5rem]">Overview</span>
          </h1>
          <p className="text-[#6A6A6A] text-sm tracking-[0.15em] font-light leading-relaxed uppercase">
            Real-time analytics and global performance data for Radhikarn Jewellery.
          </p>
        </motion.div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden glass-card p-10 rounded-3xl"
          >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 scale-150 transition-all duration-1000 -translate-x-12 translate-y-12">
              <card.icon size={120} className="text-rk-gold" />
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-rk-gold/5 border border-rk-gold/10 flex items-center justify-center text-rk-gold group-hover:scale-110 group-hover:border-rk-gold transition-all duration-700">
                <card.icon size={22} className="stroke-[1.5px]" />
              </div>
              <div className="text-right">
                <span className={`text-[9px] uppercase tracking-[0.4em] font-bold block mb-1 ${card.color === 'text-emerald-500' ? 'text-emerald-500' : 'text-rk-gold'}`}>{card.trend}</span>
                <TrendingUp size={14} className={card.color} />
              </div>
            </div>

            <p className="text-[10px] uppercase tracking-[0.3em] text-[#555] font-black mb-3">{card.name}</p>
            <h3 className="text-3xl font-display gold-gradient-text font-black leading-none">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Revenue Trends Chart */}
        <div className="xl:col-span-2 glass-card rounded-3xl p-10 relative overflow-hidden border-[#D4AF37]/10 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <TrendingUp size={20} className="text-rk-gold" />
              <h3 className="text-xl font-display uppercase tracking-[0.3em] text-white">Revenue Trends</h3>
            </div>
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#555] font-black">
              <span className="w-2 h-2 rounded-full bg-rk-gold"></span>
              Annual Growth
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData || []}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#444" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#444" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px' }}
                  itemStyle={{ textTransform: 'uppercase', fontSize: '10px', color: '#D4AF37' }}
                  cursor={{ stroke: 'rgba(212,175,55,0.2)', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#D4AF37" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Collection Distribution Pie */}
        <div className="glass-card rounded-3xl p-10 border-[#8B7500]/10 flex flex-col">
            <h3 className="text-xl font-display uppercase tracking-[0.2em] mb-10 text-[#F5F5F5] text-center">Category Distribution</h3>
            
            <div className="flex-1 min-h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.categoryStats || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {(stats?.categoryStats || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px' }}
                    itemStyle={{ textTransform: 'uppercase', fontSize: '10px', color: '#D4AF37' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              {stats?.categoryStats.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-[9px] uppercase tracking-widest text-[#666] font-black">{cat.name}</span>
                </div>
              ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 glass-card rounded-3xl p-10 relative overflow-hidden border-[#D4AF37]/10">
          <div className="flex items-center justify-between mb-10">
             <div className="flex items-center gap-4">
                <Clock size={20} className="text-rk-gold" />
                <h3 className="text-xl font-display uppercase tracking-[0.3em] text-white">Recent Transactions</h3>
             </div>
             <button className="text-[9px] uppercase tracking-widest text-[#555] hover:text-rk-gold transition-colors">View All</button>
          </div>
          
          <div className="space-y-4">
             {stats?.recentOrders.map((order, i) => (
                <motion.div 
                  key={order._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-rk-gold/20 transition-all group"
                >
                   <div className="flex gap-6 items-center">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-white/5 group-hover:border-rk-gold/40 transition-colors">
                         <img src={order.items[0]?.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" />
                      </div>
                      <div>
                         <p className="text-xs text-white font-bold tracking-widest uppercase mb-1">{order.customerName}</p>
                         <p className="text-[9px] text-[#444] font-mono tracking-tighter uppercase">{order.orderId}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-display gold-gradient-text font-bold mb-1">₹{order.totalAmount.toLocaleString()}</p>
                      <span className={`text-[8px] px-3 py-1 rounded-full uppercase tracking-widest font-black ${
                        order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rk-gold/10 text-rk-gold'
                      }`}>
                         {order.status}
                      </span>
                   </div>
                </motion.div>
             ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-10 border-[#8B7500]/10 flex flex-col justify-center items-center text-center">
            <div className="w-20 h-20 rounded-full gold-gradient mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.2)]">
               <Crown size={32} className="text-black" />
            </div>
            <h3 className="text-2xl font-display uppercase tracking-widest text-white mb-4">Business Insights</h3>
            <p className="text-[#6A6A6A] text-[10px] uppercase tracking-[0.3em] leading-loose max-w-[200px] mb-10">Inventory is healthy. Sales are strong in Rings category.</p>
            <div className="w-full space-y-4">
              <div className="p-5 rounded-2xl bg-rk-gold/5 border border-rk-gold/10 flex justify-between items-center text-[9px] uppercase tracking-widest font-black">
                 <span className="text-[#888]">Efficiency</span>
                 <span className="text-rk-gold">94.8%</span>
              </div>
              <div className="p-5 rounded-2xl bg-rk-gold/5 border border-rk-gold/10 flex justify-between items-center text-[9px] uppercase tracking-widest font-black">
                 <span className="text-[#888]">Database</span>
                 <span className="text-emerald-500">Healthy</span>
              </div>
            </div>
        </div>
      </div>


      {/* Platform Health */}
      {health && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-[1px] gold-gradient" />
              <span className="text-rk-gold text-[10px] uppercase tracking-[0.5em] font-black">Platform Health</span>
            </div>
            <button onClick={refreshHealth}
              className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-black text-white/30 hover:text-rk-gold transition-colors border border-white/5 hover:border-rk-gold/30 px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={healthLoading}>
              <Activity size={12} className={healthLoading ? 'animate-spin' : ''} /> {healthLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Backend */}
            <div className={`glass-card rounded-2xl p-6 border-white/5 space-y-4 transition-opacity ${healthLoading ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><Server size={15} className="text-rk-gold" /><span className="text-[10px] uppercase tracking-widest font-black text-white/50">Backend</span></div>
                <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase ${health.backend.status === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {health.backend.status === 'up' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}{health.backend.status}
                </span>
              </div>
              <div>
                <p className="text-3xl font-mono font-black text-white">{health.backend.responseTime}<span className="text-[10px] text-white/30 ml-1">ms</span></p>
                <p className="text-[9px] text-white/20 uppercase tracking-widest mt-1">Response time</p>
              </div>
              <div className="space-y-1 pt-2 border-t border-white/5 text-[9px] text-white/30 uppercase tracking-widest font-black">
                <p>Uptime: {health.backend.uptime}</p>
                <p>Node: {health.backend.nodeVersion}</p>
                <p>Platform: {health.backend.platform}</p>
              </div>
            </div>

            {/* MongoDB */}
            <div className={`glass-card rounded-2xl p-6 border-white/5 space-y-4 transition-opacity ${healthLoading ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><Database size={15} className="text-blue-400" /><span className="text-[10px] uppercase tracking-widest font-black text-white/50">MongoDB</span></div>
                <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase ${health.database.status === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {health.database.status === 'up' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}{health.database.status}
                </span>
              </div>
              <div>
                <p className="text-3xl font-mono font-black text-white">{health.database.latency}<span className="text-[10px] text-white/30 ml-1">ms</span></p>
                <p className="text-[9px] text-white/20 uppercase tracking-widest mt-1">Ping latency</p>
              </div>
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between text-[9px] text-white/30 uppercase tracking-widest font-black">
                  <span>Storage used</span><span className={health.database.usedPercent > 80 ? 'text-red-400' : 'text-white/50'}>{health.database.usedPercent}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${health.database.usedPercent > 80 ? 'bg-red-400' : health.database.usedPercent > 60 ? 'bg-yellow-400' : 'bg-blue-400'}`}
                    style={{ width: `${Math.min(100, health.database.usedPercent)}%` }} />
                </div>
                <p className="text-[9px] text-white/20 uppercase tracking-widest">{(health.database.storageSize / 1024 / 1024).toFixed(1)} MB of 512 MB · {health.database.collections} collections · {health.database.objects?.toLocaleString()} docs</p>
              </div>
            </div>

            {/* Cloudinary */}
            <div className={`glass-card rounded-2xl p-6 border-white/5 space-y-4 transition-opacity ${healthLoading ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center gap-3"><Cloud size={15} className="text-rk-gold" /><span className="text-[10px] uppercase tracking-widest font-black text-white/50">Cloudinary</span></div>
              <div>
                <p className="text-3xl font-mono font-black text-white">{health.cloudinary.usedPercent}<span className="text-[10px] text-white/30 ml-1">%</span></p>
                <p className="text-[9px] text-white/20 uppercase tracking-widest mt-1">Storage used</p>
              </div>
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${health.cloudinary.usedPercent > 80 ? 'bg-red-400' : health.cloudinary.usedPercent > 60 ? 'bg-yellow-400' : 'bg-rk-gold'}`}
                    style={{ width: `${Math.min(100, health.cloudinary.usedPercent)}%` }} />
                </div>
                <p className="text-[9px] text-white/20 uppercase tracking-widest">
                  {(health.cloudinary.usedBytes / 1024 / 1024).toFixed(0)} MB of {(health.cloudinary.limitBytes / 1024 / 1024 / 1024).toFixed(0)} GB · {health.cloudinary.totalResources} resources · {health.cloudinary.plan} plan
                </p>
              </div>
            </div>
          </div>

          {/* Order breakdown + heap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`glass-card rounded-2xl p-6 border-white/5 space-y-4 transition-opacity ${healthLoading ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center gap-3"><Activity size={15} className="text-emerald-400" /><span className="text-[10px] uppercase tracking-widest font-black text-white/50">Order Breakdown</span></div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Pending', val: health.orders.pending, color: 'text-amber-400' },
                  { label: 'Processing', val: health.orders.processing, color: 'text-blue-400' },
                  { label: 'Shipped', val: health.orders.shipped, color: 'text-purple-400' },
                  { label: 'Delivered', val: health.orders.delivered, color: 'text-emerald-400' },
                  { label: 'Cancelled', val: health.orders.cancelled, color: 'text-red-400' },
                  { label: 'Total', val: health.orders.total, color: 'text-rk-gold' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="bg-white/[0.02] rounded-xl p-3 text-center">
                    <p className={`text-xl font-mono font-black ${color}`}>{val}</p>
                    <p className="text-[8px] uppercase tracking-widest text-white/20 font-black mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`glass-card rounded-2xl p-6 border-white/5 space-y-4 transition-opacity ${healthLoading ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center gap-3"><Cpu size={15} className="text-purple-400" /><span className="text-[10px] uppercase tracking-widest font-black text-white/50">Process Memory</span></div>
              <div>
                <p className="text-3xl font-mono font-black text-white">{health.memory.heapUsed}<span className="text-[10px] text-white/30 ml-1">MB heap</span></p>
              </div>
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between text-[9px] text-white/30 uppercase tracking-widest font-black">
                  <span>Heap usage</span><span>{health.memory.heapPercent}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${health.memory.heapPercent > 80 ? 'bg-red-400' : 'bg-purple-400'}`}
                    style={{ width: `${Math.min(100, health.memory.heapPercent)}%` }} />
                </div>
                <p className="text-[9px] text-white/20 uppercase tracking-widest">{health.memory.heapUsed} / {health.memory.heapTotal} MB · RSS {health.memory.rss} MB</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
