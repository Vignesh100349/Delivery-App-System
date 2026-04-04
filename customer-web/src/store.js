import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates) => set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
      })),

      // Cart
      cart: [],
      addToCart: (product) => set((state) => {
        const exists = state.cart.find((item) => item.id === product.id);
        if (exists) {
          return {
            cart: state.cart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }),
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== productId),
      })),
      decrementQuantity: (productId) => set((state) => {
        const item = state.cart.find((i) => i.id === productId);
        if (item?.quantity === 1) {
          return { cart: state.cart.filter((i) => i.id !== productId) };
        }
        return {
          cart: state.cart.map((i) =>
            i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
          ),
        };
      }),
      clearCart: () => set({ cart: [] }),
      cartTotal: () => get().cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0),

      // Address
      deliveryAddressDetails: {
          latitude: null,
          longitude: null,
          doorNo: '',
          street: '',
          area: '',
          pincode: '',
          taluk: '',
          district: ''
      },
      updateDeliveryAddress: (details) => set((state) => ({
          deliveryAddressDetails: { ...state.deliveryAddressDetails, ...details }
      }))
    }),
    {
      name: 'loopie-web-storage',
    }
  )
);
