export type StockStatus = 'normal' | 'bajo' | 'sin_stock';

export interface Category {
  id: string;
  name: string;
  icon: string; // nombre de icono de Ionicons
  color: string; // color pastel de fondo
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description?: string;
  price: number;
  quantity: number;
  minStock: number;
  supplier?: string;
}

export type MovementType = 'entrada' | 'salida';

export interface Movement {
  id: string;
  type: MovementType;
  productId: string;
  quantity: number;
  date: string; // ISO string
  note?: string;
  supplier?: string; // solo entradas
  client?: string; // solo salidas
  reason?: 'venta' | 'uso_interno'; // solo salidas
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'stock_bajo' | 'sin_stock' | 'entrada' | 'salida';
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
}

export function getStockStatus(product: Product): StockStatus {
  if (product.quantity <= 0) return 'sin_stock';
  if (product.quantity <= product.minStock) return 'bajo';
  return 'normal';
}
