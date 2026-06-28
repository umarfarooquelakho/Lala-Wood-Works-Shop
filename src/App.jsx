import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login       from './pages/Login'
import Signup      from './pages/Signup'
import Dashboard   from './pages/admin/Dashboard'
import Orders      from './pages/admin/Orders'
import NewOrder    from './pages/admin/NewOrder'
import Doors       from './pages/admin/Doors'
import Windows     from './pages/admin/Windows'
import Reports     from './pages/admin/Reports'
import Calculator  from './pages/admin/Calculator'
import CustDoors   from './pages/customer/Doors'
import CustWindows from './pages/customer/Windows'
import CustProfile from './pages/customer/Profile'
import CustContact from './pages/customer/Contact'

function Loading() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] grid-bg flex items-center justify-center">
      <div className="text-center fade-in">
        <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-5 glow-gold">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" fill="#0f0f0f"/>
          </svg>
        </div>
        <p className="text-white font-bold text-sm tracking-widest uppercase mb-1">Lala Wood Works</p>
        <p className="text-white/30 text-xs mb-4">Shop Management</p>
        <div className="dot-anim flex items-center justify-center gap-1.5 text-[#D4A04A]">
          <span /><span /><span />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [session,  setSession]  = useState(undefined) // undefined = still loading
  const [role,     setRole]     = useState(null)
  const [roleLoading, setRoleLoading] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) {
        setRoleLoading(true)
        await fetchRole(session.user.id)
        setRoleLoading(false)
      }
    })

    // Listen for auth changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        setRoleLoading(true)
        await fetchRole(session.user.id)
        setRoleLoading(false)
      } else {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchRole = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    setRole(data?.role || 'customer')
  }

  // Still checking session on first load
  if (session === undefined) return <Loading />

  // Session exists but role not yet loaded
  if (session && roleLoading) return <Loading />

  // Logged in — decide home page based on role
  const home = role === 'admin' ? '/dashboard' : '/doors'

  return (
    <BrowserRouter>
      <Routes>

        {/* Auth pages — redirect to home if already logged in */}
        <Route path="/login"  element={session ? <Navigate to={home} replace /> : <Login />} />
        <Route path="/signup" element={session ? <Navigate to={home} replace /> : <Signup />} />

        {/* Admin pages */}
        <Route path="/dashboard"
          element={session && role === 'admin' ? <Dashboard role={role} /> : <Navigate to={session ? '/doors' : '/login'} replace />} />
        <Route path="/orders"
          element={session && role === 'admin' ? <Orders role={role} /> : <Navigate to={session ? '/doors' : '/login'} replace />} />
        <Route path="/orders/new"
          element={session && role === 'admin' ? <NewOrder /> : <Navigate to={session ? '/doors' : '/login'} replace />} />
        <Route path="/orders/edit/:id"
          element={session && role === 'admin' ? <NewOrder /> : <Navigate to={session ? '/doors' : '/login'} replace />} />
        <Route path="/admin/doors"
          element={session && role === 'admin' ? <Doors role={role} /> : <Navigate to={session ? '/doors' : '/login'} replace />} />
        <Route path="/admin/windows"
          element={session && role === 'admin' ? <Windows role={role} /> : <Navigate to={session ? '/doors' : '/login'} replace />} />
        <Route path="/reports"
          element={session && role === 'admin' ? <Reports role={role} /> : <Navigate to={session ? '/doors' : '/login'} replace />} />
        <Route path="/calculator"
          element={session && role === 'admin' ? <Calculator role={role} /> : <Navigate to={session ? '/doors' : '/login'} replace />} />

        {/* Customer pages */}
        <Route path="/doors"
          element={session ? <CustDoors role={role} /> : <Navigate to="/login" replace />} />
        <Route path="/windows"
          element={session ? <CustWindows role={role} /> : <Navigate to="/login" replace />} />
        <Route path="/profile"
          element={session ? <CustProfile role={role} /> : <Navigate to="/login" replace />} />
        <Route path="/contact"
          element={session ? <CustContact role={role} /> : <Navigate to="/login" replace />} />

        {/* Root & catch-all */}
        <Route path="/"  element={session ? <Navigate to={home} replace /> : <Navigate to="/login" replace />} />
        <Route path="*"  element={session ? <Navigate to={home} replace /> : <Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}
