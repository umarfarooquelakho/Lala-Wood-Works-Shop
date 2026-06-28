import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

const TYPE_LABELS = { panel: 'Panel', glass: 'Glass', sliding: 'Sliding', casement: 'Casement' }

export default function CustWindows({ role }) {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [favorites,setFavorites]= useState([])

  useEffect(() => { fetchItems(); fetchFavorites() }, [])

  const fetchItems = async () => {
    setLoading(true)
    const { data } = await supabase.from('windows').select('*').eq('available', true).order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  const fetchFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('favorites').select('item_id').eq('user_id', user.id).eq('category', 'window')
    setFavorites((data || []).map(f => f.item_id))
  }

  const toggleFavorite = async (itemId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (favorites.includes(itemId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('item_id', itemId).eq('category', 'window')
      setFavorites(f => f.filter(id => id !== itemId))
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, item_id: itemId, category: 'window' })
      setFavorites(f => [...f, itemId])
    }
  }

  const types = ['all', ...new Set(items.map(i => i.window_type).filter(Boolean))]

  const filtered = items.filter(i => {
    const ms = (i.name || '').toLowerCase().includes(search.toLowerCase()) || (i.material || '').toLowerCase().includes(search.toLowerCase())
    const mt = typeFilter === 'all' || i.window_type === typeFilter
    return ms && mt
  })

  return (
    <div className="page-shell">
      <Sidebar role={role} />
      <div className="main-content">

        <div className="topbar">
          <div>
            <h1 className="topbar-title">Window Designs</h1>
            <p className="topbar-sub">{items.length} designs available</p>
          </div>
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-[#1a1a1a] border border-white/[0.1] rounded-2xl max-w-lg w-full overflow-hidden fade-in" onClick={e => e.stopPropagation()}>
              {selected.image_url && <img src={selected.image_url} alt={selected.name} className="w-full h-64 object-cover"/>}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                  <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white transition-colors ml-4 flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                {selected.description && <p className="text-white/50 text-sm mb-4 leading-relaxed">{selected.description}</p>}
                <div className="flex flex-wrap gap-2">
                  {selected.window_type && <span className="badge badge-blue">{TYPE_LABELS[selected.window_type] || selected.window_type}</span>}
                  {selected.material && <span className="text-xs bg-white/[0.05] text-white/50 border border-white/[0.08] px-3 py-1.5 rounded-lg">{selected.material}</span>}
                  {selected.price_from && <span className="text-xs bg-[#D4A04A]/10 text-[#D4A04A] border border-[#D4A04A]/20 px-3 py-1.5 rounded-lg font-semibold">From Rs. {Number(selected.price_from).toLocaleString()}</span>}
                  <span className="badge badge-green">Available</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-5 pb-24 md:pb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search window designs…" className="input pl-10"/>
            </div>
            <div className="flex bg-[#1a1a1a] border border-white/[0.07] rounded-xl p-1 gap-0.5 flex-shrink-0">
              {types.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${typeFilter === t ? 'bg-[#D4A04A] text-[#0f0f0f]' : 'text-white/35 hover:text-white/70'}`}>
                  {t === 'all' ? 'All' : TYPE_LABELS[t] || t}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton h-44 rounded-none rounded-t-2xl"/>
                  <div className="p-4 space-y-2"><div className="skeleton h-4 w-3/4"/><div className="skeleton h-3 w-1/2"/></div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-16 text-center">
              <p className="text-white/50 font-semibold mb-1">No window designs found</p>
              <p className="text-white/25 text-sm">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 fade-in">
              {filtered.map(item => (
                <div key={item.id} className="card-hover overflow-hidden cursor-pointer" onClick={() => setSelected(item)}>
                  <div className="relative h-44 bg-white/[0.03] overflow-hidden">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/10"><rect x="2" y="3" width="20" height="18" rx="1"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg></div>
                    }
                    <button onClick={e => { e.stopPropagation(); toggleFavorite(item.id) }}
                      className={`absolute top-2 right-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${favorites.includes(item.id) ? 'bg-red-500 text-white' : 'bg-black/40 text-white/50 hover:text-white'}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={favorites.includes(item.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                    </button>
                    {item.window_type && (
                      <div className="absolute top-2 left-2">
                        <span className="badge badge-blue">{TYPE_LABELS[item.window_type] || item.window_type}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-1 leading-tight">{item.name}</h3>
                    {item.description && <p className="text-xs text-white/35 mb-2 line-clamp-2 leading-relaxed">{item.description}</p>}
                    <div className="flex flex-wrap gap-1.5">
                      {item.material && <span className="text-[11px] bg-white/[0.04] text-white/40 border border-white/[0.06] px-2 py-0.5 rounded-lg font-medium">{item.material}</span>}
                      {item.price_from && <span className="text-[11px] bg-[#D4A04A]/10 text-[#D4A04A] border border-[#D4A04A]/15 px-2 py-0.5 rounded-lg font-medium">From Rs. {Number(item.price_from).toLocaleString()}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
