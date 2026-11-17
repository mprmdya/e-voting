import { useState, useEffect, useCallback } from 'react'
import {
  authInstance,
  googleProvider,
  voteCollection,
  settingsDocRef,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  addDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type User,
} from './firebase'

// Detect iOS / iPadOS Safari — popup is blocked by OS, must use redirect
const isIOSSafari = (): boolean => {
  const ua = navigator.userAgent
  const isIOS = /iP(ad|hone|od)/.test(ua)
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return isIOS || isIPadOS
}
import { PASLON_LIST, type Candidate } from './data/paslonData'
import type { TabType, ToastMessage } from './types'
import { Navbar } from './components/Navbar'
import { CandidateCard } from './components/CandidateCard'
import { ResultsView } from './components/ResultsView'
import { VoteModal } from './components/VoteModal'
import { AdminPanel } from './components/AdminPanel'
import { Toast } from './components/Toast'
import { Vote, BarChart3, AlertCircle, AlertTriangle } from 'lucide-react'

const DEFAULT_CAMPUS_BG =
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>(PASLON_LIST)
  const [isVotingOpen, setIsVotingOpen] = useState<boolean>(true)
  const [campusDomain, setCampusDomain] = useState<string>('@tsu.ac.id')
  const [campusBg, setCampusBg] = useState<string>(DEFAULT_CAMPUS_BG)
  const [votes, setVotes] = useState<Map<string, number>>(new Map())
  const [hasVoted, setHasVoted] = useState<boolean>(false)
  const [chosenPaslonId, setChosenPaslonId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('vote')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // Admin State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false)

  // Toast Helper
  const addToast = useCallback(
    (type: ToastMessage['type'], message: string) => {
      const id = `${Date.now()}-${Math.random()}`
      setToasts((prev) => [...prev, { id, type, message }])
    },
    []
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Handle redirect result on mount (for iOS Safari — after Google redirect back)
  useEffect(() => {
    getRedirectResult(authInstance)
      .then((result) => {
        if (!result) return
        const loggedUser = result.user
        const email = (loggedUser.email || '').toLowerCase().trim()
        const domainCheck = campusDomain.toLowerCase().trim()

        if (domainCheck && !email.endsWith(domainCheck)) {
          signOut(authInstance)
          setUser(null)
          addToast(
            'error',
            `Akses Ditolak: Hanya email kampus (${campusDomain}) yang diizinkan. Akun ${email} ditolak.`
          )
          return
        }

        setUser(loggedUser)
        const userVoteKey = `voted_${loggedUser.uid}`
        const isAlreadyVoted = localStorage.getItem(userVoteKey)
        if (isAlreadyVoted && JSON.parse(isAlreadyVoted)) setHasVoted(true)
        const choiceKey = `choice_${loggedUser.uid}`
        const storedChoice = localStorage.getItem(choiceKey)
        if (storedChoice) setChosenPaslonId(storedChoice)
        addToast('success', `Berhasil masuk sebagai ${loggedUser.displayName || 'Mahasiswa'}`)
      })
      .catch((err) => {
        // Ignore cancelled redirect (user pressed back)
        if ((err as { code?: string })?.code !== 'auth/cancelled-popup-request') {
          console.error('getRedirectResult error:', err)
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run once on mount

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      if (currentUser && currentUser.email) {
        const email = currentUser.email.toLowerCase().trim()
        const domainCheck = campusDomain.toLowerCase()
        if (domainCheck && !email.endsWith(domainCheck)) {
          signOut(authInstance)
          setUser(null)
          return
        }
      }

      setUser(currentUser)
      if (currentUser) {
        const userVoteKey = `voted_${currentUser.uid}`
        const userChoiceKey = `choice_${currentUser.uid}`
        const localStatus = localStorage.getItem(userVoteKey) || localStorage.getItem('voted')
        const localChoice = localStorage.getItem(userChoiceKey) || localStorage.getItem('user_choice')

        if (localStatus) {
          setHasVoted(JSON.parse(localStatus))
        } else {
          setHasVoted(false)
        }
        if (localChoice) {
          setChosenPaslonId(localChoice)
        }
      } else {
        const stored = localStorage.getItem('voted')
        const storedChoice = localStorage.getItem('user_choice')
        if (stored) setHasVoted(JSON.parse(stored))
        if (storedChoice) setChosenPaslonId(storedChoice)
      }
    })
    return () => unsubscribe()
  }, [campusDomain])

  // Listen to Candidates & Election Settings from Firestore in Real-Time
  useEffect(() => {
    const unsub = onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
            setCandidates(data.candidates)
          }
          if (data.isVotingOpen !== undefined) {
            setIsVotingOpen(data.isVotingOpen)
          }
          if (data.campusDomain) {
            setCampusDomain(data.campusDomain)
          }
          if (data.campusBg) {
            setCampusBg(data.campusBg)
          }
        }
      },
      (err) => {
        console.warn('Settings listener note:', err)
      }
    )
    return () => unsub()
  }, [])

  // Real-time Firestore Vote Listener
  useEffect(() => {
    const q = query(voteCollection, orderBy('timestamp', 'desc'))
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const voteMap = new Map<string, number>()
        snapshot.forEach((doc) => {
          const data = doc.data()
          if (data.paslonId && data.votes !== undefined) {
            voteMap.set(data.paslonId, (voteMap.get(data.paslonId) || 0) + Number(data.votes))
          }
        })
        setVotes(voteMap)
      },
      (error) => {
        console.error('Firestore listener error:', error)
      }
    )
    return () => unsub()
  }, [])

  // Google Login — pakai redirect untuk iOS Safari, popup untuk browser lain
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true)
    try {
      if (isIOSSafari()) {
        // iOS Safari memblokir popup — gunakan redirect
        await signInWithRedirect(authInstance, googleProvider)
        // Halaman akan redirect ke Google; kode setelah ini tidak dijalankan
        return
      }

      const result = await signInWithPopup(authInstance, googleProvider)
      const loggedUser = result.user
      const email = (loggedUser.email || '').toLowerCase().trim()
      const domainCheck = campusDomain.toLowerCase().trim()

      // Pengecekan Domain Kampus @tsu.ac.id
      if (domainCheck && !email.endsWith(domainCheck)) {
        await signOut(authInstance)
        setUser(null)
        addToast(
          'error',
          `Akses Ditolak: Hanya email kampus (${campusDomain}) yang diizinkan. Akun ${email} ditolak.`
        )
        return
      }

      setUser(loggedUser)

      const userVoteKey = `voted_${loggedUser.uid}`
      const isAlreadyVoted = localStorage.getItem(userVoteKey)
      if (isAlreadyVoted && JSON.parse(isAlreadyVoted)) {
        setHasVoted(true)
      }

      addToast('success', `Berhasil masuk sebagai ${loggedUser.displayName || 'Mahasiswa'}`)
    } catch (error) {
      console.error('Google login error:', error)
      addToast('error', 'Gagal login dengan akun Google.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleSaveCampusDomain = async (newDomain: string) => {
    const formatted = newDomain.startsWith('@') ? newDomain : `@${newDomain}`
    await setDoc(settingsDocRef, { campusDomain: formatted }, { merge: true })
    setCampusDomain(formatted)
    addToast('success', `Filter domain kampus diatur ke: ${formatted}`)
  }

  const handleSaveCampusBg = async (newBg: string) => {
    await setDoc(settingsDocRef, { campusBg: newBg }, { merge: true })
    setCampusBg(newBg)
    addToast('success', 'Foto background kampus TSU berhasil diperbarui!')
  }

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(authInstance)
      setUser(null)
      addToast('info', 'Anda telah keluar akun.')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Candidate Selection
  const handleSelectCandidate = (candidate: Candidate) => {
    if (!isVotingOpen) {
      addToast('warning', 'Pemungutan suara sedang ditutup oleh panitia.')
      return
    }

    if (!user) {
      handleGoogleLogin()
      return
    }

    if (hasVoted) {
      addToast('warning', 'Anda sudah menggunakan hak suara Anda.')
      return
    }

    setSelectedCandidate(candidate)
    setIsModalOpen(true)
  }

  // Confirm Vote
  const handleConfirmVote = async () => {
    if (!selectedCandidate) return

    if (!isVotingOpen) {
      addToast('warning', 'Pemungutan suara ditutup.')
      setIsModalOpen(false)
      return
    }

    if (hasVoted) {
      addToast('warning', 'Anda sudah pernah memilih!')
      setIsModalOpen(false)
      return
    }

    setIsSubmitting(true)
    try {
      await addDoc(voteCollection, {
        paslonId: selectedCandidate.id,
        paslonName: selectedCandidate.title,
        votes: 1,
        voterUid: user?.uid || 'anon',
        voterEmail: user?.email || '',
        timestamp: serverTimestamp(),
      })

      setHasVoted(true)
      setChosenPaslonId(selectedCandidate.id)

      if (user?.uid) {
        localStorage.setItem(`voted_${user.uid}`, JSON.stringify(true))
        localStorage.setItem(`choice_${user.uid}`, selectedCandidate.id)
      }
      localStorage.setItem('voted', JSON.stringify(true))
      localStorage.setItem('user_choice', selectedCandidate.id)

      setIsModalOpen(false)
      addToast('success', `Suara berhasil dicatat untuk Paslon ${selectedCandidate.number}!`)

      setTimeout(() => {
        setActiveTab('results')
      }, 500)
    } catch (error) {
      console.error('Vote error:', error)
      addToast('error', 'Gagal mengirim suara. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ADMIN ACTIONS
  const handleAdminLogin = (password: string): boolean => {
    // Default admin PIN: 
    if (password === 'pemira112233') {
      setIsAdminLoggedIn(true)
      addToast('success', 'Berhasil masuk sebagai Admin!')
      return true
    }
    return false
  }

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false)
    setIsAdminModalOpen(false)
    addToast('info', 'Keluar dari mode admin.')
  }

  const handleSaveCandidates = async (updated: Candidate[]) => {
    await setDoc(settingsDocRef, { candidates: updated }, { merge: true })
    setCandidates(updated)
    addToast('success', 'Data paslon berhasil diperbarui ke Cloud Firestore!')
  }

  const handleToggleVotingOpen = async (isOpen: boolean) => {
    await setDoc(settingsDocRef, { isVotingOpen: isOpen }, { merge: true })
    setIsVotingOpen(isOpen)
    addToast(
      isOpen ? 'success' : 'warning',
      isOpen ? 'Pemilihan resmi DIBUKA.' : 'Pemilihan resmi DITUTUP sementara.'
    )
  }

  const handleResetVotes = async () => {
    try {
      const snapshot = await getDocs(voteCollection)
      const deletePromises = snapshot.docs.map((docItem) => deleteDoc(docItem.ref))
      await Promise.all(deletePromises)

      localStorage.removeItem('voted')
      localStorage.removeItem('user_choice')
      if (user?.uid) {
        localStorage.removeItem(`voted_${user.uid}`)
        localStorage.removeItem(`choice_${user.uid}`)
      }

      setHasVoted(false)
      setChosenPaslonId(null)
      addToast('success', 'Seluruh data suara berhasil di-reset ke 0.')
    } catch (err) {
      console.error('Reset votes error:', err)
      addToast('error', 'Gagal mereset data suara.')
    }
  }

  const totalVotesCount = Array.from(votes.values()).reduce((sum, v) => sum + v, 0)

  return (
    <div className="min-h-screen relative flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Campus Image Layer */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url(${campusBg})`,
        }}
      />
      {/* Dark Translucent Glass Overlay for High Contrast */}
      <div className="fixed inset-0 z-0 bg-slate-950/75 backdrop-blur-[2px] pointer-events-none" />

      {/* Main Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Toast toasts={toasts} onDismiss={dismissToast} />

        {/* Confirmation Modal */}
        <VoteModal
          candidate={selectedCandidate}
          isOpen={isModalOpen}
          isSubmitting={isSubmitting}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmVote}
        />

        {/* Admin Panel Modal */}
        {isAdminModalOpen && (
          <AdminPanel
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            candidates={candidates}
            onSaveCandidates={handleSaveCandidates}
            isVotingOpen={isVotingOpen}
            onToggleVotingOpen={handleToggleVotingOpen}
            onResetVotes={handleResetVotes}
            isAdminLoggedIn={isAdminLoggedIn}
            onLoginAdmin={handleAdminLogin}
            onLogoutAdmin={handleAdminLogout}
            campusDomain={campusDomain}
            onSaveCampusDomain={handleSaveCampusDomain}
            campusBg={campusBg}
            onSaveCampusBg={handleSaveCampusBg}
          />
        )}

        {/* Clean Navbar */}
        <Navbar
          user={user}
          hasVoted={hasVoted}
          onLogin={handleGoogleLogin}
          onLogout={handleLogout}
          isLoggingIn={isLoggingIn}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
        />

        {/* Main Container */}
        <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 space-y-8">
          
          {/* Simple & Clean Header */}
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center gap-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 text-white border border-white/25 backdrop-blur-md tracking-wider uppercase">
                PEMIRA Tiga Serangkai University (TSU)
              </span>
              {!isVotingOpen && (
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/90 text-white backdrop-blur-xs">
                  Voting Ditutup
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              Pemilihan Presiden & Wakil Presiden
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto drop-shadow-xs">
              Gunakan hak suara Anda secara bijak. Setiap mahasiswa memiliki 1 suara sah yang dihitung secara real-time.
            </p>

            {/* Simple Tab Switcher */}
            <div className="pt-4 flex justify-center">
              <div className="inline-flex p-1 bg-slate-900/60 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
                <button
                  onClick={() => setActiveTab('vote')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'vote'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  <Vote className="w-3.5 h-3.5" />
                  <span>Bilik Suara</span>
                </button>

                <button
                  onClick={() => setActiveTab('results')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'results'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Hasil Suara ({totalVotesCount})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Voting Closed Banner */}
          {!isVotingOpen && (
            <div className="max-w-xl mx-auto flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-950/80 backdrop-blur-md border border-rose-500/40 text-rose-200 text-xs shadow-lg">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Perhatian:</strong> Pemungutan suara saat ini sedang ditutup sementara oleh panitia KPUM.
              </span>
            </div>
          )}

          {/* Auth prompt if not logged in */}
          {!user && activeTab === 'vote' && isVotingOpen && (
            <div className="max-w-xl mx-auto flex items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-950/70 backdrop-blur-md border border-amber-500/30 text-amber-200 text-xs shadow-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Masuk dengan email resmi kampus (<strong>{campusDomain}</strong>) untuk menggunakan hak pilih.
                </span>
              </div>
              <button
                onClick={handleGoogleLogin}
                className="font-bold underline text-amber-300 hover:text-white cursor-pointer shrink-0"
              >
                Masuk Google
              </button>
            </div>
          )}

          {/* View Switcher Content */}
          {activeTab === 'vote' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  hasVoted={hasVoted || !isVotingOpen}
                  isChosen={chosenPaslonId === candidate.id}
                  onVote={handleSelectCandidate}
                />
              ))}
            </div>
          ) : (
            <ResultsView candidates={candidates} votes={votes} />
          )}

        </main>

        {/* Clean Footer with Admin link */}
        <footer className="border-t border-white/10 bg-slate-950/85 backdrop-blur-md py-6 text-center text-xs text-slate-400">
          <p>
            © 2026 KPUM • Tiga Serangkai University (TSU) •{' '}
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="hover:text-white underline cursor-pointer"
            >
              Panel Admin
            </button>
          </p>
        </footer>
      </div>
    </div>
  )
}
