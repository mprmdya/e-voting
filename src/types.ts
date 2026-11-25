export type TabType = 'vote' | 'results'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

export interface VoterRecord {
  id: string
  name: string
  email: string
  votedAt: Date | null
}
