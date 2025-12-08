// Ensure API_BASE_URL always ends with /api
const getApiBaseUrl = () => {
  // @ts-ignore - Vite environment variables
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Remove trailing slash if present
  const baseUrl = envUrl.replace(/\/$/, '');
  // Add /api if not already present
  const finalUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
  console.log('🔧 API Base URL configured:', finalUrl);
  return finalUrl;
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Get user from localStorage
export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set user in localStorage
export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove user from localStorage
export const removeUser = (): void => {
  localStorage.removeItem('user');
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log('🌐 API Request:', `${API_BASE_URL}${endpoint}`, options.method || 'GET');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log('📡 API Response Status:', response.status, response.statusText);

    const data = await response.json();
    console.log('📦 API Response Data:', data);

    if (!response.ok) {
      console.error('❌ API Error:', data);
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('❌ API Request Error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Auth API functions
export const authAPI = {
  signup: async (
    fullName: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        fullName,
        email,
        phone,
        password,
        confirmPassword,
      }),
    });

    if (response.data) {
      setToken(response.data.token);
      setUser(response.data.user);
    }

    return response.data!;
  },

  login: async (email: string, password: string, username?: string): Promise<AuthResponse & { isAdmin?: boolean }> => {
    // Send email/username in the email field - backend will check admin first, then user
    const response = await apiRequest<AuthResponse & { isAdmin?: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email, // Can be email or username
        password,
      }),
    });

    if (response.data) {
      setToken(response.data.token);
      setUser(response.data.user);
    }

    return response.data!;
  },

  logout: (): void => {
    removeToken();
    removeUser();
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiRequest<{ user: User }>('/auth/me');
    if (response.data) {
      setUser(response.data.user);
    }
    return response.data!.user;
  },
};

// Item interface
export interface Item {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  image: string;
  imageType: string;
  discount?: number;
  discountTitle?: string;
  discountStartDate?: string;
  discountEndDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Items API functions
export const itemsAPI = {
  addItem: async (
    title: string,
    price: number,
    category: string,
    description: string,
    stock: number,
    image: string, // Base64 encoded
    imageType: string,
    discount?: number
  ): Promise<Item> => {
    const response = await apiRequest<{ item: Item }>('/items', {
      method: 'POST',
      body: JSON.stringify({
        title,
        price,
        category,
        description,
        stock,
        image,
        imageType,
        discount: discount || 0,
      }),
    });

    return response.data!.item;
  },

  getItems: async (category?: string, isActive?: boolean): Promise<Item[]> => {
    let url = '/items';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    if (params.toString()) url += `?${params.toString()}`;

    const response = await apiRequest<{ items: Item[] }>(url);
    return response.data!.items;
  },

  getItem: async (id: string): Promise<Item> => {
    const response = await apiRequest<{ item: Item }>(`/items/${id}`);
    return response.data!.item;
  },

  getItemsBatch: async (itemIds: string[]): Promise<Item[]> => {
    const response = await apiRequest<{ items: Item[] }>('/items/batch', {
      method: 'POST',
      body: JSON.stringify({
        itemIds,
      }),
    });
    return response.data!.items;
  },

  getTopOrderedItems: async (limit: number = 4): Promise<Item[]> => {
    const response = await apiRequest<{ items: Item[] }>(`/items/top-ordered/${limit}`);
    return response.data!.items;
  },

  updateItem: async (
    id: string,
    updates: Partial<Item>
  ): Promise<Item> => {
    const response = await apiRequest<{ item: Item }>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    return response.data!.item;
  },

  deleteItem: async (id: string): Promise<void> => {
    await apiRequest(`/items/${id}`, {
      method: 'DELETE',
    });
  },
};

// Review interface
export interface Review {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  review: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewStats {
  averageRating: number;
  ratingCount: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// Reviews API
export const reviewsAPI = {
  getReviews: async (itemId: string): Promise<{ reviews: Review[]; averageRating: number; ratingCount: number; ratingDistribution: ReviewStats['ratingDistribution'] }> => {
    const response = await apiRequest<{ reviews: Review[]; averageRating: number; ratingCount: number; ratingDistribution: ReviewStats['ratingDistribution'] }>(`/reviews/item/${itemId}`);
    return response.data!;
  },

  addReview: async (
    itemId: string,
    userId: string,
    userName: string,
    userEmail: string,
    rating: number,
    review: string
  ): Promise<Review> => {
    const response = await apiRequest<{ review: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        itemId,
        userId,
        userName,
        userEmail,
        rating,
        review,
      }),
    });

    return response.data!.review;
  },

