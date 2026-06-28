import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

const STATUS = {
  pending:     { label: 'Pending',     cls: 'badge-amber' },
  in_progress: { label: 'In Progress', cls: 'badge-blue'  },
  done:        { label: 'Done',        cls: 'badge-green' },
}

const FILTERS = [
  { value: 'all',         label: 'All'         },
  { value: 'pending',     label: 'Pending'     },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done',        label: 'Done'        },
]

export default function Orders({ role }) {
  const navigate = useNavigate()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const deleteOrder = async (id) => {
    if (!confirm('Delete this order? This cannot be undone.')) return
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) { toast.error('Failed to delete order.'); return }
    toast.success('Order deleted.')
    fetchOrders()
  }

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) { toast.error('Failed to update status.'); return }
    toast.success('Status updated.')
    fetchOrders()
  }

  const filtered = orders.filter(o => {
    const ms = (o.customer_name || '').toLowerCase().includes(search.toLowerCase())
    const mf = filter === 'all' || o.status === filter
    return ms && mf
  })

  const totalBill      = orders.reduce((s, o) => s + Number(o.total_bill   || 0), 0)
  const totalCollected = orders.reduce((s, o) => s + Number(o.advance_paid || 0), 0)
  const totalRemaining = orders.reduce((s, o) => s + Number(o.remaining    || 0), 0)

  return (
    <div className="page-shell">
      <Sidebar role={role} />
      <div className="main-content">

        <div className="topbar">
          <div>
            <h1 className="topbar-title">Orders</h1>
            <p className="topbar-sub">{orders.length} total orders</p>
          </div>
          <button onClick={() => navigate('/orders/new')} className="btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Order
          </button>
        </div>

        <div className="p-6 space-y-5 pb-24 md:pb-6">

          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 fade-in">
            {[
              { label: 'Total Earnings',  value: `Rs. ${totalBill.toLocaleString()}`,       sub: `${orders.length} orders`,   color: 'text-white'        },
              { label: 'Collected',       value: `Rs. ${totalCollected.toLocaleString()}`,  sub: `${totalBill ? Math.round(totalCollected/totalBill*100) : 0}% of total`, color: 'text-emerald-400'  },
              { label: 'Outstanding',     value: `Rs. ${totalRemaining.toLocaleString()}`,  sub: 'remaining balance',          color: 'text-red-400'      },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-white/25">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by customer name…" className="input pl-10" />
            </div>
            <div className="flex bg-[#1a1a1a] border border-white/[0.07] rounded-xl p-1 gap-0.5 flex-shrink-0">
              {FILTERS.map(f => (
                <button key={f.value} onClick={() => setFilter(f.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    filter === f.value ? 'bg-[#D4A04A] text-[#0f0f0f]' : 'text-white/35 hover:text-white/70'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="card p-5 space-y-3">
                  <div className="skeleton h-4 w-48" /><div className="skeleton h-3 w-32" />
                  <div className="grid grid-cols-3 gap-3"><div className="skeleton h-14 rounded-xl"/><div className="skeleton h-14 rounded-xl"/><div className="skeleton h-14 rounded-xl"/></div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-16 text-center fade-in">
              <div className="w-14 h-14 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/[0.05]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              </div>
              <p className="text-white/50 font-semibold mb-1">
                {search || filter !== 'all' ? 'No matching orders' : 'No orders yet'}
              </p>
              <p className="text-white/25 text-sm mb-5">
                {search || filter !== 'all' ? 'Try adjusting your search or filter.' : 'Create your first order to get started.'}
              </p>
              {!search && filter === 'all' && (
                <button onClick={() => navigate('/orders/new')} className="btn-primary mx-auto">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Create Order
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3 fade-in">
              {filtered.map(order => {
                const st = STATUS[order.status] || STATUS.pending
                return (
                  <div key={order.id} className="card-hover p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold text-white text-base">{order.customer_name}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-white/30">
                            {new Date(order.order_date || order.created_at).toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'})}
                          </span>
                          {order.customer_phone && <span className="text-xs text-white/30">{order.customer_phone}</span>}
                          {order.expected_date && (
                            <span className="text-xs text-[#D4A04A]/70">Due: {new Date(order.expected_date).toLocaleDateString('en-PK',{day:'2-digit',month:'short'})}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          className="bg-transparent border border-white/[0.08] rounded-lg text-xs text-white/60 px-2 py-1.5 focus:outline-none focus:border-[#D4A04A]/40 cursor-pointer">
                          <option value="pending" className="bg-[#1a1a1a]">Pending</option>
                          <option value="in_progress" className="bg-[#1a1a1a]">In Progress</option>
                          <option value="done" className="bg-[#1a1a1a]">Done</option>
                        </select>
                        <span className={st.cls}>{st.label}</span>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="grid grid-cols-3 bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden mb-4">
                      {[
                        { label: 'Total Bill', value: Number(order.total_bill || 0),   color: 'text-white'        },
                        { label: 'Advance',    value: Number(order.advance_paid || 0), color: 'text-emerald-400'  },
                        { label: 'Remaining',  value: Number(order.remaining || 0),    color: Number(order.remaining || 0) > 0 ? 'text-red-400' : 'text-emerald-400' },
                      ].map((p, i) => (
                        <div key={i} className={`p-3 text-center ${i > 0 ? 'border-l border-white/[0.05]' : ''}`}>
                          <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wider mb-1">{p.label}</p>
                          <p className={`text-sm font-bold ${p.color}`}>Rs. {p.value.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <p className="text-xs text-white/30 mb-3 bg-white/[0.02] px-3 py-2 rounded-lg border border-white/[0.04]">
                        {order.notes}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/orders/edit/${order.id}`)} className="btn-secondary flex-1 py-2 text-xs">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit Order
                      </button>
                      <button onClick={() => deleteOrder(order.id)} className="btn-danger py-2 text-xs">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
