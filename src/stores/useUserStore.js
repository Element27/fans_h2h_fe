import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      club: null,
      clubId: null,
      isGuest: false,
      setUser: (user) => set({ user, isGuest: false }),
      setClub: (club) => set({ club }),
      setClubId: (clubId) => set({ clubId }),
      setGuestUser: (name, club, clubId) => {
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        set({
          user: {
            id: guestId,
            name: name || `Guest_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            email: null,
            isGuest: true
          },
          club,
          clubId,
          isGuest: true
        })
      },
      logout: () => set({ user: null, club: null, clubId: null, isGuest: false }),
    }),
    {
      name: 'fan_h2h-user-storage',
    }
  )
)

export default useUserStore
