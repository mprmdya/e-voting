import { useState, useEffect, useCallback, useRef } from 'react'
import {
  authInstance,
  googleProvider,
  voteCollection,
  votersCollection,
  settingsDocRef,
  firestoreDb,
  doc,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type User,
} from './firebase'
import { PASLON_LIST, type Candidate } from './data/paslonData'
import type { TabType, ToastMessage, VoterRecord } from './types'
import { TSU_LOGO_URL } from './constants'
import { Navbar } from './components/Navbar'
import { CandidateCard } from './components/CandidateCard'
import { ResultsView } from './components/ResultsView'
import { VoteModal } from './components/VoteModal'
import { AdminPanel } from './components/AdminPanel'
import { Toast } from './components/Toast'
import { Vote, BarChart3, AlertCircle, AlertTriangle } from 'lucide-react'

// Detect In-App Browser (WhatsApp, Instagram, FB, Line, TikTok)
const isInAppBrowser = (): boolean => {
  if (typeof navigator === 'undefined') return false
  const ua = (navigator.userAgent || '').toLowerCase()
  return (
    ua.includes('whatsapp') ||
    ua.includes('fban') ||
    ua.includes('fbav') ||
    ua.includes('instagram') ||
    ua.includes('line') ||
    ua.includes('micromessenger')
  )
}

const isEmailAllowed = (email: string, campusDomain: string, admins: string[] = []): boolean => {
  const clean = email.toLowerCase().trim()
  const domainCheck = campusDomain.toLowerCase().trim()
  if (admins.includes(clean)) return true
  return !domainCheck || clean.endsWith(domainCheck)
}

const DEFAULT_CAMPUS_BG =
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80'