  updateReview: async (
    id: string,
    rating?: number,
    review?: string
  ): Promise<Review> => {
    const response = await apiRequest<{ review: Review }>(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        rating,
        review,
      }),
    });

    return response.data!.review;
  },

  deleteReview: async (id: string): Promise<void> => {
    await apiRequest(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};

// Favorite interface
export interface Favorite {
  id: string;
  userId: string;
  itemId: string;
  item?: Item;
  createdAt: string;
}

// Favorites API
export const favoritesAPI = {
  getUserFavorites: async (userId: string, includeItems: boolean = false): Promise<Favorite[]> => {
    const url = includeItems 
      ? `/favorites/user/${userId}?includeItems=true`
      : `/favorites/user/${userId}`;
    const response = await apiRequest<{ favorites: Favorite[] }>(url);
    return response.data!.favorites;
  },

  checkFavorite: async (itemId: string, userId: string): Promise<boolean> => {
    const response = await apiRequest<{ isFavorited: boolean }>(`/favorites/check/${itemId}/${userId}`);
    return response.data!.isFavorited;
  },

  checkFavoritesBatch: async (itemIds: string[], userId: string): Promise<Record<string, boolean>> => {
    const response = await apiRequest<Record<string, boolean>>('/favorites/check-batch', {
      method: 'POST',
      body: JSON.stringify({
        itemIds,
        userId,
      }),
    });
    return response.data!;
  },

  addFavorite: async (itemId: string, userId: string): Promise<Favorite> => {
    const response = await apiRequest<{ favorite: Favorite }>('/favorites', {
      method: 'POST',
      headers: {
        'user-id': userId,
      },
      body: JSON.stringify({
        itemId,
        userId,
      }),
    });

    return response.data!.favorite;
  },

  removeFavorite: async (itemId: string, userId: string): Promise<void> => {
    await apiRequest(`/favorites/${itemId}/${userId}`, {
      method: 'DELETE',
    });
  },
};

// Cart interfaces
export interface CartItem {
  id: string;
  itemId: string;
  item?: Item;
  quantity: number;
  customMessage?: string;
  addedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: string;
  totalDiscount: string;
  total: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

// Cart API
export const cartAPI = {
  getCart: async (userId: string): Promise<Cart> => {
    const response = await apiRequest<{ cart: Cart }>(`/cart/user/${userId}`);
    return response.data!.cart;
  },

  addToCart: async (
    itemId: string,
    userId: string,
    quantity: number = 1,
    customMessage?: string
  ): Promise<void> => {
    await apiRequest('/cart/add', {
      method: 'POST',
      headers: {
        'user-id': userId,
      },
      body: JSON.stringify({
        itemId,
        userId,
        quantity,
        customMessage,
      }),
    });
  },

  updateCartItem: async (
    cartItemId: string,
    userId: string,
    quantity?: number,
    customMessage?: string
  ): Promise<void> => {
    await apiRequest(`/cart/item/${cartItemId}`, {
      method: 'PUT',
      headers: {
        'user-id': userId,
      },
      body: JSON.stringify({
        quantity,
        customMessage,
      }),
    });
  },

  removeCartItem: async (cartItemId: string, userId: string): Promise<void> => {
    await apiRequest(`/cart/item/${cartItemId}/${userId}`, {
      method: 'DELETE',
    });
  },

  clearCart: async (userId: string): Promise<void> => {
    await apiRequest(`/cart/user/${userId}`, {
      method: 'DELETE',
    });
  },
};

// Order interfaces
export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface OrderItem {
  itemId: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  customMessage?: string;
  image: string;
  imageType: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'cod' | 'online' | 'upi' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  totalDiscount: number;
  shippingCharges: number;
  totalAmount: number;
  notes?: string;
  placedAt: string;
  deliveredAt?: string;
  createdAt: string;
}

// Order API
export const ordersAPI = {
  placeOrder: async (
    userId: string,
    shippingAddress: ShippingAddress,
    paymentMethod: 'cod' | 'online' | 'upi' | 'card',
    notes?: string
  ): Promise<{ order: { id: string; orderNumber: string; totalAmount: number; orderStatus: string; paymentStatus: string; placedAt: string } }> => {
    const response = await apiRequest<{ order: Order }>('/orders/place', {
      method: 'POST',
      headers: {
        'user-id': userId,
      },
      body: JSON.stringify({
        userId,
        shippingAddress,
        paymentMethod,
        notes,
      }),
    });
    return response.data!;
  },

  getUserOrders: async (userId: string): Promise<Order[]> => {
    const response = await apiRequest<{ orders: Order[] }>(`/orders/user/${userId}`);
    return response.data!.orders;
  },

  getOrder: async (orderId: string): Promise<Order> => {
    const response = await apiRequest<{ order: Order }>(`/orders/${orderId}`);
    return response.data!.order;
  },

  // Admin API functions
  getAllOrders: async (status?: string): Promise<Order[]> => {
    const url = status ? `/orders?status=${status}` : '/orders';
    const response = await apiRequest<{ orders: Order[] }>(url);
    return response.data!.orders;
  },

  updateOrderStatus: async (
    orderId: string,
    updates: { orderStatus?: string; paymentStatus?: string }
  ): Promise<{ order: { id: string; orderNumber: string; orderStatus: string; paymentStatus: string } }> => {
    const response = await apiRequest<{ order: Order }>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data!;
  },
};

// Payment interfaces
export interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  amount: number;
  currency: string;
  paymentMethod: 'cod' | 'online' | 'upi' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  transactionId?: string;
  paymentGateway?: string;
  paymentDate?: string;
  failureReason?: string;
  refundAmount?: number;
  refundDate?: string;
  refundReason?: string;
  paymentDetails?: any;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment API
export const paymentsAPI = {
  getPaymentByOrder: async (orderId: string): Promise<Payment> => {
    const response = await apiRequest<{ payment: Payment }>(`/payments/order/${orderId}`);
    return response.data!.payment;
  },

  getUserPayments: async (userId: string): Promise<Payment[]> => {
    const response = await apiRequest<{ payments: Payment[] }>(`/payments/user/${userId}`);
    return response.data!.payments;
  },

  getAllPayments: async (status?: string, paymentMethod?: string): Promise<Payment[]> => {
    let url = '/payments';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (paymentMethod) params.append('paymentMethod', paymentMethod);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await apiRequest<{ payments: Payment[] }>(url);
    return response.data!.payments;
  },

  updatePaymentStatus: async (
    paymentId: string,
    updates: {
      paymentStatus?: string;
      transactionId?: string;
      paymentGateway?: string;
      paymentDate?: string;
      failureReason?: string;
      paymentDetails?: any;
    }
  ): Promise<{ payment: Payment }> => {
    const response = await apiRequest<{ payment: Payment }>(`/payments/${paymentId}/status`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data!;
  },

  processRefund: async (
    paymentId: string,
    refundAmount?: number,
    refundReason?: string
  ): Promise<{ payment: Payment }> => {
    const response = await apiRequest<{ payment: Payment }>(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ refundAmount, refundReason }),
    });
    return response.data!;
  },

  // Razorpay functions
  createRazorpayOrder: async (
    amount: number,
    currency: string = 'INR',
    orderId?: string,
    userId?: string
  ): Promise<{ orderId: string; amount: number; currency: string; receipt: string }> => {
    const response = await apiRequest<{
      orderId: string;
      amount: number;
      currency: string;
      receipt: string;
    }>('/payments/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, orderId, userId }),
    });
    return response.data!;
  },

  verifyRazorpayPayment: async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    orderId?: string,
    userId?: string
  ): Promise<{ paymentId: string; orderId: string }> => {
    const response = await apiRequest<{ paymentId: string; orderId: string }>(
      '/payments/razorpay/verify',
      {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          orderId,
          userId,
        }),
      }
    );
    return response.data!;
  },
};

