import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthStore {
    driverId: string | null;
    driverName: string | null;
    login: (id: string, name: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            driverId: null,
            driverName: null,
            login: (id, name) => set({ driverId: id, driverName: name }),
            logout: () => set({ driverId: null, driverName: null })
        }),
        {
            name: 'rider-auth-storage',
            storage: createJSONStorage(() => AsyncStorage)
        }
    )
);
