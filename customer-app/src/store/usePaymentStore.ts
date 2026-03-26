import { create } from 'zustand';
import axios from 'axios';

export interface PaymentMethod {
    id: string;
    type: 'card' | 'upi';
    title: string;
    mask: string;
    color: string;
}

interface PaymentStore {
    savedMethods: PaymentMethod[];
    fetchPayments: (userId: string | number) => Promise<void>;
    addMethod: (userId: string | number, method: Omit<PaymentMethod, 'id'>) => Promise<void>;
    removeMethod: (id: string | number) => Promise<void>;
    clearMethods: () => void;
}

const API_URL = 'http://192.168.1.3:5000';

export const usePaymentStore = create<PaymentStore>((set) => ({
    savedMethods: [],
    
    fetchPayments: async (userId) => {
        try {
            const res = await axios.get(`${API_URL}/users/${userId}/payments`);
            set({ savedMethods: res.data });
        } catch (err) {
            console.error('Failed fetching payments:', err);
        }
    },

    addMethod: async (userId, method) => {
        try {
            const res = await axios.post(`${API_URL}/users/${userId}/payments`, method);
            set((state) => ({ savedMethods: [res.data, ...state.savedMethods] }));
        } catch (err) {
            console.error('Failed adding payment:', err);
        }
    },

    removeMethod: async (id) => {
        try {
            await axios.delete(`${API_URL}/payments/${id}`);
            set((state) => ({ savedMethods: state.savedMethods.filter(m => String(m.id) !== String(id)) }));
        } catch (err) {
            console.error('Failed removing payment:', err);
        }
    },

    clearMethods: () => set({ savedMethods: [] }),
}));
