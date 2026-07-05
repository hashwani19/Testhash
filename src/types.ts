export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  notes?: string
  priority: Priority
  done: boolean
  createdAt: number
}

export type Filter = 'all' | 'active' | 'done'
