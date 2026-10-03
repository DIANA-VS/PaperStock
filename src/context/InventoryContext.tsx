import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../constants/supabaseConfig';
import {
  Category,
  Product,
  Movement,
  AppNotification,
  getStockStatus,
} from '../types';

// ---- Helpers para convertir entre snake_case (SQL) y camelCase (TypeScript) ----

function rowToCategory(row: any): Category {
  return { id: row.id, name: row.name, icon: row.icon, color: row.color };
}

function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    description: row.description ?? undefined,
    price: Number(row.price),
    quantity: row.quantity,
    minStock: row.min_stock,
    supplier: row.supplier ?? undefined,
  };
}

function rowToMovement(row: any): Movement {
  return {
    id: row.id,
    type: row.type,
    productId: row.product_id,
    quantity: row.quantity,
    date: row.date,
    note: row.note ?? undefined,
    supplier: row.supplier ?? undefined,
    client: row.client ?? undefined,
    reason: row.reason ?? undefined,
  };
}

function rowToNotification(row: any): AppNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    date: row.date,
    type: row.type,
    read: row.read,
  };
}

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

  const reloadAll = useCallback(async () => {
    const [catRes, prodRes, movRes, notifRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('products').select('*').order('name'),
      supabase.from('movements').select('*').order('date', { ascending: false }),
      supabase.from('notifications').select('*').order('date', { ascending: false }),
    ]);
    if (catRes.data) setCategories(catRes.data.map(rowToCategory));
    if (prodRes.data) setProducts(prodRes.data.map(rowToProduct));
    if (movRes.data) setMovements(movRes.data.map(rowToMovement));
    if (notifRes.data) setNotifications(notifRes.data.map(rowToNotification));
    setIsLoading(false);
  }, []);

  // Carga inicial + suscripción en tiempo real a cambios en las 4 tablas
  useEffect(() => {
    reloadAll();

    const channel = supabase
      .channel('paperstock-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, reloadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, reloadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movements' }, reloadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, reloadAll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reloadAll]);

  const addProduct = useCallback(async (p: Omit<Product, 'id'>) => {
    await supabase.from('products').insert({
      name: p.name,
      category_id: p.categoryId,
      description: p.description ?? null,
      price: p.price,
      quantity: p.quantity,
      min_stock: p.minStock,
      supplier: p.supplier ?? null,
    });
  }, []);

  const updateProduct = useCallback(async (id: string, p: Omit<Product, 'id'>) => {
    await supabase
      .from('products')
      .update({
        name: p.name,
        category_id: p.categoryId,
        description: p.description ?? null,
        price: p.price,
        quantity: p.quantity,
        min_stock: p.minStock,
        supplier: p.supplier ?? null,
      })
      .eq('id', id);
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
  }, []);

  const addCategory = useCallback(async (name: string, icon: string, color: string) => {
    await supabase.from('categories').insert({ name, icon, color });
  }, []);

  const pushNotification = useCallback(async (n: Omit<AppNotification, 'id'>) => {
    await supabase.from('notifications').insert({
      title: n.title,
      message: n.message,
      date: n.date,
      type: n.type,
      read: n.read,
    });
  }, []);

  const registerEntrada = useCallback(
    async (productId: string, quantity: number, supplier: string, note?: string) => {
      if (quantity <= 0) return { ok: false, error: 'La cantidad debe ser mayor a 0.' };
      const product = products.find((p) => p.id === productId);
      if (!product) return { ok: false, error: 'Selecciona un producto.' };

      await supabase.from('products').update({ quantity: product.quantity + quantity }).eq('id', productId);
      await supabase.from('movements').insert({
        type: 'entrada',
        product_id: productId,
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
      await reloadAll();
      return { ok: true };
    },
    [products, pushNotification, reloadAll]
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
      await supabase.from('products').update({ quantity: newQuantity }).eq('id', productId);
      await supabase.from('movements').insert({
        type: 'salida',
        product_id: productId,
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
      await reloadAll();
      return { ok: true };
    },
    [products, pushNotification, reloadAll]
  );

  const markNotificationRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
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
