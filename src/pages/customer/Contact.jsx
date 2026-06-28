import Sidebar from '../../components/Sidebar'

const CONTACTS = [
  { name: 'Haji Muhammad', phone: '0300 3231992', role: 'Owner'         },
  { name: 'Sher Muhammad',  phone: '0304 7909931', role: 'Owner'         },
  { name: 'Ali',            phone: '0303 6276320', role: 'Manager'       },
  { name: 'Haroon',         phone: '0308 8482975', role: 'Shop Assistant' },
]

export default function CustContact({ role }) {
  return (
    <div className="page-shell">
      <Sidebar role={role} />
      <div className="main-content">

        <div className="topbar">
          <div>
            <h1 className="topbar-title">Contact Us</h1>
            <p className="topbar-sub">Lala Wood Works — Sakrand</p>
          </div>
        </div>

        <div className="p-6 pb-24 md:pb-6 max-w-lg fade-in">

          {/* Shop info card */}
          <div className="card p-5 mb-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center flex-shrink-0 glow-gold">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-white text-base">Lala Wood Works</p>
                <p className="text-white/40 text-sm">Sakrand, Sindh, Pakistan</p>
              </div>
            </div>
            <div className="divider mb-4" />
            <div className="flex items-start gap-3 text-sm text-white/40">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Open daily · 9:00 AM – 8:00 PM</span>
            </div>
          </div>

          {/* Contact cards */}
          <p className="text-[11px] font-bold text-white/25 uppercase tracking-widest mb-3 px-1">
            Team Members
          </p>

          <div className="space-y-3">
            {CONTACTS.map((c, i) => (
              <div key={i} className="card-hover p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-[#D4A04A]/10 border border-[#D4A04A]/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#D4A04A] font-bold text-sm">
                      {c.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{c.name}</p>
                    <p className="text-white/30 text-xs mt-0.5">{c.role}</p>
                  </div>
                </div>

                {/* Call button */}
                <a
                  href={`tel:${c.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-2 rounded-xl transition-all">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  {c.phone}
                </a>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p className="text-center text-white/20 text-xs mt-8">
            Tap a number to call directly
          </p>
        </div>
      </div>
    </div>
  )
}
