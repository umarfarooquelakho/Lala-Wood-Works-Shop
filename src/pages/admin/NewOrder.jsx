import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

const emptyDoor   = () => ({ design_id: '', design_name: '', height: '', width: '', quantity: 1, wood_type: '', notes: '' })
const emptyWindow = () => ({ design_id: '', design_name: '', height: '', width: '', quantity: 1, type: 'panel', notes: '' })

function Field({ label, required, children }) {
  return (
    <div>
      <label className="input-label">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

export default function NewOrder() {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const isEdit    = Boolean(id)

  const [loading,  setLoading]  = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [doorDesigns,   setDoorDesigns]   = useState([])
  const [windowDesigns, setWindowDesigns] = useState([])

  // Order fields
  const [customerName,  setCustomerName]  = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [orderDate,     setOrderDate]     = useState(new Date().toISOString().split('T')[0])
  const [expectedDate,  setExpectedDate]  = useState('')
  const [status,        setStatus]        = useState('pending')
  const [totalBill,     setTotalBill]     = useState('')
  const [advancePaid,   setAdvancePaid]   = useState('')
  const [notes,         setNotes]         = useState('')
  const [doors,         setDoors]         = useState([emptyDoor()])
  const [windows,       setWindows]       = useState([emptyWindow()])

  const remaining = (Number(totalBill) || 0) - (Number(advancePaid) || 0)

  useEffect(() => {
    fetchDesigns()
    if (isEdit) fetchOrder()
  }, [id])

  const fetchDesigns = async () => {
    const [{ data: d }, { data: w }] = await Promise.all([
      supabase.from('doors').select('id, name').eq('available', true),
      supabase.from('windows').select('id, name').eq('available', true),
    ])
    setDoorDesigns(d || [])
    setWindowDesigns(w || [])
  }

  const fetchOrder = async () => {
    setFetching(true)
    const [{ data: o }, { data: di }, { data: wi }] = await Promise.all([
      supabase.from('orders').select('*').eq('id', id).single(),
      supabase.from('order_doors').select('*').eq('order_id', id),
      supabase.from('order_windows').select('*').eq('order_id', id),
    ])
    if (o) {
      setCustomerName(o.customer_name || '')
      setCustomerPhone(o.customer_phone || '')
      setOrderDate(o.order_date || new Date().toISOString().split('T')[0])
      setExpectedDate(o.expected_date || '')
      setStatus(o.status || 'pending')
      setTotalBill(o.total_bill || '')
      setAdvancePaid(o.advance_paid || '')
      setNotes(o.notes || '')
    }
    if (di?.length) setDoors(di)
    if (wi?.length) setWindows(wi)
    setFetching(false)
  }

  const updD = (i, k, v) => { const a = [...doors];   a[i] = { ...a[i], [k]: v }; setDoors(a) }
  const updW = (i, k, v) => { const a = [...windows]; a[i] = { ...a[i], [k]: v }; setWindows(a) }

  const pickDoorDesign = (i, designId) => {
    const d = doorDesigns.find(x => x.id === designId)
    updD(i, 'design_id', designId)
    updD(i, 'design_name', d?.name || '')
  }

  const pickWindowDesign = (i, designId) => {
    const w = windowDesigns.find(x => x.id === designId)
    updW(i, 'design_id', designId)
    updW(i, 'design_name', w?.name || '')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!customerName.trim()) { toast.error('Customer name is required.'); return }
    setLoading(true)
    try {
      let orderId = id
      const payload = {
        customer_name:  customerName.trim(),
        customer_phone: customerPhone.trim(),
        order_date:     orderDate,
        expected_date:  expectedDate || null,
        status,
        total_bill:   Number(totalBill)   || 0,
        advance_paid: Number(advancePaid) || 0,
        notes:        notes.trim(),
      }

      if (isEdit) {
        const { error: updErr } = await supabase.from('orders').update(payload).eq('id', id)
        if (updErr) { console.error('Order update error:', updErr); throw updErr }
        await Promise.all([
          supabase.from('order_doors').delete().eq('order_id', id),
          supabase.from('order_windows').delete().eq('order_id', id),
        ])
      } else {
        const { data, error } = await supabase.from('orders').insert(payload).select().single()
        if (error) { console.error('Order insert error:', error); throw error }
        orderId = data.id
      }

      // Insert doors & windows
      const vd = doors.filter(d => d.height || d.width || d.design_name)
      const vw = windows.filter(w => w.height || w.width || w.design_name)

      if (vd.length) {
        const { error: dErr } = await supabase.from('order_doors').insert(
          vd.map(d => ({
            order_id:    orderId,
            design_id:   d.design_id   || null,
            design_name: d.design_name || null,
            height:      Number(d.height)   || null,
            width:       Number(d.width)    || null,
            wood_type:   d.wood_type   || null,
            quantity:    Number(d.quantity) || 1,
            notes:       d.notes       || null,
          }))
        )
        if (dErr) { console.error('Door insert error:', dErr); throw dErr }
      }

      if (vw.length) {
        const { error: wErr } = await supabase.from('order_windows').insert(
          vw.map(w => ({
            order_id:    orderId,
            design_id:   w.design_id   || null,
            design_name: w.design_name || null,
            height:      Number(w.height)   || null,
            width:       Number(w.width)    || null,
            type:        w.type        || 'panel',
            quantity:    Number(w.quantity) || 1,
            notes:       w.notes       || null,
          }))
        )
        if (wErr) { console.error('Window insert error:', wErr); throw wErr }
      }

      toast.success(isEdit ? 'Order updated!' : 'Order created!')
      navigate('/orders')
    } catch (err) {
      console.error('FULL ERROR:', err)
      toast.error(err?.message || 'Failed to save order. Please try again.')
    }
    setLoading(false)
  }

  if (fetching) return (
    <div className="page-shell flex items-center justify-center">
      <div className="dot-anim flex gap-1.5 text-[#D4A04A]"><span/><span/><span/></div>
    </div>
  )

  return (
    <div className="page-shell">
      <Sidebar role="admin" />
      <div className="main-content">

        <div className="topbar">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/orders')}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white border border-white/[0.06] transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div>
              <h1 className="topbar-title">{isEdit ? 'Edit Order' : 'New Order'}</h1>
              <p className="topbar-sub">Lala Wood Works</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-6 pb-16 space-y-4">
          <form onSubmit={handleSave} className="space-y-4">

            {/* Customer Info */}
            <div className="card p-5">
              <h2 className="section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Customer Info
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Customer Name" required>
                  <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Ahmed Khan" required className="input" />
                </Field>
                <Field label="Phone Number">
                  <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="03XX-XXXXXXX" className="input" />
                </Field>
                <Field label="Order Date">
                  <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} className="input" />
                </Field>
                <Field label="Expected Completion">
                  <input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} className="input" />
                </Field>
                <Field label="Status">
                  <select value={status} onChange={e => setStatus(e.target.value)} className="input">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* Doors */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title mb-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="1" width="18" height="22" rx="1"/><circle cx="17" cy="12" r="1" fill="currentColor"/></svg>
                  Doors
                </h2>
                <button type="button" onClick={() => setDoors([...doors, emptyDoor()])} className="btn-ghost text-xs border border-white/[0.06]">
                  + Add Door
                </button>
              </div>
              <div className="space-y-3">
                {doors.map((door, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Door {i + 1}</span>
                      {doors.length > 1 && (
                        <button type="button" onClick={() => setDoors(doors.filter((_,x) => x !== i))}
                          className="text-xs text-red-400/60 hover:text-red-400 transition-colors font-medium">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="input-label">Select Design</label>
                        <select value={door.design_id} onChange={e => pickDoorDesign(i, e.target.value)} className="input">
                          <option value="">-- Select door design --</option>
                          {doorDesigns.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      {[
                        { label: 'Height (inches)', key: 'height', type: 'number', ph: '84'         },
                        { label: 'Width (inches)',  key: 'width',  type: 'number', ph: '36'         },
                        { label: 'Wood Type',       key: 'wood_type', type: 'text', ph: 'e.g. Sheesham' },
                        { label: 'Quantity',        key: 'quantity', type: 'number', ph: '1'        },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="input-label">{f.label}</label>
                          <input type={f.type} value={door[f.key]} min={f.type === 'number' ? 1 : undefined}
                            onChange={e => updD(i, f.key, e.target.value)} placeholder={f.ph}
                            className="input" />
                        </div>
                      ))}
                      <div className="col-span-2">
                        <label className="input-label">Notes</label>
                        <input value={door.notes} onChange={e => updD(i, 'notes', e.target.value)}
                          placeholder="e.g. 2-panel carved, special finish" className="input" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Windows */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title mb-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="1"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
                  Windows
                </h2>
                <button type="button" onClick={() => setWindows([...windows, emptyWindow()])} className="btn-ghost text-xs border border-white/[0.06]">
                  + Add Window
                </button>
              </div>
              <div className="space-y-3">
                {windows.map((win, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Window {i + 1}</span>
                      {windows.length > 1 && (
                        <button type="button" onClick={() => setWindows(windows.filter((_,x) => x !== i))}
                          className="text-xs text-red-400/60 hover:text-red-400 transition-colors font-medium">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="input-label">Select Design</label>
                        <select value={win.design_id} onChange={e => pickWindowDesign(i, e.target.value)} className="input">
                          <option value="">-- Select window design --</option>
                          {windowDesigns.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                      </div>
                      {[
                        { label: 'Height (inches)', key: 'height',   type: 'number', ph: '48' },
                        { label: 'Width (inches)',  key: 'width',    type: 'number', ph: '36' },
                        { label: 'Quantity',        key: 'quantity', type: 'number', ph: '1'  },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="input-label">{f.label}</label>
                          <input type={f.type} value={win[f.key]} min={f.type === 'number' ? 1 : undefined}
                            onChange={e => updW(i, f.key, e.target.value)} placeholder={f.ph} className="input" />
                        </div>
                      ))}
                      <div>
                        <label className="input-label">Window Type</label>
                        <select value={win.type} onChange={e => updW(i, 'type', e.target.value)} className="input">
                          <option value="panel">Panel Window</option>
                          <option value="glass">Glass Window</option>
                          <option value="sliding">Sliding Window</option>
                          <option value="casement">Casement Window</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="input-label">Notes</label>
                        <input value={win.notes} onChange={e => updW(i, 'notes', e.target.value)}
                          placeholder="e.g. 4-pane, frosted glass" className="input" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="card p-5">
              <h2 className="section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                Payment
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Field label="Total Bill (Rs.)">
                  <input type="number" value={totalBill} onChange={e => setTotalBill(e.target.value)}
                    placeholder="0" min="0" className="input" />
                </Field>
                <Field label="Advance Paid (Rs.)">
                  <input type="number" value={advancePaid} onChange={e => setAdvancePaid(e.target.value)}
                    placeholder="0" min="0" className="input" />
                </Field>
              </div>
              <div className={`flex items-center justify-between p-4 rounded-xl border ${
                remaining > 0 ? 'bg-red-500/5 border-red-500/15' :
                remaining < 0 ? 'bg-amber-500/5 border-amber-500/15' :
                'bg-emerald-500/5 border-emerald-500/15'
              }`}>
                <div>
                  <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Remaining Balance</p>
                  {remaining < 0 && <p className="text-xs text-amber-400/70 mt-0.5">Overpaid by Rs. {Math.abs(remaining).toLocaleString()}</p>}
                </div>
                <p className={`text-xl font-bold ${remaining > 0 ? 'text-red-400' : remaining < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  Rs. {Math.abs(remaining).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="card p-5">
              <Field label="Order Notes (optional)">
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  rows={3} placeholder="Any additional notes about this order…"
                  className="input resize-none" />
              </Field>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
              {loading
                ? <span className="dot-anim flex gap-1"><span/><span/><span/></span>
                : isEdit ? 'Update Order' : 'Save Order'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
