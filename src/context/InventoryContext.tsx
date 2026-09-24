import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Category,
  Product,
  Movement,
  AppNotification,
  getStockStatus,
} from '../types';

const STORAGE_KEY = '@paperstock_inventory_v1';

const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Cuadernos', icon: 'book-outline', color: '#C8E6C9' },
  { id: 'cat-2', name: 'Escritura', icon: 'pencil-outline', color: '#A7D8FF' },
  { id: 'cat-3', name: 'Colores', icon: 'color-palette-outline', color: '#FFD6E7' },
  { id: 'cat-4', name: 'Material escolar', icon: 'school-outline', color: '#FFEBA3' },
  { id: 'cat-5', name: 'Geometría', icon: 'triangle-outline', color: '#D9CFF5' },
  { id: 'cat-6', name: 'Papel', icon: 'document-outline', color: '#FFD6E7' },
  { id: 'cat-7', name: 'Oficina', icon: 'briefcase-outline', color: '#A7D8FF' },
  { id: 'cat-8', name: 'Impresión', icon: 'print-outline', color: '#C8E6C9' },
];

const initialProducts: Product[] = [
  { id: 'p-1', name: 'Cuaderno profesional', categoryId: 'cat-1', description: 'Cuaderno de 100 hojas, raya', price: 45, quantity: 50, minStock: 10, supplier: 'Papelería Luna' },
  { id: 'p-2', name: 'Pluma de gel', categoryId: 'cat-2', description: 'Pluma de gel punto fino, negra', price: 12, quantity: 25, minStock: 10, supplier: 'Distribuidora escolar' },
  { id: 'p-3', name: 'Resaltador amarillo', categoryId: 'cat-2', description: 'Resaltador punta biselada', price: 15, quantity: 4, minStock: 8, supplier: 'Distribuidora escolar' },
  { id: 'p-4', name: 'Cartulina blanca', categoryId: 'cat-6', description: 'Cartulina tamaño carta', price: 32, quantity: 0, minStock: 5, supplier: 'Papelería del Centro' },
  { id: 'p-5', name: 'Colores de madera', categoryId: 'cat-3', description: 'Caja de 24 colores', price: 28, quantity: 18, minStock: 6, supplier: 'Distribuidora escolar' },
  { id: 'p-6', name: 'Goma', categoryId: 'cat-7', description: 'Goma blanca para borrar', price: 8, quantity: 12, minStock: 5, supplier: 'Papelería Luna' },
  { id: 'p-7', name: 'Lápices de colores', categoryId: 'cat-3', description: 'Paquete de 12 lápices', price: 22, quantity: 6, minStock: 10, supplier: 'Distribuidora escolar' },
  { id: 'p-8', name: 'Plumones', categoryId: 'cat-2', description: 'Set de 6 plumones', price: 30, quantity: 10, minStock: 12, supplier: 'Papelería del Centro' },
];

const initialMovements: Movement[] = [
  { id: 'm-1', type: 'entrada', productId: 'p-1', quantity: 30, date: new Date('2026-09-10').toISOString(), supplier: 'Papelería Luna', note: 'Compra #0001' },
  { id: 'm-2', type: 'salida', productId: 'p-2', quantity: 5, date: new Date('2026-09-09').toISOString(), client: 'Cliente mostrador', reason: 'venta' },
  { id: 'm-3', type: 'entrada', productId: 'p-5', quantity: 20, date: new Date('2026-09-07').toISOString(), supplier: 'Distribuidora escolar', note: 'Compra #0003' },
];

