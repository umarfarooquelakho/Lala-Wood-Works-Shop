import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns'

export default function Dashboard({ role }) {
  const navigate = useNavigate()
  const [stats,   setStats]   = useState({ total: 0, pending: 0, inProgress: 0, done: 0, customers: 0 })
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: allOrders }, { data: profiles }] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id').eq('role', 'customer'),
    ])
    const o = allOrders || []
    setOrders(o)
    setStats({
      total:      o.length,
      pending:    o.filter(x => x.status === 'pending').length,
      inProgress: o.filter(x => x.status === 'in_progress').length,
      done:       o.filter(x => x.status === 'done').length,
      customers:  (profiles || []).length,
    })
    setLoading(false)
  }

  // Weekly earnings chart data (last 7 days)
  const now = new Date()
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const day = subDays(now, 6 - i)
    const label = format(day, 'EEE')
    const dayStr = format(day, 'yyyy-MM-dd')
    const total = orders
      .filter(o => (o.order_date || o.created_at?.slice(0, 10)) === dayStr)
      .reduce((s, o) => s + Number(o.total_bill || 0), 0)
    return { day: label, earnings: total }
  })

  const weekStart  = startOfWeek(now)
  const monthStart = startOfMonth(now)
  const weeklyEarnings  = orders.filter(o => new Date(o.created_at) >= weekStart).reduce((s, o) => s + Number(o.total_bill || 0), 0)
  const monthlyEarnings = orders.filter(o => new Date(o.created_at) >= monthStart).reduce((s, o) => s + Number(o.total_bill || 0), 0)
  const totalEarnings   = orders.reduce((s, o) => s + Number(o.total_bill || 0), 0)
  const totalCollected  = orders.reduce((s, o) => s + Number(o.advance_paid || 0), 0)

  const StatCard = ({ label, value, sub, color = 'text-white', icon }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest">{label}</p>
        <div className="w-9 h-9 bg-white/[0.04] rounded-xl flex items-center justify-center text-white/30">
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-white/25">{sub}</p>}
    </div>
  )

  return (
    <div className="page-shell">
      <Sidebar role={role} />
      <div className="main-content">

        <div className="topbar">
          <div>
            <h1 className="topbar-title">Dashboard</h1>
            <p className="topbar-sub">Welcome back, Administrator</p>
          </div>
          <button onClick={() => navigate('/orders/new')} className="btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Order
          </button>
        </div>

        <div className="p-6 space-y-6 pb-24 md:pb-6">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="stat-card"><div className="skeleton h-4 w-24 mb-2"/><div className="skeleton h-8 w-32"/></div>)}
            </div>
          ) : (
            <>
              {/* Top stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-in">
                <StatCard label="Total Customers" value={stats.customers} color="text-[#D4A04A]"
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>} />
                <StatCard label="Total Orders" value={stats.total}
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>} />
                <StatCard label="Pending" value={stats.pending} color="text-amber-400"
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
                <StatCard label="Completed" value={stats.done} color="text-emerald-400"
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>} />
              </div>

              {/* Earnings row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 fade-in">
                <StatCard label="Total Revenue" value={`Rs. ${totalEarnings.toLocaleString()}`} color="text-white"
                  sub={`Rs. ${totalCollected.toLocaleString()} collected`}
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>} />
                <StatCard label="Weekly Earnings" value={`Rs. ${weeklyEarnings.toLocaleString()}`} color="text-[#D4A04A]"
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} />
                <StatCard label="Monthly Earnings" value={`Rs. ${monthlyEarnings.toLocaleString()}`} color="text-blue-400"
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} />
              </div>

              {/* Chart */}
              <div className="card p-5 fade-in">
                <p className="text-sm font-bold text-white/80 mb-4">Earnings — Last 7 Days</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={v => v > 0 ? `${(v/1000).toFixed(0)}k` : '0'} />
                    <Tooltip
                      contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#f0ede8', fontSize: 13 }}
                      formatter={v => [`Rs. ${Number(v).toLocaleString()}`, 'Earnings']}
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    />
                    <Bar dataKey="earnings" fill="#D4A04A" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent orders */}
              <div className="card fade-in">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                  <p className="text-sm font-bold text-white/80">Recent Orders</p>
                  <button onClick={() => navigate('/orders')} className="text-xs text-[#D4A04A] hover:text-[#e8b458] font-semibold">View all →</button>
                </div>
                {orders.slice(0, 5).map((o, i) => {
                  const s = { pending:'badge-amber', in_progress:'badge-blue', done:'badge-green' }[o.status] || 'badge-amber'
                  const l = { pending:'Pending', in_progress:'In Progress', done:'Done' }[o.status] || 'Pending'
                  return (
                    <div key={o.id} className={`flex items-center justify-between px-5 py-3.5 ${i < 4 ? 'border-b border-white/[0.04]' : ''}`}>
                      <div>
                        <p className="text-sm font-semibold text-white">{o.customer_name}</p>
                        <p className="text-xs text-white/30 mt-0.5">{new Date(o.created_at).toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'})}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-bold text-white">Rs. {Number(o.total_bill||0).toLocaleString()}</p>
                        <span className={s}>{l}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
