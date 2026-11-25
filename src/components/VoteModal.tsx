import React from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Candidate } from '../data/paslonData'
import { TSU_LOGO_URL } from '../constants'

interface VoteModalProps {
  candidate: Candidate | null
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export const VoteModal: React.FC<VoteModalProps> = ({
  candidate,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !candidate) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <img
              src={TSU_LOGO_URL}
              alt="Logo TSU"
              className="h-6 w-auto object-contain shrink-0"
            />
            <h4 className="font-bold text-slate-900 text-sm">Konfirmasi Pilihan</h4>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Candidate Info */}
        <div className="text-center py-2 space-y-1">
          <span
            className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-black ${candidate.theme.badgeBg} ${candidate.theme.badgeText}`}
          >
            PASLON NO. {candidate.number}
          </span>
          <h3 className="text-lg font-bold text-slate-900">{candidate.title}</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            "{candidate.tagline}"
          </p>
        </div>

        {/* Warning text */}
        <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl text-center leading-relaxed">
          Pilihan bersifat <strong>rahasia dan final</strong>. Apakah Anda yakin ingin mengirim suara Anda untuk pasangan calon ini?
        </p>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl text-white shadow-xs transition-all cursor-pointer ${candidate.theme.button}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Ya, Konfirmasi</span>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
