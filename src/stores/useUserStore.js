import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      club: null,
      setUser: (user) => set({ user }),
      setClub: (club) => set({ club }),
      logout: () => set({ user: null, club: null }),
    }),
    {
      name: 'fan_h2h-user-storage',
    }
  )
)

export default useUserStore
