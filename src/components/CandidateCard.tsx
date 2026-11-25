import React from 'react'
import { Check, Vote, CheckCircle2 } from 'lucide-react'
import type { Candidate } from '../data/paslonData'

interface CandidateCardProps {
  candidate: Candidate
  hasVoted: boolean
  isChosen: boolean
  onVote: (candidate: Candidate) => void
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  hasVoted,
  isChosen,
  onVote,
}) => {
  return (
    <div
      className={`relative flex flex-col bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-6 shadow-xs hover:shadow-md ${
        isChosen
          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
          : `border-slate-200 ${candidate.theme.borderHover}`
      }`}
    >
      {/* Top Row: Number & Status Badge */}
      <div className="flex items-center justify-between mb-5">
        <span
          className={`inline-flex items-center justify-center px-3 py-1 rounded-xl font-black text-sm ${candidate.theme.badgeBg} ${candidate.theme.badgeText}`}
        >
          NO. {candidate.number}
        </span>

        {isChosen && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pilihan Anda
          </span>
        )}
      </div>

      {/* Candidates Photos & Names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-5">
        {/* Pres */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <img
            src={candidate.presPhoto}
            alt={candidate.presName}
            className="w-11 h-11 rounded-lg object-cover shrink-0 ring-1 ring-slate-200"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase leading-none">
              Capresma
            </p>
            <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
              {candidate.presName}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{candidate.presFaculty}</p>
          </div>
        </div>

        {/* Vice */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <img
            src={candidate.vicePhoto}
            alt={candidate.viceName}
            className="w-11 h-11 rounded-lg object-cover shrink-0 ring-1 ring-slate-200"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase leading-none">
              Cawapresma
            </p>
            <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
              {candidate.viceName}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{candidate.viceFaculty}</p>
          </div>
        </div>
      </div>

      {/* Main Title & Tagline */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900 leading-snug">
          Paslon {candidate.number}: {candidate.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 italic leading-relaxed">
          "{candidate.tagline}"
        </p>
      </div>

      {/* Key Highlights */}
      <div className="space-y-2 mb-6 flex-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Fokus Utama:
        </p>
        <ul className="space-y-1.5 text-xs text-slate-600">
          {candidate.highlights.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${candidate.theme.accent}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <div>
        {hasVoted ? (
          <button
            disabled
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {isChosen ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-700">Telah Memilih Paslon Ini</span>
              </>
            ) : (
              <span>Voting Ditutup Untuk Anda</span>
            )}
          </button>
        ) : (
          <button
            onClick={() => onVote(candidate)}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2 ${candidate.theme.button}`}
          >
            <Vote className="w-4 h-4" />
            <span>Pilih Paslon {candidate.number}</span>
          </button>
        )}
      </div>
    </div>
  )
}
