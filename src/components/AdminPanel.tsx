import React, { useState } from 'react'
import {
  X,
  Shield,
  Save,
  RotateCcw,
  Power,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  User,
  Upload,
  GraduationCap,
} from 'lucide-react'
import type { Candidate } from '../data/paslonData'
import { compressImageFile } from '../utils/imageCompress'

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
  candidates: Candidate[]
  onSaveCandidates: (updated: Candidate[]) => Promise<void>
  isVotingOpen: boolean
  onToggleVotingOpen: (isOpen: boolean) => Promise<void>
  onResetVotes: () => Promise<void>
  isAdminLoggedIn: boolean
  onLoginAdmin: (password: string) => boolean | Promise<boolean>
  onLogoutAdmin: () => void
  campusDomain: string
  onSaveCampusDomain: (domain: string) => Promise<void>
  campusBg: string
  onSaveCampusBg: (bgUrl: string) => Promise<void>
  onSaveAdminPin?: (newPin: string) => Promise<void>
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  candidates,
  onSaveCandidates,
  isVotingOpen,
  onToggleVotingOpen,
  onResetVotes,
  isAdminLoggedIn,
  onLoginAdmin,
  onLogoutAdmin,
  campusDomain,
  onSaveCampusDomain,
  campusBg,
  onSaveCampusBg,
  onSaveAdminPin,
}) => {
  const [adminPassword, setAdminPassword] = useState('')
  const [loginError, setLoginError] = useState(false)
  const [activeTab, setActiveTab] = useState<'candidates' | 'settings' | 'reset'>('candidates')
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<number>(0)
  const [formData, setFormData] = useState<Candidate[]>(() => JSON.parse(JSON.stringify(candidates)))
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [resetConfirmation, setResetConfirmation] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isUploading, setIsUploading] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [domainInput, setDomainInput] = useState<string>(campusDomain || '@tsu.ac.id')
  const [isSavingDomain, setIsSavingDomain] = useState<boolean>(false)
  const [domainSaveSuccess, setDomainSaveSuccess] = useState<boolean>(false)
  const [isUploadingBg, setIsUploadingBg] = useState<boolean>(false)
  const [bgSaveSuccess, setBgSaveSuccess] = useState<boolean>(false)
  const [newPinInput, setNewPinInput] = useState<string>('')
  const [isSavingPin, setIsSavingPin] = useState<boolean>(false)
  const [pinSaveSuccess, setPinSaveSuccess] = useState<boolean>(false)

  if (!isOpen) return null

  // If not logged in as admin yet, show password prompt
  if (!isAdminLoggedIn) {
    const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      const success = await onLoginAdmin(adminPassword)
      if (success) {
        setLoginError(false)
        setAdminPassword('')
      } else {
        setLoginError(true)
      }
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Masuk Panel Admin</h4>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                PIN / Password Admin:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value)
                    setLoginError(false)
                  }}
                  placeholder="Masukkan password admin..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
              </p>
              {loginError && (
                <p className="text-xs text-rose-600 font-medium mt-1">
                  Password salah. Silakan coba lagi.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer"
              >
                Masuk
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Admin is logged in: Show the full Management Dashboard
  const currentCandidate = formData[selectedCandidateIndex]

  const handleFieldChange = (field: keyof Candidate, value: any) => {
    const updated = [...formData]
    updated[selectedCandidateIndex] = {
      ...updated[selectedCandidateIndex],
      [field]: value,
    }
    setFormData(updated)
  }

  const handleHighlightChange = (index: number, val: string) => {
    const updated = [...formData]
    const cur = updated[selectedCandidateIndex]
    const newHighlights = [...cur.highlights]
    newHighlights[index] = val
    updated[selectedCandidateIndex] = {
      ...cur,
      highlights: newHighlights,
    }
    setFormData(updated)
  }

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'presPhoto' | 'vicePhoto'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(field)
    setUploadError(null)

    try {
      const compressedDataUrl = await compressImageFile(file, 360, 360, 0.85)
      handleFieldChange(field, compressedDataUrl)
    } catch (err: any) {
      console.error('Image upload/compression error:', err)
      setUploadError(err.message || 'Gagal memproses gambar.')
    } finally {
      setIsUploading(null)
      // Reset input value so the same file can be re-selected if needed
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      await onSaveCandidates(formData)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Save candidates error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSubmit = async () => {
    if (resetConfirmation !== 'RESET') return
    setIsResetting(true)
    try {
      await onResetVotes()
      setResetConfirmation('')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Modal Top Navbar */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-none">Panel Pengaturan Pemilu</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Edit data paslon & kontrol status voting secara real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogoutAdmin}
              className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              Keluar Admin
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`py-3 px-3 text-xs font-bold border-b-2 cursor-pointer transition-all ${activeTab === 'candidates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Edit Pasangan Calon
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 text-xs font-bold border-b-2 cursor-pointer transition-all ${activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Kontrol Status Voting
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`py-3 px-3 text-xs font-bold border-b-2 cursor-pointer transition-all ${activeTab === 'reset'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-rose-600'
              }`}
          >
            Reset Suara
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: EDIT CANDIDATES */}
          {activeTab === 'candidates' && (
            <div className="space-y-6">
              {/* Select Candidate to Edit */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 mr-1">Pilih Paslon:</span>
                {formData.map((c, idx) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCandidateIndex(idx)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedCandidateIndex === idx
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    Paslon {c.number} ({c.title})
                  </button>
                ))}
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Edit Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Paslon Ringkas:
                  </label>
                  <input
                    type="text"
                    value={currentCandidate.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Contoh: Candra & Putri"
                  />
                </div>

                {/* Slogan */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Slogan / Tagline:
                  </label>
                  <input
                    type="text"
                    value={currentCandidate.tagline}
                    onChange={(e) => handleFieldChange('tagline', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Slogan paslon..."
                  />
                </div>

                {/* Capres */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Calon Presiden Mahasiswa</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Lengkap:</label>
                    <input
                      type="text"
                      value={currentCandidate.presName}
                      onChange={(e) => handleFieldChange('presName', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fakultas / Angkatan:</label>
                    <input
                      type="text"
                      value={currentCandidate.presFaculty}
                      onChange={(e) => handleFieldChange('presFaculty', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Foto Capres:</label>
                    <div className="flex items-center gap-3">
                      <img
                        src={currentCandidate.presPhoto}
                        alt="Preview Capres"
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-200 bg-slate-100 shrink-0"
                      />
                      <div className="flex-1 space-y-1">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                          {isUploading === 'presPhoto' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{isUploading === 'presPhoto' ? 'Memproses...' : 'Upload Foto'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading !== null}
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'presPhoto')}
                          />
                        </label>
                        <p className="text-[10px] text-slate-400">Pilih JPG / PNG dari komputer atau HP</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cawapres */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Calon Wakil Presiden Mahasiswa</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Lengkap:</label>
                    <input
                      type="text"
                      value={currentCandidate.viceName}
                      onChange={(e) => handleFieldChange('viceName', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fakultas / Angkatan:</label>
                    <input
                      type="text"
                      value={currentCandidate.viceFaculty}
                      onChange={(e) => handleFieldChange('viceFaculty', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Foto Cawapres:</label>
                    <div className="flex items-center gap-3">
                      <img
                        src={currentCandidate.vicePhoto}
                        alt="Preview Cawapres"
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-200 bg-slate-100 shrink-0"
                      />
                      <div className="flex-1 space-y-1">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                          {isUploading === 'vicePhoto' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{isUploading === 'vicePhoto' ? 'Memproses...' : 'Upload Foto'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading !== null}
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'vicePhoto')}
                          />
                        </label>
                        <p className="text-[10px] text-slate-400">Pilih JPG / PNG dari komputer atau HP</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Program Highlights */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    3 Poin Program Utama:
                  </label>
                  {currentCandidate.highlights.map((h, hIdx) => (
                    <input
                      key={hIdx}
                      type="text"
                      value={h}
                      onChange={(e) => handleHighlightChange(hIdx, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-1.5"
                      placeholder={`Program kerja ke-${hIdx + 1}`}
                    />
                  ))}
                </div>

              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  {saveSuccess && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      Perubahan berhasil disimpan ke database!
                    </span>
                  )}
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan ke Cloud...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VOTING STATUS CONTROL & CAMPUS DOMAIN */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-lg mx-auto py-2">
              {/* Campus Domain Setting */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Filter Domain Email Kampus</h4>
                    <p className="text-[11px] text-slate-500">
                      Hanya email yang berakhiran domain ini yang bisa login & memilih.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={domainInput}
                      onChange={(e) => {
                        setDomainInput(e.target.value)
                        setDomainSaveSuccess(false)
                      }}
                      placeholder="@tsu.ac.id"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={async () => {
                        setIsSavingDomain(true)
                        try {
                          await onSaveCampusDomain(domainInput.trim())
                          setDomainSaveSuccess(true)
                          setTimeout(() => setDomainSaveSuccess(false), 3000)
                        } finally {
                          setIsSavingDomain(false)
                        }
                      }}
                      disabled={isSavingDomain || !domainInput.trim()}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSavingDomain ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Simpan</span>
                    </button>
                  </div>

                  {domainSaveSuccess && (
                    <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Domain berhasil diperbarui!
                    </p>
                  )}

                  <p className="text-[10px] text-slate-400">
                    Contoh: <code>@tsu.ac.id</code> atau <code>@mahasiswa.tsu.ac.id</code>
                  </p>
                </div>
              </div>

              {/* Campus Background Image Setting */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Background Gedung Kampus TSU</h4>
                    <p className="text-[11px] text-slate-500">
                      Ganti gambar background website dengan foto kampus TSU.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="relative rounded-xl overflow-hidden h-28 border border-slate-200 bg-slate-100">
                    <img
                      src={campusBg}
                      alt="Preview Background Kampus"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 text-xs font-bold cursor-pointer transition-all shadow-md">
                        {isUploadingBg ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingBg ? 'Mengompres...' : 'Ganti Foto Background Kampus'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingBg}
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            setIsUploadingBg(true)
                            setBgSaveSuccess(false)
                            try {
                              const compressed = await compressImageFile(file, 1280, 720, 0.75)
                              await onSaveCampusBg(compressed)
                              setBgSaveSuccess(true)
                              setTimeout(() => setBgSaveSuccess(false), 3000)
                            } catch (err: any) {
                              console.error('Bg upload error:', err)
                            } finally {
                              setIsUploadingBg(false)
                              e.target.value = ''
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {bgSaveSuccess && (
                    <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Background kampus berhasil diperbarui!
                    </p>
                  )}
                </div>
              </div>

              {/* Security: Change Admin PIN */}
              {onSaveAdminPin && (
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Keamanan: Ubah PIN Admin</h4>
                      <p className="text-[11px] text-slate-500">
                        PIN disimpan secara aman menggunakan enkripsi hash SHA-256 (tidak terekspos di kode sumber).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={newPinInput}
                        onChange={(e) => {
                          setNewPinInput(e.target.value)
                          setPinSaveSuccess(false)
                        }}
                        placeholder="Masukkan PIN baru (min. 6 karakter)"
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={async () => {
                          if (newPinInput.length < 6) return
                          setIsSavingPin(true)
                          try {
                            await onSaveAdminPin(newPinInput.trim())
                            setPinSaveSuccess(true)
                            setNewPinInput('')
                            setTimeout(() => setPinSaveSuccess(false), 3000)
                          } finally {
                            setIsSavingPin(false)
                          }
                        }}
                        disabled={isSavingPin || newPinInput.trim().length < 6}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSavingPin ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Simpan PIN</span>
                      </button>
                    </div>

                    {pinSaveSuccess && (
                      <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PIN Admin baru berhasil dienkripsi dan disimpan!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Voting Open/Close Toggle */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Status Pemungutan Suara</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isVotingOpen
                        ? 'Voting sedang dibuka. Mahasiswa dapat memberikan suara.'
                        : 'Voting ditutup sementara. Mahasiswa hanya bisa melihat hasil.'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isVotingOpen
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isVotingOpen ? 'BUKA' : 'DITUTUP'}
                  </span>
                </div>

                <button
                  onClick={() => onToggleVotingOpen(!isVotingOpen)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
                    isVotingOpen
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{isVotingOpen ? 'Tutup Pemilihan Sekarang' : 'Buka Pemilihan Sekarang'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: RESET VOTES */}
          {activeTab === 'reset' && (
            <div className="space-y-4 max-w-lg mx-auto py-2">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <h4 className="font-bold text-sm">Zona Berbahaya: Reset Suara</h4>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Tindakan ini akan <strong>menghapus seluruh suara yang sudah masuk di database Firestore</strong> dan mengembalikan hitungan suara ke 0. Gunakan fitur ini jika Anda baru selesai uji coba dan ingin memulai pemilu resmi.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Ketik kata <strong className="text-rose-600">RESET</strong> untuk mengonfirmasi:
                </label>
                <input
                  type="text"
                  value={resetConfirmation}
                  onChange={(e) => setResetConfirmation(e.target.value)}
                  placeholder="Ketik RESET di sini..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />

                <button
                  onClick={handleResetSubmit}
                  disabled={resetConfirmation !== 'RESET' || isResetting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menghapus Data Suara...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>Hapus Semua Suara (Reset ke 0)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