// Chat Message interface
export interface ChatMessage {
  id: string;
  userId: string;
  productId?: string;
  message: string;
  sender: 'user' | 'admin';
  isRead: boolean;
  createdAt: string;
}

// Chat API
export const chatAPI = {
  sendMessage: async (message: string, productId?: string): Promise<ChatMessage> => {
    const response = await apiRequest<{ chatMessage: ChatMessage }>('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ message, productId }),
    });
    return response.data!.chatMessage;
  },

  getMessages: async (): Promise<ChatMessage[]> => {
    const response = await apiRequest<{ messages: ChatMessage[] }>('/chat/messages');
    return response.data!.messages;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiRequest<{ unreadCount: number }>('/chat/unread-count');
    return response.data!.unreadCount;
  },

  markAsRead: async (): Promise<void> => {
    await apiRequest('/chat/mark-read', {
      method: 'PUT',
    });
  },

  // Admin-specific functions
  getConversations: async (): Promise<Array<{
    userId: string;
    userName: string;
    userEmail: string;
    lastMessage: string;
    lastMessageText?: string;
    unreadCount: number;
  }>> => {
    const response = await apiRequest<{ conversations: Array<{
      userId: string;
      userName: string;
      userEmail: string;
      lastMessage: string;
      lastMessageText?: string;
      unreadCount: number;
    }> }>('/chat/conversations');
    return response.data!.conversations;
  },

  getMessagesForUser: async (userId: string): Promise<ChatMessage[]> => {
    const response = await apiRequest<{ messages: ChatMessage[] }>(`/chat/messages?userId=${userId}`);
    return response.data!.messages;
  },

  sendMessageToUser: async (userId: string, message: string): Promise<ChatMessage> => {
    const response = await apiRequest<{ chatMessage: ChatMessage }>('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ message, targetUserId: userId }),
    });
    return response.data!.chatMessage;
  },

  markUserMessagesAsRead: async (userId: string): Promise<void> => {
    await apiRequest('/chat/mark-read', {
      method: 'PUT',
      body: JSON.stringify({ userId }),
    });
  },
};

