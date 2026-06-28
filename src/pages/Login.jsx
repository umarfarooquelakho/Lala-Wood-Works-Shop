import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [role,     setRole]     = useState('admin')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', data.user.id).single()

      if (profile?.role !== role) {
        await supabase.auth.signOut()
        toast.error('Wrong role selected for this account.')
        setLoading(false)
        return
      }
      toast.success('Welcome back!')
      // App.jsx will automatically redirect based on role via onAuthStateChange
    } catch (err) {
      console.error('Login error:', err)
      toast.error(err.message || 'Login failed.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] grid-bg flex">

      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A04A]/40 to-transparent" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#D4A04A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#D4A04A]/3 rounded-full blur-3xl pointer-events-none" />

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
            Manage your<br />
            <span className="gold-text">woodwork shop</span><br />
            with ease.
          </h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Track orders, manage door & window designs, monitor payments and generate business reports — all in one place.
          </p>
        </div>

        <div className="relative space-y-3">
          {[
            { label: 'Order Management',      desc: 'Create, track and update orders'       },
            { label: 'Door & Window Catalog', desc: 'Upload and manage all designs'         },
            { label: 'Payment Tracking',      desc: 'Monitor bills and remaining balances'  },
            { label: 'Business Reports',      desc: 'Weekly and monthly earnings overview'  },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <div className="w-7 h-7 gold-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <p className="text-white text-xs font-semibold">{f.label}</p>
                <p className="text-white/35 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — FORM */}
      <div className="auth-right">
        <div className="auth-card fade-in">

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 gold-gradient rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v10l9 5 9-5V7L12 2z" fill="#0f0f0f"/></svg>
            </div>
            <p className="text-white font-bold text-sm tracking-widest uppercase">Lala Wood Works</p>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Sign in</h2>
          <p className="text-white/40 text-sm mb-7">Welcome back. Enter your credentials below.</p>

          {/* Role toggle */}
          <div className="flex bg-[#0f0f0f] rounded-xl p-1 mb-6 border border-white/[0.06]">
            {[
              { value: 'admin',    label: 'Administrator' },
              { value: 'customer', label: 'Customer'      },
            ].map(r => (
              <button key={r.value} onClick={() => setRole(r.value)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  role === r.value
                    ? 'bg-[#D4A04A] text-[#0f0f0f] shadow-lg'
                    : 'text-white/40 hover:text-white/70'
                }`}>
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="input-label">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required className="input" />
            </div>
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="input pr-11" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading ? <span className="dot-anim flex gap-1"><span/><span/><span/></span> : 'Sign In'}
            </button>
          </form>

          <div className="divider mt-6 mb-5" />
          <p className="text-center text-sm text-white/30">
            No account?{' '}
            <Link to="/signup" className="text-[#D4A04A] font-semibold hover:text-[#e8b458] transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
