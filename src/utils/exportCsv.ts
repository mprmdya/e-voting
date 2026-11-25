import type { VoterRecord } from '../types'
import type { Candidate } from '../data/paslonData'

const escapeCsvField = (value: string | number): string => {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const formatDateTime = (date: Date | null): string => {
  if (!date) return '-'
  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  })
}

const triggerCsvDownload = (csvContent: string, filename: string) => {
  // UTF-8 BOM so Microsoft Excel & Google Sheets parse Indonesian characters properly
  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportVotersToCsv = (voters: VoterRecord[], filename?: string) => {
  const headers = ['No', 'Nama', 'Email', 'Waktu Memilih', 'Status']
  const rows = voters.map((voter, idx) => [
    idx + 1,
    voter.name || '-',
    voter.email || '-',
    formatDateTime(voter.votedAt),
    'Sudah Memilih',
  ])

  const csvLines = [headers, ...rows].map((row) => row.map(escapeCsvField).join(','))
  const dateStamp = new Date().toISOString().slice(0, 10)
  triggerCsvDownload(csvLines.join('\r\n'), filename || `daftar-pemilih-pemira-${dateStamp}.csv`)
}

export const exportResultsToCsv = (
  candidates: Candidate[],
  votes: Map<string, number>,
  filename?: string
) => {
  const totalVotes = Array.from(votes.values()).reduce((sum, v) => sum + v, 0)
  const headers = ['No Urut', 'Pasangan Calon', 'Capres', 'Cawapres', 'Jumlah Suara', 'Persentase']
  const rows = candidates.map((cand) => {
    const count = votes.get(cand.id) || 0
    const pct = totalVotes > 0 ? `${((count / totalVotes) * 100).toFixed(2)}%` : '0%'
    return [cand.number, cand.title, cand.presName, cand.viceName, count, pct]
  })
  rows.push(['', 'TOTAL SUARA', '', '', totalVotes, totalVotes > 0 ? '100%' : '0%'])

  const csvLines = [headers, ...rows].map((row) => row.map(escapeCsvField).join(','))
  const dateStamp = new Date().toISOString().slice(0, 10)
  triggerCsvDownload(csvLines.join('\r\n'), filename || `hasil-suara-pemira-${dateStamp}.csv`)
}
