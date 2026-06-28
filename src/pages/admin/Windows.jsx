import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

const emptyForm = () => ({ name: '', description: '', material: '', price_from: '', window_type: 'panel', image_url: '' })

export default function Windows({ role }) {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState(emptyForm())
  const [editing,  setEditing]  = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [uploading,setUploading]= useState(false)
  const [search,   setSearch]   = useState('')
  const fileRef = useRef()

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    setLoading(true)
    const { data } = await supabase.from('windows').select('*').order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB.'); return }
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `windows/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('designs').upload(path, file)
    if (upErr) { toast.error('Upload failed.'); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(path)
    setForm(f => ({ ...f, image_url: publicUrl }))
    setUploading(false)
    toast.success('Image uploaded!')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Design name is required.'); return }
    setSaving(true)
    const payload = { name: form.name.trim(), description: form.description.trim(), material: form.material.trim(), price_from: Number(form.price_from) || null, window_type: form.window_type, image_url: form.image_url, available: true }
    let error
    if (editing) {
      ({ error } = await supabase.from('windows').update(payload).eq('id', editing))
    } else {
      ({ error } = await supabase.from('windows').insert(payload))
    }
    if (error) { toast.error('Failed to save design.'); setSaving(false); return }
    toast.success(editing ? 'Design updated!' : 'Design added!')
    setForm(emptyForm()); setEditing(null); setShowForm(false)
    setSaving(false); fetchItems()
  }

  const handleEdit = (item) => {
    setForm({ name: item.name, description: item.description || '', material: item.material || '', price_from: item.price_from || '', window_type: item.window_type || 'panel', image_url: item.image_url || '' })
    setEditing(item.id); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this window design?')) return
    const { error } = await supabase.from('windows').update({ available: false }).eq('id', id)
    if (error) { toast.error('Failed to delete.'); return }
    toast.success('Design removed.')
    fetchItems()
  }

  const filtered = items.filter(i =>
    (i.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.material || '').toLowerCase().includes(search.toLowerCase())
  )

  const TYPE_LABELS = { panel: 'Panel', glass: 'Glass', sliding: 'Sliding', casement: 'Casement' }

  return (
    <div className="page-shell">
      <Sidebar role={role} />
      <div className="main-content">

        <div className="topbar">
          <div>
            <h1 className="topbar-title">Window Designs</h1>
            <p className="topbar-sub">{items.length} designs in catalog</p>
          </div>
          <button onClick={() => { setForm(emptyForm()); setEditing(null); setShowForm(!showForm) }}
            className={showForm ? 'btn-secondary' : 'btn-primary'}>
            {showForm ? 'Cancel' : (
              <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Design</>
            )}
          </button>
        </div>

        <div className="p-6 space-y-5 pb-24 md:pb-6">

          {showForm && (
            <form onSubmit={handleSubmit} className="card border-[#D4A04A]/15 p-5 fade-in">
              <h3 className="section-title">{editing ? 'Edit Window Design' : 'Add New Window Design'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {[
                  { key: 'name',        label: 'Design Name',      ph: 'e.g. 4-Pane Glass Window', req: true },
                  { key: 'material',    label: 'Material / Frame',  ph: 'e.g. Sheesham, Aluminum'           },
                  { key: 'price_from',  label: 'Starting Price (Rs.)', ph: '3000'                           },
                  { key: 'description', label: 'Description',       ph: 'Short description'                  },
                ].map(f => (
                  <div key={f.key} className={f.key === 'description' ? 'sm:col-span-2' : ''}>
                    <label className="input-label">{f.label}{f.req && <span className="text-red-400 ml-0.5">*</span>}</label>
                    <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.ph} required={f.req} className="input" />
                  </div>
                ))}
                <div>
                  <label className="input-label">Window Type</label>
                  <select value={form.window_type} onChange={e => setForm({ ...form, window_type: e.target.value })} className="input">
                    <option value="panel">Panel Window</option>
                    <option value="glass">Glass Window</option>
                    <option value="sliding">Sliding Window</option>
                    <option value="casement">Casement Window</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="input-label">Design Image</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-secondary text-xs gap-2 flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      {uploading ? 'Uploading…' : 'Upload Image'}
                    </button>
                    {form.image_url && <img src={form.image_url} alt="preview" className="w-16 h-16 object-cover rounded-xl border border-white/[0.1]" />}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving || uploading} className="btn-primary">
                  {saving ? <span className="dot-anim flex gap-1"><span/><span/><span/></span> : editing ? 'Update Design' : 'Save Design'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm()) }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}

          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search designs…" className="input pl-10" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="card p-0 overflow-hidden">
                  <div className="skeleton h-44 rounded-none rounded-t-2xl"/>
                  <div className="p-4 space-y-2"><div className="skeleton h-4 w-3/4"/><div className="skeleton h-3 w-1/2"/></div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-16 text-center fade-in">
              <div className="w-14 h-14 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/[0.05]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20"><rect x="2" y="3" width="20" height="18" rx="1"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
              </div>
              <p className="text-white/50 font-semibold mb-1">No window designs yet</p>
              <p className="text-white/25 text-sm">Use the button above to add your first design.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 fade-in">
              {filtered.map(item => (
                <div key={item.id} className="card-hover overflow-hidden">
                  <div className="relative h-44 bg-white/[0.03] overflow-hidden">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/10"><rect x="2" y="3" width="20" height="18" rx="1"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg></div>
                    }
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      {item.window_type && (
                        <span className="badge badge-blue">{TYPE_LABELS[item.window_type] || item.window_type}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-1 leading-tight">{item.name}</h3>
                    {item.description && <p className="text-xs text-white/35 mb-2 leading-relaxed">{item.description}</p>}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.material && (
                        <span className="text-[11px] bg-white/[0.04] text-white/40 border border-white/[0.06] px-2 py-0.5 rounded-lg font-medium">{item.material}</span>
                      )}
                      {item.price_from && (
                        <span className="text-[11px] bg-[#D4A04A]/10 text-[#D4A04A] border border-[#D4A04A]/15 px-2 py-0.5 rounded-lg font-medium">From Rs. {Number(item.price_from).toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(item)} className="btn-secondary flex-1 py-2 text-xs">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="btn-danger py-2 text-xs">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                        Delete
                      </button>
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
