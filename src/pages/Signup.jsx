import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

function pwStrength(pw) {
  let s = 0
  if (pw.length >= 6)          s++
  if (pw.length >= 10)         s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

export default function Signup() {
  const navigate = useNavigate()
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [sp,        setSp]        = useState(false)
  const [sc,        setSc]        = useState(false)

  const strength = pwStrength(password)
  const sColor   = ['','bg-red-500','bg-orange-500','bg-yellow-500','bg-emerald-500','bg-emerald-400'][strength]
  const sLabel   = ['','Very Weak','Weak','Fair','Strong','Very Strong'][strength]

  const handleSignup = async (e) => {
    e.preventDefault()
    if (password !== confirmPw) { toast.error('Passwords do not match.'); return }
    if (password.length < 6)   { toast.error('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: name } },
      })
      if (error) throw error
      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, full_name: name.trim(), role: 'customer' })
      }
      toast.success('Account created! Please check your email to confirm.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message?.includes('already registered') ? 'Email already registered.' : 'Signup failed.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] grid-bg flex">

      {/* LEFT */}
      <div className="auth-left">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A04A]/40 to-transparent" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#D4A04A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 gold-gradient rounded-xl flex items-center justify-center flex-shrink-0 glow-gold">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v10l9 5 9-5V7L12 2z" fill="#0f0f0f"/></svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-widest uppercase">Lala Wood Works</p>
              <p className="text-white/30 text-xs mt-0.5">Sakrand — Shop Management</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Join<br />
            <span className="gold-text">Lala Wood Works</span><br />
            today.
          </h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Create a customer account to browse our door & window designs and track your orders.
          </p>
        </div>

        <div className="relative">
          <p className="text-white/20 text-xs mb-3 uppercase tracking-widest">Already have an account?</p>
          <Link to="/login" className="btn-secondary w-full justify-center">Sign in instead</Link>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <div className="auth-card fade-in">

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 gold-gradient rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v10l9 5 9-5V7L12 2z" fill="#0f0f0f"/></svg>
            </div>
            <p className="text-white font-bold text-sm tracking-widest uppercase">Lala Wood Works</p>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
          <p className="text-white/40 text-sm mb-7">Fill in your details to get started.</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your full name" required className="input" />
            </div>
            <div>
              <label className="input-label">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required className="input" />
            </div>
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input type={sp ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required className="input pr-11" />
                <button type="button" onClick={() => setSp(!sp)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {sp
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? sColor : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-white/30">Strength: <span className="text-white/60 font-medium">{sLabel}</span></p>
                </div>
              )}
            </div>
            <div>
              <label className="input-label">Confirm Password</label>
              <div className="relative">
                <input type={sc ? 'text' : 'password'} value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat password" required
                  className={`input pr-11 ${confirmPw && confirmPw !== password ? 'border-red-500/40' : confirmPw && confirmPw === password ? 'border-emerald-500/40' : ''}`} />
                <button type="button" onClick={() => setSc(!sc)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {sc
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading ? <span className="dot-anim flex gap-1"><span/><span/><span/></span> : 'Create Account'}
            </button>
          </form>

          <div className="divider mt-6 mb-5" />
          <p className="text-center text-sm text-white/30">
            Already have an account?{' '}
            <Link to="/login" className="text-[#D4A04A] font-semibold hover:text-[#e8b458] transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
