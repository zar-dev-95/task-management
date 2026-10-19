import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 rounded-full">
            Tailwind CSS Active
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Clean Project
          </h1>
          <p className="text-sm text-slate-400">
            All default assets removed. Ready to start building!
          </p>
        </div>

        <div>
          <button
            onClick={() => setCount((c) => c + 1)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Count is: {count}
          </button>
        </div>
      </div>
    </div>
  )
}
