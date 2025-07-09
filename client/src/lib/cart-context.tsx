import { createContext, useContext, useReducer, useEffect } from "react";
import { ProductWithCategory } from "@shared/schema";

interface CartItem {
  product: ProductWithCategory;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
}

type CartAction = 
  | { type: "ADD_ITEM"; product: ProductWithCategory }
  | { type: "REMOVE_ITEM"; productId: number }
  | { type: "UPDATE_QUANTITY"; productId: number; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

const initialState: CartState = {
  items: [],
  isOpen: false,
  total: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(item => item.product.id === action.product.id);
      
      let newItems;
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product.id === action.product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { product: action.product, quantity: 1 }];
      }
      
      const total = newItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
      
      return {
        ...state,
        items: newItems,
        total,
      };
    }
    
    case "REMOVE_ITEM": {
      const newItems = state.items.filter(item => item.product.id !== action.productId);
      const total = newItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
      
      return {
        ...state,
        items: newItems,
        total,
      };
    }
    
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", productId: action.productId });
      }
      
      const newItems = state.items.map(item =>
        item.product.id === action.productId
          ? { ...item, quantity: action.quantity }
          : item
      );
      
      const total = newItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
      
      return {
        ...state,
        items: newItems,
        total,
      };
    }
    
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        total: 0,
      };
    
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
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        const savedState = JSON.parse(saved);
        if (savedState.items) {
          savedState.items.forEach((item: CartItem) => {
            dispatch({ type: "ADD_ITEM", product: item.product });
            if (item.quantity > 1) {
              dispatch({ type: "UPDATE_QUANTITY", productId: item.product.id, quantity: item.quantity });
            }
          });
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state));
  }, [state]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
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
