import { createContext, useContext, useReducer, useEffect } from "react";
import { ProductWithCategory } from "@shared/schema";

export interface CartItem {
  product: ProductWithCategory;
  quantity: number;
}

interface EstablishmentCart {
  items: CartItem[];
  total: number;
}

interface CartState {
  carts: Record<number, EstablishmentCart>; // estabelecimentoId -> carrinho
  currentEstablishmentId: number | null;
  isOpen: boolean;
}

type CartAction = 
  | { type: "ADD_ITEM"; product: ProductWithCategory; establishmentId: number }
  | { type: "REMOVE_ITEM"; productId: number; establishmentId: number }
  | { type: "UPDATE_QUANTITY"; productId: number; quantity: number; establishmentId: number }
  | { type: "CLEAR_CART"; establishmentId?: number }
  | { type: "SET_CURRENT_ESTABLISHMENT"; establishmentId: number }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

const initialState: CartState = {
  carts: {},
  currentEstablishmentId: null,
  isOpen: false,
};

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_CURRENT_ESTABLISHMENT": {
      return {
        ...state,
        currentEstablishmentId: action.establishmentId,
      };
    }

    case "ADD_ITEM": {
      const { product, establishmentId } = action;
      const currentCart = state.carts[establishmentId] || { items: [], total: 0 };
      const existingItem = currentCart.items.find(item => item.product.id === product.id);
      
      let newItems: CartItem[];
      if (existingItem) {
        newItems = currentCart.items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...currentCart.items, { product, quantity: 1 }];
      }
      
      const total = calculateTotal(newItems);
      
      return {
        ...state,
        carts: {
          ...state.carts,
          [establishmentId]: {
            items: newItems,
            total,
          }
        },
      };
    }
    
    case "REMOVE_ITEM": {
      const { productId, establishmentId } = action;
      const currentCart = state.carts[establishmentId];
      if (!currentCart) return state;
      
      const newItems = currentCart.items.filter(item => item.product.id !== productId);
      const total = calculateTotal(newItems);
      
      return {
        ...state,
        carts: {
          ...state.carts,
          [establishmentId]: {
            items: newItems,
            total,
          }
        },
      };
    }
    
    case "UPDATE_QUANTITY": {
      const { productId, quantity, establishmentId } = action;
      if (quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", productId, establishmentId });
      }
      
      const currentCart = state.carts[establishmentId];
      if (!currentCart) return state;
      
      const newItems = currentCart.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      
      const total = calculateTotal(newItems);
      
      return {
        ...state,
        carts: {
          ...state.carts,
          [establishmentId]: {
            items: newItems,
            total,
          }
        },
      };
    }
    
    case "CLEAR_CART": {
      if (action.establishmentId !== undefined) {
        // Limpar carrinho de estabelecimento específico
        return {
          ...state,
          carts: {
            ...state.carts,
            [action.establishmentId]: {
              items: [],
              total: 0,
            }
          },
        };
      } else {
        // Limpar todos os carrinhos
        return {
          ...state,
          carts: {},
        };
      }
    }
    
    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    
    case "OPEN_CART":
      return {
        ...state,
        isOpen: true,
      };
    
    case "CLOSE_CART":
      return {
        ...state,
        isOpen: false,
      };
    
    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  getCurrentCart: () => EstablishmentCart;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Função helper para obter o carrinho atual
  const getCurrentCart = (): EstablishmentCart => {
    if (!state.currentEstablishmentId) {
      return { items: [], total: 0 };
    }
    return state.carts[state.currentEstablishmentId] || { items: [], total: 0 };
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("establishment-carts");
    if (saved) {
      try {
        const savedCarts = JSON.parse(saved);
        // Recriar os carrinhos salvos
        Object.entries(savedCarts).forEach(([establishmentId, cart]: [string, any]) => {
          if (cart.items && Array.isArray(cart.items)) {
            cart.items.forEach((item: CartItem) => {
              dispatch({ 
                type: "ADD_ITEM", 
                product: item.product, 
                establishmentId: parseInt(establishmentId) 
              });
              if (item.quantity > 1) {
                dispatch({ 
                  type: "UPDATE_QUANTITY", 
                  productId: item.product.id, 
                  quantity: item.quantity,
                  establishmentId: parseInt(establishmentId)
                });
              }
            });
          }
        });
      } catch (error) {
        console.error("Erro ao carregar carrinhos do localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("establishment-carts", JSON.stringify(state.carts));
  }, [state.carts]);

  return (
    <CartContext.Provider value={{ state, dispatch, getCurrentCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}