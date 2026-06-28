import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" fill="#0f0f0f"/>
  </svg>
)

const SignOutIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const ADMIN_NAV = [
  {
    label: 'Dashboard', to: '/dashboard', end: true,
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  },
  {
    label: 'Orders', to: '/orders', end: false,
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
  },
  {
    label: 'Doors', to: '/admin/doors', end: false,
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="1" width="18" height="22" rx="1"/><circle cx="17" cy="12" r="1" fill="currentColor"/></svg>
  },
  {
    label: 'Windows', to: '/admin/windows', end: false,
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="18" rx="1"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
  },
  {
    label: 'Reports', to: '/reports', end: false,
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  },
  {
    label: 'Calc', to: '/calculator', end: false,
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="9" y2="10"/><line x1="12" y1="10" x2="13" y2="10"/><line x1="16" y1="10" x2="17" y2="10"/><line x1="8" y1="14" x2="9" y2="14"/><line x1="12" y1="14" x2="13" y2="14"/><line x1="16" y1="14" x2="17" y2="14"/><line x1="8" y1="18" x2="9" y2="18"/><line x1="12" y1="18" x2="13" y2="18"/><line x1="16" y1="18" x2="17" y2="18"/></svg>
  },
]

const CUSTOMER_NAV = [
  {
    label: 'Doors', to: '/doors', end: false,
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="1" width="18" height="22" rx="1"/><circle cx="17" cy="12" r="1" fill="currentColor"/></svg>
  },
  {
    label: 'Windows', to: '/windows', end: false,
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="18" rx="1"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
  },
  {
    label: 'Profile', to: '/profile', end: false,
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  },
  {
    label: 'Contact', to: '/contact', end: false,
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
  },
]

export default function Sidebar({ role }) {
  const navigate = useNavigate()
  const links    = role === 'admin' ? ADMIN_NAV : CUSTOMER_NAV

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <>
      {/* ── DESKTOP SIDEBAR ─────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-[260px] bg-[#111111] border-r border-white/[0.05] z-30">

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 gold-gradient rounded-xl flex items-center justify-center flex-shrink-0 glow-gold">
              <LogoIcon />
            </div>
            <div>
              <p className="text-white font-bold text-xs tracking-widest leading-tight uppercase">Lala Wood Works</p>
              <p className="text-white/25 text-[10px] mt-0.5">Sakrand</p>
            </div>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3 border-b border-white/[0.04]">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg ${
            role === 'admin'
              ? 'bg-[#D4A04A]/10 text-[#D4A04A] border border-[#D4A04A]/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${role === 'admin' ? 'bg-[#D4A04A]' : 'bg-emerald-400'}`} />
            {role === 'admin' ? 'Administrator' : 'Customer'}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-3 mb-3">Menu</p>
          {links.map(link => (
            <NavLink key={link.to} to={link.to} end={link.end}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#D4A04A]/10 text-[#D4A04A] border border-[#D4A04A]/15'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`
              }>
              {({ isActive }) => (
                <>
                  <span className={`flex-shrink-0 ${isActive ? 'text-[#D4A04A]' : 'text-white/25 group-hover:text-white/60'}`}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4A04A]" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sign out — desktop only */}
        <div className="px-3 py-4 border-t border-white/[0.05]">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/15 transition-all font-medium">
            <SignOutIcon />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR (logo + sign out) ────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-[#111111] border-b border-white/[0.05]">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center flex-shrink-0 glow-gold">
            <LogoIcon />
          </div>
          <div>
            <p className="text-white font-bold text-xs tracking-widest uppercase leading-tight">Lala Wood Works</p>
            <p className="text-white/25 text-[9px]">Sakrand</p>
          </div>
        </div>

        {/* Sign out button */}
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-semibold text-white/35 hover:text-red-400 bg-white/[0.04] hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20 px-3 py-2 rounded-xl transition-all">
          <SignOutIcon />
          <span>Sign Out</span>
        </button>
      </div>

      {/* ── MOBILE BOTTOM NAV ───────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#111111] border-t border-white/[0.05]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-stretch h-16">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 relative transition-all ${
                  isActive ? 'text-[#D4A04A]' : 'text-white/30'
                }`
              }>
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#D4A04A] rounded-b-full" />
                  )}
                  {/* Icon */}
                  <span className={`transition-all ${isActive ? 'text-[#D4A04A] scale-110' : 'text-white/30'}`}>
                    {link.icon}
                  </span>
                  {/* Label */}
                  <span className={`text-[9px] font-bold uppercase tracking-wide leading-none ${
                    isActive ? 'text-[#D4A04A]' : 'text-white/25'
                  }`}>
                    {link.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
