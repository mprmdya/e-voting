import React from 'react'
import { Vote, LogOut, Shield } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import type { User } from '../firebase'

interface NavbarProps {
  user: User | null
  hasVoted: boolean
  onLogin: () => void
  onLogout: () => void
  isLoggingIn: boolean
  onOpenAdmin: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  hasVoted,
  onLogin,
  onLogout,
  isLoggingIn,
  onOpenAdmin,
}) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base tracking-tight">
                PEMIRA <span className="text-blue-600">TSU</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wide hidden sm:block">
              Tiga Serangkai University
            </p>
          </div>
        </div>

        {/* Right Nav: Admin + User Auth */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Admin Button */}
          <button
            onClick={onOpenAdmin}
            title="Buka Pengaturan Admin"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-2.5 pl-3 py-1 pr-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {(user.displayName || 'M')[0]}
                  </div>
                )}
                <span className="font-semibold text-slate-800 max-w-[120px] truncate hidden sm:inline">
                  {user.displayName?.split(' ')[0] || 'Mahasiswa'}
                </span>
                {hasVoted && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
                    Sudah Vote
                  </span>
                )}
              </div>
              <button
                onClick={onLogout}
                title="Keluar"
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-white transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              <FcGoogle className="w-4 h-4 bg-white rounded-full p-0.5" />
              <span>{isLoggingIn ? 'Memproses...' : 'Masuk Google'}</span>
            </button>
          )}
        </div>

      </div>
    </header>
  )
}
