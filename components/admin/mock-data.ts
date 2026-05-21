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
  created_at?: string;
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

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 79.99,
    stock: 45,
    category: 'Electronics',
    description: 'Premium quality wireless headphones with noise cancellation',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
  },
  {
    id: '2',
    name: 'USB-C Cable',
    price: 12.99,
    stock: 120,
    category: 'Accessories',
    description: 'Durable and fast charging USB-C cable',
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400',
  },
  {
    id: '3',
    name: 'Phone Case',
    price: 24.99,
    stock: 85,
    category: 'Accessories',
    description: 'Protective phone case with premium design',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
  },
  {
    id: '4',
    name: 'Screen Protector',
    price: 9.99,
    stock: 200,
    category: 'Accessories',
    description: 'Tempered glass screen protector',
    image: 'https://images.unsplash.com/photo-1598286307391-a45c5285c232?w=400',
  },
  {
    id: '5',
    name: 'Portable Charger',
    price: 34.99,
    stock: 60,
    category: 'Electronics',
    description: '20000mAh portable power bank',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerId: 'CUST-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    date: '2024-05-15',
    total: 129.97,
    status: 'completed',
    items: [
      { id: '1', productId: '1', productName: 'Wireless Headphones', quantity: 1, price: 79.99 },
      { id: '2', productId: '2', productName: 'USB-C Cable', quantity: 2, price: 25.98 },
    ],
  },
  {
    id: 'ORD-002',
    customerId: 'CUST-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    date: '2024-05-14',
    total: 59.97,
    status: 'processing',
    items: [
      { id: '1', productId: '3', productName: 'Phone Case', quantity: 2, price: 49.98 },
      { id: '2', productId: '4', productName: 'Screen Protector', quantity: 1, price: 9.99 },
    ],
  },
  {
    id: 'ORD-003',
    customerId: 'CUST-003',
    customerName: 'Mike Johnson',
    customerEmail: 'mike@example.com',
    date: '2024-05-13',
    total: 34.99,
    status: 'completed',
    items: [
      { id: '1', productId: '5', productName: 'Portable Charger', quantity: 1, price: 34.99 },
    ],
  },
  {
    id: 'ORD-004',
    customerId: 'CUST-004',
    customerName: 'Sarah Williams',
    customerEmail: 'sarah@example.com',
    date: '2024-05-12',
    total: 124.96,
    status: 'pending',
    items: [
      { id: '1', productId: '1', productName: 'Wireless Headphones', quantity: 1, price: 79.99 },
      { id: '2', productId: '3', productName: 'Phone Case', quantity: 1, price: 24.99 },
      { id: '3', productId: '4', productName: 'Screen Protector', quantity: 2, price: 19.98 },
    ],
  },
  {
    id: 'ORD-005',
    customerId: 'CUST-005',
    customerName: 'Tom Brown',
    customerEmail: 'tom@example.com',
    date: '2024-05-11',
    total: 44.98,
    status: 'cancelled',
    items: [
      { id: '1', productId: '2', productName: 'USB-C Cable', quantity: 3, price: 38.97 },
      { id: '2', productId: '4', productName: 'Screen Protector', quantity: 1, price: 9.99 },
    ],
  },
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'CUST-001',
    name: 'John Doe',
    email: 'john@example.com',
    createdDate: '2024-01-15',
  },
  {
    id: 'CUST-002',
    name: 'Jane Smith',
    email: 'jane@example.com',
    createdDate: '2024-02-10',
  },
  {
    id: 'CUST-003',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    createdDate: '2024-02-28',
  },
  {
    id: 'CUST-004',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    createdDate: '2024-03-20',
  },
  {
    id: 'CUST-005',
    name: 'Tom Brown',
    email: 'tom@example.com',
    createdDate: '2024-04-05',
  },
  {
    id: 'CUST-006',
    name: 'Emily Davis',
    email: 'emily@example.com',
    createdDate: '2024-04-15',
  },
  {
    id: 'CUST-007',
    name: 'David Wilson',
    email: 'david@example.com',
    createdDate: '2024-05-01',
  },
];
