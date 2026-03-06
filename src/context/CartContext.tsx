import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem } from '../types/database';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cakeId: string, weight: string) => void;
  updateQuantity: (cakeId: string, weight: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cake-shop-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading cart:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (e) {
        console.error('Error saving cart:', e);
      }
    }
  }, [cart, isLoaded]);

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        i => i.cake_id === item.cake_id && i.weight === item.weight
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
          price: updated[existingIndex].base_price * (updated[existingIndex].quantity + item.quantity)
        };
        return updated;
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((cakeId: string, weight: string) => {
    setCart(prev => prev.filter(i => !(i.cake_id === cakeId && i.weight === weight)));
  }, []);

  const updateQuantity = useCallback((cakeId: string, weight: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => !(i.cake_id === cakeId && i.weight === weight)));
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.cake_id === cakeId && item.weight === weight) {
        return { ...item, quantity, price: item.base_price * quantity };
      }
      return item;
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing cart:', e);
    }
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isLoaded
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
