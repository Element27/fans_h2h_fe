import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      club: null,
      clubId: null,
      isGuest: false,
      setUser: (user) => set({ user }),
      setClub: (club) => set({ club }),
      setClubId: (clubId) => set({ clubId }),
      startGuestSession: (user) => set({ user, isGuest: true }),
      setGuestMode: (isGuest) => set({ isGuest }),
      logout: () => set({ user: null, club: null, clubId: null, isGuest: false }),
    }),
    {
      name: 'fan_h2h-user-storage',
    }
  )
)

export default useUserStore
