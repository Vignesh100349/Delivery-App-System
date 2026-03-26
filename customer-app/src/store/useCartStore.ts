import { create } from 'zustand';

export interface Product {
    id: number;
    name: string;
    price: number;
    original_price?: number;
    image: string;
    description: string;
    weight?: string;
    stock?: number;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface AddressDetails {
    doorNo: string;
    street: string;
    area: string;
    taluk: string;
    district: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
}

interface CartStore {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number) => void;
    clearCart: () => void;
    cartTotal: () => number;
    cartCount: () => number;
    deliveryAddressDetails: AddressDetails;
    setDeliveryAddressDetails: (details: AddressDetails) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
    cart: [],
    deliveryAddressDetails: {
        doorNo: '',
        street: '',
        area: '',
        taluk: '',
        district: '',
        pincode: '',
        latitude: undefined,
        longitude: undefined
    },
    setDeliveryAddressDetails: (details: AddressDetails) => set({ deliveryAddressDetails: details }),
    addToCart: (product: Product) => {
        set((state) => {
            const existing = state.cart.find((item) => item.id === product.id);
            if (existing) {
                return {
                    cart: state.cart.map((item) =>
                        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                    ),
                };
            }
            return { cart: [...state.cart, { ...product, quantity: 1 }] };
        });
    },
    removeFromCart: (productId: number) => {
        set((state) => {
            const existing = state.cart.find((item) => item.id === productId);
            if (existing && existing.quantity > 1) {
                return {
                    cart: state.cart.map((item) =>
                        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
                    ),
                };
            }
            return { cart: state.cart.filter((item) => item.id !== productId) };
        });
    },
    clearCart: () => set({ cart: [] }),
    cartTotal: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
    },
    cartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
    },
}));
