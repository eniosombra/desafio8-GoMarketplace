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
      const productsStorage = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (productsStorage) {
        setProducts(JSON.parse(productsStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productMarketed = products.find(
        productFind => productFind.id === product.id,
      );

      if (productMarketed) {
        const productItem = products.map(productMap => {
          if (productMap.id === productMarketed.id) {
            return { ...productMap, quantity: productMap.quantity + 1 };
          }
          return productMap;
        });

        setProducts(productItem);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productItem = products.map(productMap => {
        if (productMap.id === id) {
          return { ...productMap, quantity: productMap.quantity + 1 };
        }
        return productMap;
      });

      setProducts(productItem);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productItem = products
        .map(productMap => {
          if (productMap.id === id) {
            return { ...productMap, quantity: productMap.quantity - 1 };
          }
          return productMap;
        })
        .filter(productFilter => productFilter.quantity >= 1);

      setProducts(productItem);
    },
    [products],
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
