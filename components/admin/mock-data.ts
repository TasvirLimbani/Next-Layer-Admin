// Mock Data for Admin Panel

export interface Product {
  id: string;
  name: string;
  price: number | string;
  stock: number | string;
  category: string;
  description: string;
  image: string;
  subcategory?: string;
  sku?: string;
  status?: string;
  customizable?: number;
  created_at?: string;
  image_urls?: string[];
}


export interface Filament {
  id: string;

  title: string;

  description: string;

  sku: string;

  slug: string;

  colour: string[];

  diameter: string[];

  weight: string[];

  price: string;

  images: string[];

  created_at?: string;

  updated_at?: string;
}



export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  items: OrderItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdDate: string;
}