interface InventoryContextType {
  categories: Category[];
  products: Product[];
  movements: Movement[];
  notifications: AppNotification[];
  isLoading: boolean;
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, p: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (name: string, icon: string, color: string) => void;
  registerEntrada: (productId: string, quantity: number, supplier: string, note?: string) => { ok: boolean; error?: string };
  registerSalida: (productId: string, quantity: number, client: string, reason: 'venta' | 'uso_interno', note?: string) => { ok: boolean; error?: string };
  markNotificationRead: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  getCategory: (id: string) => Category | undefined;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [movements, setMovements] = useState<Movement[]>(initialMovements);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: 'n-1', title: 'Nueva entrada', message: 'Se registró una nueva entrada de productos.', date: new Date('2026-09-21').toISOString(), type: 'entrada', read: false },
    { id: 'n-2', title: 'Salida registrada', message: 'Se registró una salida de productos.', date: new Date('2026-09-21').toISOString(), type: 'salida', read: false },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar de AsyncStorage al iniciar
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.categories) setCategories(saved.categories);
          if (saved.products) setProducts(saved.products);
          if (saved.movements) setMovements(saved.movements);
          if (saved.notifications) setNotifications(saved.notifications);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Guardar cada vez que cambie algo (después de la carga inicial)
  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ categories, products, movements, notifications })
    ).catch(() => {});
  }, [categories, products, movements, notifications, isLoading]);

  const addProduct = useCallback((p: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...p, id: `p-${Date.now()}` };
    setProducts((prev) => [newProduct, ...prev]);
  }, []);

  const updateProduct = useCallback((id: string, p: Omit<Product, 'id'>) => {
    setProducts((prev) => prev.map((item) => (item.id === id ? { ...p, id } : item)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addCategory = useCallback((name: string, icon: string, color: string) => {
    setCategories((prev) => [...prev, { id: `cat-${Date.now()}`, name, icon, color }]);
  }, []);

  const pushNotification = useCallback((n: Omit<AppNotification, 'id'>) => {
    setNotifications((prev) => [{ ...n, id: `n-${Date.now()}` }, ...prev]);
  }, []);

  const registerEntrada = useCallback(
    (productId: string, quantity: number, supplier: string, note?: string) => {
      if (quantity <= 0) return { ok: false, error: 'La cantidad debe ser mayor a 0.' };
      const product = products.find((p) => p.id === productId);
      if (!product) return { ok: false, error: 'Selecciona un producto.' };

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, quantity: p.quantity + quantity } : p))
      );
      setMovements((prev) => [
        { id: `m-${Date.now()}`, type: 'entrada', productId, quantity, date: new Date().toISOString(), supplier, note },
        ...prev,
      ]);
      pushNotification({
        title: 'Nueva entrada',
        message: `Se registraron ${quantity} pzas. de "${product.name}".`,
        date: new Date().toISOString(),
        type: 'entrada',
        read: false,
      });
      return { ok: true };
    },
    [products, pushNotification]
  );

  const registerSalida = useCallback(
    (productId: string, quantity: number, client: string, reason: 'venta' | 'uso_interno', note?: string) => {
      if (quantity <= 0) return { ok: false, error: 'La cantidad debe ser mayor a 0.' };
      const product = products.find((p) => p.id === productId);
      if (!product) return { ok: false, error: 'Selecciona un producto.' };
      if (quantity > product.quantity) {
        return { ok: false, error: `Solo hay ${product.quantity} pzas. disponibles en stock.` };
      }

      const newQuantity = product.quantity - quantity;
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, quantity: newQuantity } : p))
      );
      setMovements((prev) => [
        { id: `m-${Date.now()}`, type: 'salida', productId, quantity, date: new Date().toISOString(), client, reason, note },
        ...prev,
      ]);
      pushNotification({
        title: 'Salida registrada',
        message: `Se registró una salida de ${quantity} pzas. de "${product.name}".`,
        date: new Date().toISOString(),
        type: 'salida',
        read: false,
      });

      if (newQuantity === 0) {
        pushNotification({
          title: 'Sin stock',
          message: `El producto "${product.name}" se ha agotado.`,
          date: new Date().toISOString(),
          type: 'sin_stock',
          read: false,
        });
      } else if (newQuantity <= product.minStock) {
        pushNotification({
          title: 'Stock bajo',
          message: `El producto "${product.name}" tiene solo ${newQuantity} pzas.`,
          date: new Date().toISOString(),
          type: 'stock_bajo',
          read: false,
        });
      }
      return { ok: true };
    },
    [products, pushNotification]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const getProduct = useCallback((id: string) => products.find((p) => p.id === id), [products]);
  const getCategory = useCallback((id: string) => categories.find((c) => c.id === id), [categories]);

  return (
    <InventoryContext.Provider
      value={{
        categories,
        products,
        movements,
        notifications,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        registerEntrada,
        registerSalida,
        markNotificationRead,
        getProduct,
        getCategory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory debe usarse dentro de InventoryProvider');
  return ctx;
}

export { getStockStatus };
