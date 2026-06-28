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

  const now = new Date()

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const day    = subDays(now, 6 - i)
    const label  = format(day, 'EEE')
    const dayStr = format(day, 'yyyy-MM-dd')
    const total  = orders
      .filter(o => (o.order_date || o.created_at?.slice(0, 10)) === dayStr)
      .reduce((s, o) => s + Number(o.total_bill || 0), 0)
    return { day: label, earnings: total }
  })

  const weekStart       = startOfWeek(now)
  const monthStart      = startOfMonth(now)
  const weeklyEarnings  = orders.filter(o => new Date(o.created_at) >= weekStart).reduce((s, o) => s + Number(o.total_bill || 0), 0)
  const monthlyEarnings = orders.filter(o => new Date(o.created_at) >= monthStart).reduce((s, o) => s + Number(o.total_bill || 0), 0)
  const totalEarnings   = orders.reduce((s, o) => s + Number(o.total_bill || 0), 0)
  const totalCollected  = orders.reduce((s, o) => s + Number(o.advance_paid || 0), 0)

  const StatCard = ({ label, value, sub, color = 'text-white', icon }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest leading-tight">{label}</p>
        <div className="w-8 h-8 bg-white/[0.04] rounded-xl flex items-center justify-center text-white/30 flex-shrink-0">
          {icon}
        </div>
      </div>
      <p className={`text-xl font-bold ${color} truncate`}>{value}</p>
      {sub && <p className="text-xs text-white/25 truncate">{sub}</p>}
    </div>
  )

  return (
    <div className="page-shell">
      <Sidebar role={role} />

      {/* offset for mobile top bar */}
      <div className="main-content pt-0 md:pt-0">

        <div className="topbar">
          <div>
            <h1 className="topbar-title">Dashboard</h1>
            <p className="topbar-sub">Welcome back, Admin</p>
          </div>
          <button onClick={() => navigate('/orders/new')} className="btn-primary text-xs px-3 py-2 md:text-sm md:px-5 md:py-2.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span className="hidden sm:inline">New Order</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* ── scrollable content ── */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-24 md:pb-6">

          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="stat-card">
                    <div className="skeleton h-3 w-16 mb-3 rounded"/>
                    <div className="skeleton h-7 w-20 rounded"/>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[1,2,3].map(i => (
                  <div key={i} className="stat-card">
                    <div className="skeleton h-3 w-20 mb-3 rounded"/>
                    <div className="skeleton h-7 w-28 rounded"/>
                  </div>
                ))}
              </div>
              <div className="card p-4">
                <div className="skeleton h-4 w-40 mb-4 rounded"/>
                <div className="skeleton h-44 w-full rounded-xl"/>
              </div>
            </div>
          ) : (
            <>
              {/* ── Row 1: 4 stat cards ── */}
              <div className="grid grid-cols-2 gap-3 fade-in">
                <StatCard
                  label="Customers" value={stats.customers} color="text-[#D4A04A]"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
                />
                <StatCard
                  label="Total Orders" value={stats.total}
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>}
                />
                <StatCard
                  label="Pending" value={stats.pending} color="text-amber-400"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                />
                <StatCard
                  label="Completed" value={stats.done} color="text-emerald-400"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>}
                />
              </div>

              {/* ── Row 2: earnings cards ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 fade-in">
                <StatCard
                  label="Total Revenue"
                  value={`Rs. ${totalEarnings.toLocaleString()}`}
                  sub={`Rs. ${totalCollected.toLocaleString()} collected`}
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
                />
                <StatCard
                  label="This Week"
                  value={`Rs. ${weeklyEarnings.toLocaleString()}`}
                  color="text-[#D4A04A]"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                />
                <StatCard
                  label="This Month"
                  value={`Rs. ${monthlyEarnings.toLocaleString()}`}
                  color="text-blue-400"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
                />
              </div>

              {/* ── Chart ── */}
              <div className="card p-4 md:p-5 fade-in">
                <p className="text-sm font-bold text-white/80 mb-4">Earnings — Last 7 Days</p>
                {/* w-full + overflow-hidden prevents horizontal scroll on mobile */}
                <div className="w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={chartData}
                      barSize={24}
                      margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => v > 0 ? `${(v/1000).toFixed(0)}k` : '0'}
                        width={36}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#1a1a1a',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 10,
                          color: '#f0ede8',
                          fontSize: 12,
                        }}
                        formatter={v => [`Rs. ${Number(v).toLocaleString()}`, 'Earnings']}
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      />
                      <Bar dataKey="earnings" fill="#D4A04A" radius={[5,5,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Recent orders ── */}
              <div className="card fade-in">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.05]">
                  <p className="text-sm font-bold text-white/80">Recent Orders</p>
                  <button
                    onClick={() => navigate('/orders')}
                    className="text-xs text-[#D4A04A] hover:text-[#e8b458] font-semibold transition-colors">
                    View all →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-white/25 text-sm">No orders yet</p>
                  </div>
                ) : (
                  orders.slice(0, 5).map((o, i) => {
                    const badgeCls = { pending: 'badge-amber', in_progress: 'badge-blue', done: 'badge-green' }[o.status] || 'badge-amber'
                    const label    = { pending: 'Pending', in_progress: 'In Progress', done: 'Done' }[o.status] || 'Pending'
                    return (
                      <div key={o.id}
                        className={`flex items-center justify-between px-4 py-3 gap-2 ${i < Math.min(orders.length, 5) - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">{o.customer_name}</p>
                          <p className="text-xs text-white/30 mt-0.5">
                            {new Date(o.created_at).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <p className="text-sm font-bold text-white hidden sm:block">
                            Rs. {Number(o.total_bill || 0).toLocaleString()}
                          </p>
                          <span className={badgeCls}>{label}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  )
}
