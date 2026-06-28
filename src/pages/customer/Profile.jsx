import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

const STATUS = {
  pending:     { label: 'Pending',     cls: 'badge-amber' },
  in_progress: { label: 'In Progress', cls: 'badge-blue'  },
  done:        { label: 'Done',        cls: 'badge-green' },
}

export default function CustProfile({ role }) {
  const [profile,    setProfile]    = useState(null)
  const [orders,     setOrders]     = useState([])
  const [favorites,  setFavorites]  = useState({ doors: [], windows: [] })
  const [loading,    setLoading]    = useState(true)
  const [activeTab,  setActiveTab]  = useState('orders')
  const [expanded,   setExpanded]   = useState(null)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [{ data: prof }, { data: ords }, { data: favs }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('orders').select('*, order_doors(*), order_windows(*)').eq('customer_email', user.email).order('created_at', { ascending: false }),
      supabase.from('favorites').select('*, doors(*), windows(*)').eq('user_id', user.id),
    ])

    setProfile({ ...prof, email: user.email })

    // Also try matching by customer_name if email not stored
    const allOrders = ords || []
    setOrders(allOrders)

    const favDoors   = (favs || []).filter(f => f.category === 'door')
    const favWindows = (favs || []).filter(f => f.category === 'window')
    setFavorites({ doors: favDoors, windows: favWindows })
    setLoading(false)
  }

  const removeFav = async (favId) => {
    await supabase.from('favorites').delete().eq('id', favId)
    fetchAll()
  }

  if (loading) return (
    <div className="page-shell flex items-center justify-center">
      <div className="dot-anim flex gap-1.5 text-[#D4A04A]"><span/><span/><span/></div>
    </div>
  )

  const TABS = [
    { value: 'orders',    label: 'My Orders',    count: orders.length },
    { value: 'favorites', label: 'Favourites',   count: favorites.doors.length + favorites.windows.length },
  ]

  return (
    <div className="page-shell">
      <Sidebar role={role} />
      <div className="main-content">

        <div className="topbar">
          <div>
            <h1 className="topbar-title">My Profile</h1>
            <p className="topbar-sub">Account & order history</p>
          </div>
        </div>

        <div className="p-6 space-y-5 pb-24 md:pb-6">

          {/* Profile card */}
          <div className="card p-5 fade-in">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 gold-gradient rounded-2xl flex items-center justify-center flex-shrink-0 glow-gold">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <p className="font-bold text-white text-lg leading-tight">{profile?.full_name || 'Customer'}</p>
                <p className="text-white/40 text-sm mt-0.5">{profile?.email}</p>
                <span className="badge badge-green mt-1.5">Customer Account</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#1a1a1a] border border-white/[0.07] rounded-xl p-1 gap-0.5">
            {TABS.map(tab => (
              <button key={tab.value} onClick={() => setActiveTab(tab.value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.value ? 'bg-[#D4A04A] text-[#0f0f0f]' : 'text-white/35 hover:text-white/70'}`}>
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${activeTab === tab.value ? 'bg-[#0f0f0f]/20 text-[#0f0f0f]' : 'bg-white/[0.08] text-white/40'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Orders tab */}
          {activeTab === 'orders' && (
            <div className="space-y-3 fade-in">
              {orders.length === 0 ? (
                <div className="card p-14 text-center">
                  <p className="text-white/50 font-semibold mb-1">No orders yet</p>
                  <p className="text-white/25 text-sm">Your order history will appear here.</p>
                </div>
              ) : orders.map(order => {
                const st = STATUS[order.status] || STATUS.pending
                const isExp = expanded === order.id
                return (
                  <div key={order.id} className="card overflow-hidden">
                    <button className="w-full text-left p-5" onClick={() => setExpanded(isExp ? null : order.id)}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-white">{order.customer_name}</p>
                          <p className="text-xs text-white/30 mt-0.5">
                            Ordered: {new Date(order.order_date || order.created_at).toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'})}
                            {order.expected_date && ` · Due: ${new Date(order.expected_date).toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'})}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className={st.cls}>{st.label}</span>
                          <svg className={`text-white/30 transition-transform ${isExp ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden mt-4">
                        {[
                          { label: 'Total',     value: Number(order.total_bill   || 0), color: 'text-white'       },
                          { label: 'Paid',      value: Number(order.advance_paid || 0), color: 'text-emerald-400' },
                          { label: 'Remaining', value: Number(order.remaining    || 0), color: Number(order.remaining||0) > 0 ? 'text-red-400' : 'text-emerald-400' },
                        ].map((p, i) => (
                          <div key={i} className={`p-3 text-center ${i > 0 ? 'border-l border-white/[0.05]' : ''}`}>
                            <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wider mb-1">{p.label}</p>
                            <p className={`text-sm font-bold ${p.color}`}>Rs. {p.value.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </button>

                    {/* Expanded: door & window details */}
                    {isExp && (
                      <div className="px-5 pb-5 border-t border-white/[0.05] fade-in">
                        {(order.order_doors?.length > 0) && (
                          <div className="mt-4">
                            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Doors</p>
                            <div className="space-y-2">
                              {order.order_doors.map((d, i) => (
                                <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 flex flex-wrap gap-x-4 gap-y-1.5">
                                  {d.design_name && <span className="text-sm font-semibold text-white">{d.design_name}</span>}
                                  {d.height && <span className="text-xs text-white/40">H: {d.height}&Prime;</span>}
                                  {d.width  && <span className="text-xs text-white/40">W: {d.width}&Prime;</span>}
                                  {d.wood_type && <span className="text-xs text-white/40">{d.wood_type}</span>}
                                  {d.quantity && <span className="text-xs text-white/40">Qty: {d.quantity}</span>}
                                  {d.notes && <span className="text-xs text-white/30 w-full">{d.notes}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {(order.order_windows?.length > 0) && (
                          <div className="mt-4">
                            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Windows</p>
                            <div className="space-y-2">
                              {order.order_windows.map((w, i) => (
                                <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 flex flex-wrap gap-x-4 gap-y-1.5">
                                  {w.design_name && <span className="text-sm font-semibold text-white">{w.design_name}</span>}
                                  {w.type && <span className="badge badge-blue">{w.type}</span>}
                                  {w.height && <span className="text-xs text-white/40">H: {w.height}&Prime;</span>}
                                  {w.width  && <span className="text-xs text-white/40">W: {w.width}&Prime;</span>}
                                  {w.quantity && <span className="text-xs text-white/40">Qty: {w.quantity}</span>}
                                  {w.notes && <span className="text-xs text-white/30 w-full">{w.notes}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {order.notes && (
                          <div className="mt-3 text-xs text-white/30 bg-white/[0.02] px-3 py-2 rounded-lg border border-white/[0.04]">
                            Note: {order.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Favourites tab */}
          {activeTab === 'favorites' && (
            <div className="space-y-5 fade-in">
              {favorites.doors.length === 0 && favorites.windows.length === 0 ? (
                <div className="card p-14 text-center">
                  <p className="text-white/50 font-semibold mb-1">No favourites yet</p>
                  <p className="text-white/25 text-sm">Tap the heart icon on any door or window design to save it here.</p>
                </div>
              ) : (
                <>
                  {favorites.doors.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Saved Doors</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {favorites.doors.map(fav => (
                          <div key={fav.id} className="card-hover overflow-hidden">
                            {fav.doors?.image_url && <img src={fav.doors.image_url} alt={fav.doors?.name} className="w-full h-32 object-cover"/>}
                            <div className="p-3 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-white">{fav.doors?.name || '—'}</p>
                                {fav.doors?.material && <p className="text-xs text-white/30">{fav.doors.material}</p>}
                              </div>
                              <button onClick={() => removeFav(fav.id)} className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-all">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {favorites.windows.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Saved Windows</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {favorites.windows.map(fav => (
                          <div key={fav.id} className="card-hover overflow-hidden">
                            {fav.windows?.image_url && <img src={fav.windows.image_url} alt={fav.windows?.name} className="w-full h-32 object-cover"/>}
                            <div className="p-3 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-white">{fav.windows?.name || '—'}</p>
                                {fav.windows?.material && <p className="text-xs text-white/30">{fav.windows.material}</p>}
                              </div>
                              <button onClick={() => removeFav(fav.id)} className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-all">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
