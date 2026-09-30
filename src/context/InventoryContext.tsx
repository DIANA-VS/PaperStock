import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import {
  Category,
  Product,
  Movement,
  AppNotification,
  getStockStatus,
} from '../types';

const initialCategories: (Category & { id: string })[] = [
  { id: 'cat-1', name: 'Cuadernos', icon: 'book-outline', color: '#C8E6C9' },
  { id: 'cat-2', name: 'Escritura', icon: 'pencil-outline', color: '#A7D8FF' },
  { id: 'cat-3', name: 'Colores', icon: 'color-palette-outline', color: '#FFD6E7' },
  { id: 'cat-4', name: 'Material escolar', icon: 'school-outline', color: '#FFEBA3' },
  { id: 'cat-5', name: 'Geometría', icon: 'triangle-outline', color: '#D9CFF5' },
  { id: 'cat-6', name: 'Papel', icon: 'document-outline', color: '#FFD6E7' },
  { id: 'cat-7', name: 'Oficina', icon: 'briefcase-outline', color: '#A7D8FF' },
  { id: 'cat-8', name: 'Impresión', icon: 'print-outline', color: '#C8E6C9' },
];

const initialProducts: (Product & { id: string })[] = [
  { id: 'p-1', name: 'Cuaderno profesional', categoryId: 'cat-1', description: 'Cuaderno de 100 hojas, raya', price: 45, quantity: 50, minStock: 10, supplier: 'Papelería Luna' },
  { id: 'p-2', name: 'Pluma de gel', categoryId: 'cat-2', description: 'Pluma de gel punto fino, negra', price: 12, quantity: 25, minStock: 10, supplier: 'Distribuidora escolar' },
  { id: 'p-3', name: 'Resaltador amarillo', categoryId: 'cat-2', description: 'Resaltador punta biselada', price: 15, quantity: 4, minStock: 8, supplier: 'Distribuidora escolar' },
  { id: 'p-4', name: 'Cartulina blanca', categoryId: 'cat-6', description: 'Cartulina tamaño carta', price: 32, quantity: 0, minStock: 5, supplier: 'Papelería del Centro' },
  { id: 'p-5', name: 'Colores de madera', categoryId: 'cat-3', description: 'Caja de 24 colores', price: 28, quantity: 18, minStock: 6, supplier: 'Distribuidora escolar' },
  { id: 'p-6', name: 'Goma', categoryId: 'cat-7', description: 'Goma blanca para borrar', price: 8, quantity: 12, minStock: 5, supplier: 'Papelería Luna' },
  { id: 'p-7', name: 'Lápices de colores', categoryId: 'cat-3', description: 'Paquete de 12 lápices', price: 22, quantity: 6, minStock: 10, supplier: 'Distribuidora escolar' },
  { id: 'p-8', name: 'Plumones', categoryId: 'cat-2', description: 'Set de 6 plumones', price: 30, quantity: 10, minStock: 12, supplier: 'Papelería del Centro' },
];

const initialMovements: (Movement & { id: string })[] = [
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
  addProduct: (p: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, p: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (name: string, icon: string, color: string) => Promise<void>;
  registerEntrada: (productId: string, quantity: number, supplier: string, note?: string) => Promise<{ ok: boolean; error?: string }>;
  registerSalida: (productId: string, quantity: number, client: string, reason: 'venta' | 'uso_interno', note?: string) => Promise<{ ok: boolean; error?: string }>;
  markNotificationRead: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  getCategory: (id: string) => Category | undefined;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  // La primera vez que alguien abre la app, si la base de datos está vacía,
  // la llenamos con datos de ejemplo para que no arranque vacía.
  useEffect(() => {
    (async () => {
      try {
        const catSnap = await getDocs(collection(db, 'categories'));
        if (catSnap.empty) {
          const batch = writeBatch(db);
          initialCategories.forEach(({ id, ...rest }) => batch.set(doc(db, 'categories', id), rest));
          initialProducts.forEach(({ id, ...rest }) => batch.set(doc(db, 'products', id), rest));
          initialMovements.forEach(({ id, ...rest }) => batch.set(doc(db, 'movements', id), rest));
          await batch.commit();
        }
      } catch (e) {
        console.log('Error inicializando datos en Firestore:', e);
      } finally {
        setSeeded(true);
      }
    })();
  }, []);

  // Escucha en tiempo real: cualquier cambio en Firestore actualiza la app al instante
  useEffect(() => {
    if (!seeded) return;

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
    });
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
      setIsLoading(false);
    });
    const unsubMovements = onSnapshot(
      query(collection(db, 'movements'), orderBy('date', 'desc')),
      (snap) => setMovements(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Movement)))
    );
    const unsubNotifications = onSnapshot(
      query(collection(db, 'notifications'), orderBy('date', 'desc')),
      (snap) => setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification)))
    );

    return () => {
      unsubCategories();
      unsubProducts();
      unsubMovements();
      unsubNotifications();
    };
  }, [seeded]);

  const addProduct = useCallback(async (p: Omit<Product, 'id'>) => {
    await addDoc(collection(db, 'products'), p);
  }, []);

  const updateProduct = useCallback(async (id: string, p: Omit<Product, 'id'>) => {
    await updateDoc(doc(db, 'products', id), p as any);
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
  }, []);

  const addCategory = useCallback(async (name: string, icon: string, color: string) => {
    await addDoc(collection(db, 'categories'), { name, icon, color });
  }, []);

  const pushNotification = useCallback(async (n: Omit<AppNotification, 'id'>) => {
    await addDoc(collection(db, 'notifications'), n);
  }, []);

  const registerEntrada = useCallback(
    async (productId: string, quantity: number, supplier: string, note?: string) => {
      if (quantity <= 0) return { ok: false, error: 'La cantidad debe ser mayor a 0.' };
      const product = products.find((p) => p.id === productId);
      if (!product) return { ok: false, error: 'Selecciona un producto.' };

      await updateDoc(doc(db, 'products', productId), { quantity: product.quantity + quantity });
      await addDoc(collection(db, 'movements'), {
        type: 'entrada',
        productId,
        quantity,
        date: new Date().toISOString(),
        supplier,
        note: note ?? null,
      });
      await pushNotification({
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
    async (productId: string, quantity: number, client: string, reason: 'venta' | 'uso_interno', note?: string) => {
      if (quantity <= 0) return { ok: false, error: 'La cantidad debe ser mayor a 0.' };
      const product = products.find((p) => p.id === productId);
      if (!product) return { ok: false, error: 'Selecciona un producto.' };
      if (quantity > product.quantity) {
        return { ok: false, error: `Solo hay ${product.quantity} pzas. disponibles en stock.` };
      }

      const newQuantity = product.quantity - quantity;
      await updateDoc(doc(db, 'products', productId), { quantity: newQuantity });
      await addDoc(collection(db, 'movements'), {
        type: 'salida',
        productId,
        quantity,
        date: new Date().toISOString(),
        client,
        reason,
        note: note ?? null,
      });
      await pushNotification({
        title: 'Salida registrada',
        message: `Se registró una salida de ${quantity} pzas. de "${product.name}".`,
        date: new Date().toISOString(),
        type: 'salida',
        read: false,
      });

      if (newQuantity === 0) {
        await pushNotification({
          title: 'Sin stock',
          message: `El producto "${product.name}" se ha agotado.`,
          date: new Date().toISOString(),
          type: 'sin_stock',
          read: false,
        });
      } else if (newQuantity <= product.minStock) {
        await pushNotification({
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

  const markNotificationRead = useCallback(async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
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
