import React from 'react'
import { Trophy, Users, Radio, Sparkles, FileSpreadsheet } from 'lucide-react'
import type { Candidate } from '../data/paslonData'
import { exportResultsToCsv } from '../utils/exportCsv'

interface ResultsViewProps {
  candidates: Candidate[]
  votes: Map<string, number>
}

export const ResultsView: React.FC<ResultsViewProps> = ({ candidates, votes }) => {
  const totalVotes = Array.from(votes.values()).reduce((sum, v) => sum + v, 0)

  const stats = candidates.map((cand) => {
    const count = votes.get(cand.id) || 0
    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
    return {
      ...cand,
      count,
      percentage,
    }
  })

  // Determine leader
  const sorted = [...stats].sort((a, b) => b.count - a.count)
  const hasVotes = totalVotes > 0
  const isTied = hasVotes && sorted[0].count === sorted[1]?.count
  const leaderId = hasVotes && !isTied ? sorted[0].id : null

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <Users className="w-3.5 h-3.5" /> Total Suara
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalVotes}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Memimpin
          </p>
          <p className="text-xl font-black text-slate-900 mt-1">
            {leaderId ? `Paslon ${sorted[0].number}` : isTied ? 'Imbang' : '-'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> Status
          </p>
          <p className="text-xs font-bold text-emerald-600 mt-2">Real-Time Sync</p>
        </div>
      </div>

      {/* Main Results Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Hasil Perolehan Suara</h3>
            <p className="text-xs text-slate-500">Data ter-update otomatis dari database Firestore.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Quick Count
            </span>
            <button
              onClick={() => exportResultsToCsv(candidates, votes)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>Export (.csv)</span>
            </button>
          </div>
        </div>

        {totalVotes === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Belum ada suara masuk. Jadilah pemilih pertama di tab Bilik Suara!
          </div>
        ) : (
          <div className="space-y-6">
            {stats.map((cand) => {
              const isLeader = leaderId === cand.id

              return (
                <div key={cand.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-md font-bold text-[11px] flex items-center justify-center ${cand.theme.badgeBg} ${cand.theme.badgeText}`}
                      >
                        {cand.number}
                      </span>
                      <span className="font-bold text-slate-800 text-sm">{cand.title}</span>
                      {isLeader && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> Unggul
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="font-black text-slate-900 text-base">{cand.percentage}%</span>
                      <span className="text-slate-400 text-xs ml-1.5">({cand.count} suara)</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cand.theme.bar}`}
                      style={{ width: `${Math.max(cand.percentage, cand.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
