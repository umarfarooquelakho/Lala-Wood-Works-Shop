import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { startOfWeek, startOfMonth, format, subDays } from 'date-fns'

export default function Reports({ role }) {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [period,  setPeriod]  = useState('week')

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const now        = new Date()
  const weekStart  = startOfWeek(now)
  const monthStart = startOfMonth(now)

  const filtered = orders.filter(o => {
    const d = new Date(o.created_at)
    return period === 'week' ? d >= weekStart : d >= monthStart
  })

  const totalEarnings    = filtered.reduce((s, o) => s + Number(o.total_bill   || 0), 0)
  const totalCollected   = filtered.reduce((s, o) => s + Number(o.advance_paid || 0), 0)
  const totalPending     = filtered.reduce((s, o) => s + Number(o.remaining    || 0), 0)
  const doneOrders       = filtered.filter(o => o.status === 'done').length
  const inProgressOrders = filtered.filter(o => o.status === 'in_progress').length
  const pendingOrders    = filtered.filter(o => o.status === 'pending').length

  const collectionRate   = totalEarnings > 0 ? Math.round((totalCollected / totalEarnings) * 100) : 0

  // Chart: daily earnings for last 7 days
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const day    = subDays(now, 6 - i)
    const label  = format(day, 'EEE')
    const dayStr = format(day, 'yyyy-MM-dd')
    const total  = orders
      .filter(o => (o.order_date || o.created_at?.slice(0, 10)) === dayStr)
      .reduce((s, o) => s + Number(o.total_bill || 0), 0)
    return { day: label, earnings: total }
  })

  // Pie data
  const pieData = [
    { name: 'Done',        value: doneOrders,       color: '#34d399' },
    { name: 'In Progress', value: inProgressOrders, color: '#60a5fa' },
    { name: 'Pending',     value: pendingOrders,    color: '#fbbf24' },
  ].filter(d => d.value > 0)

  const allPendingPayments = orders.filter(o => Number(o.remaining || 0) > 0)

  return (
    <div className="page-shell">
      <Sidebar role={role} />
      <div className="main-content">

        <div className="topbar">
          <div>
            <h1 className="topbar-title">Reports</h1>
            <p className="topbar-sub">Business overview & insights</p>
          </div>
          <div className="flex bg-[#1a1a1a] border border-white/[0.07] rounded-xl p-1 gap-0.5">
            {[{ value: 'week', label: 'This Week' }, { value: 'month', label: 'This Month' }].map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${period === p.value ? 'bg-[#D4A04A] text-[#0f0f0f]' : 'text-white/35 hover:text-white/70'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5 pb-24 md:pb-6">

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="stat-card"><div className="skeleton h-3 w-24 mb-2"/><div className="skeleton h-8 w-28"/></div>)}
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-in">
                {[
                  { label: 'Total Orders',    value: filtered.length,                              color: 'text-white'        },
                  { label: 'Total Earnings',  value: `Rs. ${totalEarnings.toLocaleString()}`,       color: 'text-white'        },
                  { label: 'Collected',       value: `Rs. ${totalCollected.toLocaleString()}`,      color: 'text-emerald-400'  },
                  { label: 'Outstanding',     value: `Rs. ${totalPending.toLocaleString()}`,        color: 'text-red-400'      },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <p className="text-[11px] text-white/35 font-semibold uppercase tracking-widest">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Collection rate */}
              {totalEarnings > 0 && (
                <div className="card p-5 fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-white/80">Collection Rate</p>
                    <span className={`badge ${collectionRate >= 80 ? 'badge-green' : collectionRate >= 50 ? 'badge-amber' : 'badge-red'}`}>
                      {collectionRate}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${collectionRate >= 80 ? 'bg-emerald-400' : collectionRate >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${collectionRate}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-white/25 mt-2">
                    <span>Rs. {totalCollected.toLocaleString()} collected</span>
                    <span>Rs. {totalEarnings.toLocaleString()} total</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Bar chart */}
                <div className="card p-5 fade-in">
                  <p className="text-sm font-bold text-white/80 mb-4">Daily Earnings — Last 7 Days</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                      <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false}
                        tickFormatter={v => v > 0 ? `${(v/1000).toFixed(0)}k` : '0'}/>
                      <Tooltip
                        contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#f0ede8', fontSize: 13 }}
                        formatter={v => [`Rs. ${Number(v).toLocaleString()}`, 'Earnings']}
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}/>
                      <Bar dataKey="earnings" fill="#D4A04A" radius={[5,5,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Order status breakdown */}
                <div className="card p-5 fade-in">
                  <p className="text-sm font-bold text-white/80 mb-4">Order Status — {period === 'week' ? 'This Week' : 'This Month'}</p>
                  {filtered.length === 0 ? (
                    <div className="flex items-center justify-center h-[200px]">
                      <p className="text-white/25 text-sm">No orders in this period</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="50%" height={180}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                            {pieData.map((entry, index) => <Cell key={index} fill={entry.color}/>)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-3 flex-1">
                        {[
                          { label: 'Done',        count: doneOrders,       color: 'bg-emerald-400' },
                          { label: 'In Progress', count: inProgressOrders, color: 'bg-blue-400'    },
                          { label: 'Pending',     count: pendingOrders,    color: 'bg-amber-400'   },
                        ].map(s => (
                          <div key={s.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${s.color}`}/>
                              <span className="text-xs text-white/50">{s.label}</span>
                            </div>
                            <span className="text-sm font-bold text-white">{s.count}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-white/[0.05]">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/30">Total</span>
                            <span className="text-sm font-bold text-white">{filtered.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pending payments table */}
              <div className="card fade-in">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                  <p className="text-sm font-bold text-white/80">All Outstanding Payments</p>
                  <span className="badge badge-red">{allPendingPayments.length}</span>
                </div>
                {allPendingPayments.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-2xl mb-2">🎉</p>
                    <p className="text-white/50 font-semibold text-sm">All payments cleared!</p>
                  </div>
                ) : (
                  <>
                    {allPendingPayments.map((o, i) => (
                      <div key={o.id} className={`flex items-center justify-between px-5 py-3.5 ${i < allPendingPayments.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                        <div>
                          <p className="text-sm font-semibold text-white">{o.customer_name}</p>
                          <p className="text-xs text-white/30 mt-0.5">
                            {new Date(o.order_date || o.created_at).toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'})}
                            {o.customer_phone && ` · ${o.customer_phone}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-400">Rs. {Number(o.remaining).toLocaleString()}</p>
                          <p className="text-xs text-white/25">remaining</p>
                        </div>
                      </div>
                    ))}
                    <div className="px-5 py-3.5 border-t border-white/[0.05] flex justify-between items-center bg-white/[0.02]">
                      <span className="text-sm font-bold text-white/50">Total Outstanding</span>
                      <span className="text-base font-bold text-red-400">Rs. {allPendingPayments.reduce((s,o) => s + Number(o.remaining||0), 0).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
