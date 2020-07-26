import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartProducts = await AsyncStorage.getItem('@GoMarket:products');

      if (cartProducts) {
        setProducts(JSON.parse(cartProducts));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const productsUpdated = products.map(cartProduct => {
        if (cartProduct.id === id) {
          return {
            ...cartProduct,
            quantity: cartProduct.quantity + 1,
          };
        }
        return cartProduct;
      });

      setProducts(productsUpdated);

      AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(productsUpdated),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsUpdated = products.map(cartProduct => {
        if (cartProduct.id === id) {
          return {
            ...cartProduct,
            quantity: cartProduct.quantity - 1,
          };
        }
        return cartProduct;
      });

      setProducts(productsUpdated);

      AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(productsUpdated),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      if (products.length > 0) {
        const existentCartProduct = products.find(
          prod => prod.id === product.id,
        );
        if (existentCartProduct) {
          increment(product.id);
        } else {
          setProducts([...products, { ...product, quantity: 1 }]);
          AsyncStorage.setItem('@GoMarket:products', JSON.stringify(products));
        }
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
        AsyncStorage.setItem('@GoMarket:products', JSON.stringify(products));
      }
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
