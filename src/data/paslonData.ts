export interface Candidate {
  id: string
  number: string
  title: string
  presName: string
  viceName: string
  presPhoto: string
  vicePhoto: string
  presFaculty: string
  viceFaculty: string
  tagline: string
  highlights: string[]
  theme: {
    accent: string
    badgeBg: string
    badgeText: string
    button: string
    bar: string
    borderHover: string
  }
}

export const PASLON_LIST: Candidate[] = [
  {
    id: '1',
    number: '01',
    title: 'Candra & Putri',
    presName: 'Candra Wijaya',
    viceName: 'Putri Ayu',
    presFaculty: 'Fasilkom 23',
    viceFaculty: 'FEB 23',
    presPhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    vicePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    tagline: 'Harmoni Inovasi Kampus Digital & Inklusif',
    highlights: [
      'Digitalisasi layanan aspirasi mahasiswa',
      'Dana riset & inkubator teknologi kampus',
      'Advokasi beasiswa terpadu',
    ],
    theme: {
      accent: 'text-blue-600',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200',
      bar: 'bg-blue-600',
      borderHover: 'hover:border-blue-400',
    },
  },
  {
    id: '2',
    number: '02',
    title: 'Budi & Sari',
    presName: 'Budi Prasetyo',
    viceName: 'Sari Indah',
    presFaculty: 'FT 23',
    viceFaculty: 'FH 23',
    presPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    vicePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    tagline: 'Sinergi Nyata Menuju Mahasiswa Berdaya',
    highlights: [
      'Reformasi & transparansi pengawalan UKT',
      'Pemberdayaan UKM & seni budaya kampus',
      'Koneksi magang industri & alumni',
    ],
    theme: {
      accent: 'text-emerald-600',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200',
      bar: 'bg-emerald-600',
      borderHover: 'hover:border-emerald-400',
    },
  },
]
