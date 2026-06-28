import { useState, useCallback } from 'react'
import Sidebar from '../../components/Sidebar'

export default function Calculator({ role }) {
  const [display, setDisplay] = useState('0')
  const [prev,    setPrev]    = useState(null)
  const [op,      setOp]      = useState(null)
  const [newNum,  setNewNum]  = useState(true)
  const [history, setHistory] = useState([])

  const press = useCallback((val) => {
    if (val === 'C') {
      setDisplay('0'); setPrev(null); setOp(null); setNewNum(true)
      return
    }
    if (val === 'CE') {
      setDisplay('0'); setNewNum(true); return
    }
    if (val === '±') {
      setDisplay(d => String(-parseFloat(d))); return
    }
    if (val === '%') {
      setDisplay(d => String(parseFloat(d) / 100)); return
    }
    if (['+', '−', '×', '÷'].includes(val)) {
      setPrev(parseFloat(display))
      setOp(val)
      setNewNum(true)
      return
    }
    if (val === '=') {
      if (prev === null || !op) return
      const a = prev, b = parseFloat(display)
      let result
      switch (op) {
        case '+': result = a + b; break
        case '−': result = a - b; break
        case '×': result = a * b; break
        case '÷': result = b !== 0 ? a / b : 'Error'; break
        default: result = b
      }
      const res = typeof result === 'number' ? parseFloat(result.toFixed(10)).toString() : result
      const entry = `${a} ${op} ${b} = ${res}`
      setHistory(h => [entry, ...h.slice(0, 9)])
      setDisplay(res)
      setPrev(null); setOp(null); setNewNum(true)
      return
    }
    if (val === '.') {
      if (newNum) { setDisplay('0.'); setNewNum(false); return }
      if (!display.includes('.')) setDisplay(d => d + '.')
      return
    }
    if (val === '⌫') {
      if (display.length > 1) setDisplay(d => d.slice(0, -1))
      else setDisplay('0')
      return
    }
    // Number
    if (newNum) {
      setDisplay(String(val)); setNewNum(false)
    } else {
      setDisplay(d => d === '0' ? String(val) : d + val)
    }
  }, [display, prev, op, newNum])

  const BUTTONS = [
    ['C', 'CE', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['±', '0', '.', '='],
  ]

  const isOp  = (v) => ['+','−','×','÷','='].includes(v)
  const isFn  = (v) => ['C','CE','%','±','⌫'].includes(v)

  return (
    <div className="page-shell">
      <Sidebar role={role} />
      <div className="main-content">

        <div className="topbar">
          <div>
            <h1 className="topbar-title">Calculator</h1>
            <p className="topbar-sub">Standard arithmetic calculator</p>
          </div>
        </div>

        <div className="p-6 pb-24 md:pb-6">
          <div className="max-w-sm mx-auto space-y-4">

            {/* Calculator card */}
            <div className="card overflow-hidden fade-in">
              {/* Display */}
              <div className="px-5 pt-6 pb-4 bg-white/[0.02] border-b border-white/[0.05]">
                {op && prev !== null && (
                  <p className="text-right text-xs text-white/30 mb-1 font-mono">{prev} {op}</p>
                )}
                <p className="text-right text-4xl font-bold text-white font-mono tracking-tight overflow-hidden text-ellipsis">
                  {display.length > 12 ? parseFloat(display).toExponential(4) : display}
                </p>
              </div>

              {/* Backspace row */}
              <div className="px-4 py-2 flex justify-end border-b border-white/[0.04]">
                <button onClick={() => press('⌫')}
                  className="w-10 h-8 flex items-center justify-center text-white/40 hover:text-[#D4A04A] hover:bg-[#D4A04A]/10 rounded-lg transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
                </button>
              </div>

              {/* Button grid */}
              <div className="p-3 grid grid-cols-4 gap-2">
                {BUTTONS.flat().map((btn, i) => (
                  <button key={i} onClick={() => press(btn)}
                    className={`h-14 rounded-xl text-base font-bold transition-all active:scale-95 ${
                      btn === '='
                        ? 'bg-[#D4A04A] hover:bg-[#c4903a] text-[#0f0f0f] shadow-lg shadow-[#D4A04A]/20'
                        : isOp(btn)
                        ? 'bg-[#D4A04A]/15 hover:bg-[#D4A04A]/25 text-[#D4A04A]'
                        : isFn(btn)
                        ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white/60'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-white'
                    }`}>
                    {btn}
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="card fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">History</p>
                  <button onClick={() => setHistory([])} className="text-xs text-white/25 hover:text-white/60 transition-colors">Clear</button>
                </div>
                <div className="p-2">
                  {history.map((entry, i) => (
                    <div key={i} className="px-3 py-2 text-right font-mono text-sm text-white/40 hover:text-white/60 hover:bg-white/[0.03] rounded-lg transition-all cursor-default">
                      {entry}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
