import { create } from 'zustand'

interface Lineups {
  [partidoId: string]: {
    local:     string[]  // array de jugador_id en orden al bate
    visitante: string[]
  }
}

interface LineupState {
  lineups: Lineups
  setLineup: (partidoId: string, lineup: { local: string[]; visitante: string[] }) => void
  getLineup: (partidoId: string) => { local: string[]; visitante: string[] } | null
  advanceBatter: (partidoId: string, side: 'local' | 'visitante', currentIndex: number) => number
}

export const useLineupStore = create<LineupState>((set, get) => ({
  lineups: {},

  setLineup: (partidoId, lineup) =>
    set((state) => ({
      lineups: { ...state.lineups, [partidoId]: lineup },
    })),

  getLineup: (partidoId) => get().lineups[partidoId] ?? null,

  advanceBatter: (partidoId, side, currentIndex) => {
    const lineup = get().lineups[partidoId]
    if (!lineup) return 0
    const arr = lineup[side]
    if (!arr || arr.length === 0) return 0
    return (currentIndex + 1) % arr.length
  },
}))