export default function App() {
  const [user, setUser] = useState(null as User | null)
  const [candidates, setCandidates] = useState(PASLON_LIST as Candidate[])
  const [isVotingOpen, setIsVotingOpen] = useState(true)
  const [campusDomain, setCampusDomain] = useState('@tsu.ac.id')
  const [campusBg, setCampusBg] = useState(DEFAULT_CAMPUS_BG)
  const [votes, setVotes] = useState(() => new Map())
  const [votersList, setVotersList] = useState([] as VoterRecord[])
  const [hasVoted, setHasVoted] = useState(false)
  const [chosenPaslonId, setChosenPaslonId] = useState(null as string | null)
  const [activeTab, setActiveTab] = useState('vote' as TabType)
  const [selectedCandidate, setSelectedCandidate] = useState(null as Candidate | null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [toasts, setToasts] = useState([] as ToastMessage[])

  // Admin State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminEmails, setAdminEmails] = useState([] as string[])
  const adminEmailsRef = useRef([] as string[])

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

  // Ambil daftar admin terbaru dari Firestore tanpa memicu re-render loop
  const loadAdminEmails = useCallback(async (): Promise<string[]> => {
    try {
      const adminsRef = doc(firestoreDb, 'config', 'admins')
      const snap = await getDoc(adminsRef)
      if (snap.exists()) {
        const data = snap.data()
        const emails: string[] = Array.isArray(data?.emails)
          ? data.emails.map((e: string) => e.toLowerCase().trim())
          : []
        adminEmailsRef.current = emails
        setAdminEmails(emails)
        return emails
      }
    } catch (err) {
      console.error('Could not load admin list:', err)
    }
    return adminEmailsRef.current
  }, [])

  // Load admin emails on mount
  useEffect(() => {
    loadAdminEmails()
  }, [loadAdminEmails])

  // Handle redirect result on mount
  useEffect(() => {
    getRedirectResult(authInstance)
      .then(async (result) => {
        if (!result) return
        const loggedUser = result.user
        const email = (loggedUser.email || '').toLowerCase().trim()
        const latestAdmins = await loadAdminEmails()

        if (!isEmailAllowed(email, campusDomain, latestAdmins)) {
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
        if (isAlreadyVoted && JSON.parse(isAlreadyVoted)) setHasVoted(true)
        const choiceKey = `choice_${loggedUser.uid}`
        const storedChoice = localStorage.getItem(choiceKey)
        if (storedChoice) setChosenPaslonId(storedChoice)
        addToast('success', `Berhasil masuk sebagai ${loggedUser.displayName || 'Mahasiswa'}`)
      })
      .catch((err: unknown) => {
        const error = err as { code?: string; message?: string }
        if (
          error?.code === 'auth/cancelled-popup-request' ||
          error?.code === 'auth/popup-closed-by-user'
        ) {
          return
        }
        if (error?.code === 'auth/unauthorized-domain') {
          addToast(
            'error',
            'Domain Vercel belum diizinkan di Firebase Console (Authentication > Settings > Authorized domains).'
          )
          return
        }
        console.error('getRedirectResult error:', err)
      })
  }, [campusDomain, loadAdminEmails, addToast])

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
      if (currentUser && currentUser.email) {
        const email = currentUser.email.toLowerCase().trim()
        const latestAdmins = await loadAdminEmails()

        if (!isEmailAllowed(email, campusDomain, latestAdmins)) {
          await signOut(authInstance)
          setUser(null)
          addToast(
            'error',
            `Akses Ditolak: Email ${email} bukan email kampus (${campusDomain}).`
          )
          return
        }
      }

      setUser(currentUser)
      if (currentUser) {
        const voterRef = doc(firestoreDb, 'voters', currentUser.uid)
        getDoc(voterRef)
          .then((snap) => {
            if (snap.exists()) {
              setHasVoted(true)
              const data = snap.data()
              if (data?.choice) {
                setChosenPaslonId(data.choice)
              }
            } else {
              setHasVoted(false)
              setChosenPaslonId(null)
            }
          })
          .catch((err) => {
            console.error('Error verifying voter status in database:', err)
          })
      } else {
        setHasVoted(false)
        setChosenPaslonId(null)
      }
    })
    return () => unsubscribe()
  }, [campusDomain, loadAdminEmails, addToast])

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

  // Real-time Firestore Vote & Voters Listener (Admin Only)
  useEffect(() => {
    if (!isAdminLoggedIn) return

    const qVotes = query(voteCollection, orderBy('timestamp', 'desc'))
    const unsubVotes = onSnapshot(
      qVotes,
      (snapshot) => {
        const voteMap = new Map()
        snapshot.forEach((docItem) => {
          const data = docItem.data()
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

    const unsubVoters = onSnapshot(
      votersCollection,
      (snapshot) => {
        const list: VoterRecord[] = []
        snapshot.forEach((docSnap) => {
          const data = docSnap.data()
          const votedAt =
            data.votedAt && typeof data.votedAt.toDate === 'function'
              ? (data.votedAt.toDate() as Date)
              : null
          list.push({
            id: docSnap.id,
            name: typeof data.name === 'string' && data.name ? data.name : '-',
            email: typeof data.email === 'string' && data.email ? data.email : '-',
            votedAt,
          })
        })
        list.sort((a, b) => (b.votedAt?.getTime() ?? 0) - (a.votedAt?.getTime() ?? 0))
        setVotersList(list)
      },
      (error) => {
        console.error('Firestore voters listener error:', error)
      }
    )

    return () => {
      unsubVotes()
      unsubVoters()
    }
  }, [isAdminLoggedIn])

  // Google Login — popup default, fallback to redirect if popup is blocked
  const handleGoogleLogin = async () => {
    if (isInAppBrowser()) {
      addToast(
        'warning',
        'Google memblokir login langsung dari WhatsApp. Silakan buka website ini di browser Safari/Chrome eksternal.'
      )
    }

    setIsLoggingIn(true)
    try {
      const result = await signInWithPopup(authInstance, googleProvider)
      const loggedUser = result.user
      const email = (loggedUser.email || '').toLowerCase().trim()
      const latestAdmins = await loadAdminEmails()

      // Pengecekan Domain Kampus (kecuali akun Admin terdaftar)
      if (!isEmailAllowed(email, campusDomain, latestAdmins)) {
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
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      console.error('Google login error:', err)

      if (err?.code === 'auth/popup-blocked') {
        addToast('info', 'Popup diblokir, mengalihkan ke halaman Google...')
        await signInWithRedirect(authInstance, googleProvider)
        return
      }

      if (err?.code === 'auth/unauthorized-domain') {
        addToast(
          'error',
          'Domain Vercel belum diizinkan di Firebase Console (Authentication > Settings > Authorized domains).'
        )
        return
      }

      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return
      }

      addToast('error', `Gagal login: ${err?.message || 'Silakan coba lagi.'}`)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleSaveCampusDomain = async (newDomain: string) => {
    try {
      const formatted = newDomain.startsWith('@') ? newDomain : `@${newDomain}`
      await setDoc(settingsDocRef, { campusDomain: formatted }, { merge: true })
      setCampusDomain(formatted)
      addToast('success', `Filter domain kampus diatur ke: ${formatted}`)
    } catch (err) {
      console.error('Save campus domain error:', err)
      addToast('error', 'Gagal menyimpan domain kampus. Periksa aturan Firestore.')
    }
  }

  const handleSaveCampusBg = async (newBg: string) => {
    try {
      await setDoc(settingsDocRef, { campusBg: newBg }, { merge: true })
      setCampusBg(newBg)
      addToast('success', 'Foto background kampus TSU berhasil diperbarui!')
    } catch (err) {
      console.error('Save campus bg error:', err)
      addToast('error', 'Gagal menyimpan background kampus. Periksa aturan Firestore.')
    }
  }

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(authInstance)
      setUser(null)
      setIsAdminLoggedIn(false)
      setIsAdminModalOpen(false)
      setActiveTab('vote')
      setVotes(new Map())
      setVotersList([])
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

    if (!user?.uid) {
      addToast('warning', 'Silakan masuk dengan akun resmi terlebih dahulu.')
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
      const voterRef = doc(firestoreDb, 'voters', user.uid)
      const existingRecord = await getDoc(voterRef)
      if (existingRecord.exists()) {
        setHasVoted(true)
        addToast('warning', 'Hak suara Anda sudah pernah digunakan sebelumnya.')
        setIsModalOpen(false)
        return
      }

      await setDoc(voterRef, {
        name: user.displayName || 'Mahasiswa',
        email: user.email || '',
        votedAt: serverTimestamp(),
        choice: selectedCandidate.id,
      })

      await addDoc(voteCollection, {
        paslonId: selectedCandidate.id,
        paslonName: selectedCandidate.title,
        votes: 1,
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
      addToast('success', `Suara Anda berhasil dicatat secara sah & rahasia!`)
    } catch (error) {
      console.error('Vote error:', error)
      addToast('error', 'Gagal mengirim suara. Periksa koneksi dan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAuthorizedAdminUser = Boolean(
    user?.email && adminEmails.includes(user.email.toLowerCase().trim())
  )

  // ADMIN ACTIONS
  const handleAdminLogin = async (): Promise<boolean> => {
    if (!isAuthorizedAdminUser) {
      addToast(
        'error',
        'Akses Admin ditolak. Harap login Google menggunakan akun admin terlebih dahulu.'
      )
      return false
    }
    setIsAdminLoggedIn(true)
    addToast('success', 'Berhasil masuk sebagai Admin!')
    return true
  }

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false)
    setIsAdminModalOpen(false)
    setActiveTab('vote')
    setVotes(new Map())
    setVotersList([])
    addToast('info', 'Keluar dari mode admin.')
  }

  const handleSaveCandidates = async (updated: Candidate[]) => {
    try {
      await setDoc(settingsDocRef, { candidates: updated }, { merge: true })
      setCandidates(updated)
      addToast('success', 'Data paslon berhasil diperbarui ke Cloud Firestore!')
    } catch (err) {
      console.error('Save candidates error:', err)
      addToast('error', 'Gagal menyimpan data paslon. Periksa aturan Firestore.')
    }
  }

  const handleToggleVotingOpen = async (isOpen: boolean) => {
    try {
      await setDoc(settingsDocRef, { isVotingOpen: isOpen }, { merge: true })
      setIsVotingOpen(isOpen)
      addToast(
        isOpen ? 'success' : 'warning',
        isOpen ? 'Pemilihan resmi DIBUKA.' : 'Pemilihan resmi DITUTUP sementara.'
      )
    } catch (err) {
      console.error('Toggle voting error:', err)
      addToast('error', 'Gagal mengubah status pemilihan. Periksa aturan Firestore.')
    }
  }

  const handleResetVotes = async () => {
    try {
      const snapshot = await getDocs(voteCollection)
      const deletePromises = snapshot.docs.map((docItem) => deleteDoc(docItem.ref))

      const votersSnapshot = await getDocs(votersCollection)
      const deleteVotersPromises = votersSnapshot.docs.map((docItem) => deleteDoc(docItem.ref))

      await Promise.all([...deletePromises, ...deleteVotersPromises])

      localStorage.removeItem('voted')
      localStorage.removeItem('user_choice')
      if (user?.uid) {
        localStorage.removeItem(`voted_${user.uid}`)
        localStorage.removeItem(`choice_${user.uid}`)
      }

      setHasVoted(false)
      setChosenPaslonId(null)
      addToast('success', 'Seluruh data suara dan riwayat pemilih berhasil di-reset.')
    } catch (err) {
      console.error('Reset votes error:', err)
      addToast('error', 'Gagal mereset data suara.')
    }
  }

  const totalVotesCount = Array.from(votes.values()).reduce((sum, v) => sum + Number(v), 0)

  return (
    <div className="min-h-dvh relative flex flex-col font-sans selection:bg-blue-600 selection:text-white">
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
      <div className="relative z-10 flex flex-col min-h-dvh">
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
            votersList={votersList}
            isAuthorizedAdminUser={isAuthorizedAdminUser}
            onGoogleLogin={handleGoogleLogin}
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
        <main className="max-w-4xl w-full mx-auto px-3.5 sm:px-6 py-6 sm:py-10 flex-1 space-y-6 sm:space-y-8">
          {/* Simple & Clean Header */}
          <div className="text-center space-y-2.5">
            <div className="inline-flex flex-wrap items-center justify-center gap-2">
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
              Pemilihan Presiden Mahasiswa & Wakil Presiden Mahasiswa
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto drop-shadow-xs">
              Gunakan hak suara Anda secara bijak. Setiap mahasiswa memiliki 1 suara sah yang dihitung secara real-time.
            </p>

            {/* Simple Tab Switcher (Hasil Suara hanya untuk Admin) */}
            {isAdminLoggedIn && (
              <div className="pt-4 flex justify-center">
                <div className="inline-flex p-1 bg-slate-900/60 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
                  <button
                    onClick={() => setActiveTab('vote')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'vote'
                        ? 'bg-white text-slate-900 shadow-md'
                        : 'text-slate-200 hover:text-white'
                      }`}
                  >
                    <Vote className="w-3.5 h-3.5" />
                    <span>Bilik Suara</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('results')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'results'
                        ? 'bg-white text-slate-900 shadow-md'
                        : 'text-slate-200 hover:text-white'
                      }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Hasil Suara ({totalVotesCount})</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp / In-App Browser Notice */}
          {isInAppBrowser() && !user && (
            <div className="max-w-xl mx-auto p-4 rounded-xl bg-amber-950/90 backdrop-blur-md border border-amber-500/50 text-amber-100 text-xs shadow-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Penting: Buka di Browser Safari / Chrome</span>
              </div>
              <p className="text-amber-200/90 leading-relaxed">
                Anda membuka link ini di dalam browser bawaan WhatsApp/Medsos. Demi keamanan, Google <strong>memblokir login (Error 400)</strong> di browser bawaan WhatsApp.
              </p>
              <div className="bg-amber-900/60 p-2.5 rounded-lg border border-amber-500/30 font-medium text-white flex items-center justify-between gap-2">
                <span>Ketuk ikon <strong>titik tiga (⋯)</strong> di pojok layar, lalu pilih <strong>&quot;Buka di Browser&quot;</strong> (Safari/Chrome)</span>
              </div>
            </div>
          )}

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
            <div className="max-w-xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3.5 rounded-xl bg-amber-950/70 backdrop-blur-md border border-amber-500/30 text-amber-200 text-xs shadow-lg">
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
          {activeTab === 'results' && isAdminLoggedIn ? (
            <ResultsView candidates={candidates} votes={votes} />
          ) : (
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
          )}
        </main>

        {/* Official Footer */}
        <footer className="border-t border-white/10 bg-slate-950/85 backdrop-blur-md py-6 text-center text-xs text-slate-400">
          <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-2.5">
            <div className="inline-flex items-center justify-center bg-white/95 px-3 py-1 rounded-xl shadow-xs">
              <img
                src={TSU_LOGO_URL}
                alt="Logo Universitas Tiga Serangkai"
                className="h-6 w-auto object-contain"
              />
            </div>
            <p>© 2026 Komisi Pemilihan Umum Mahasiswa (KPUM) • Tiga Serangkai University (TSU)</p>
          </div>
        </footer>
      </div>
    </div>
  )
}