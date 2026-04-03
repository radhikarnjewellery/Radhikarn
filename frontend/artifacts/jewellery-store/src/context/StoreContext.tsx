import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ShoppingCart, Heart, Trash2, LogOut, LogIn, User as UserIcon } from "lucide-react";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export interface Product {
  _id: string;
  productId?: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  category: string;
  images: string[];
  coverImage: string;
  isNew: boolean;
  stock: number;
  isPopular: boolean;
  ratings?: number;
  orderCount?: number;
}

export interface Category {
  _id: string;
  name: string;
  image: string;
  count: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  label?: string;
  latitude?: number;
  longitude?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  joinedAt: string;
  addresses?: IAddress[];
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearCart: () => void;
  cartTotal: number;
  user: User | null;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  createOrder: (orderData: any) => Promise<any>;
  addAddress: (addressData: any) => Promise<void>;
  updateAddress: (addressId: string, addressData: any) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  getOrder: (orderId: string) => Promise<any>;
  getUserOrders: (email: string) => Promise<any>;
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<void>;
  refreshProductStock: (productId: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${API_URL}/products`).then(r => r.json()),
          fetch(`${API_URL}/categories`).then(r => r.json())
        ]);
        setProducts(prodRes);
        setCategories(catRes);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const savedCart = localStorage.getItem("jewellery_cart");
    const savedWishlist = localStorage.getItem("jewellery_wishlist");
    const savedUser = localStorage.getItem("jewellery_user");
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Data Migration: Remove legacy 'Bespoke' terms from labels
      if (parsed.googleId && !parsed.id) parsed.id = parsed.googleId;
      if (parsed.addresses) {
        parsed.addresses = cleanAddressLabels(parsed.addresses);
      }
      setUser(parsed);
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("jewellery_cart", JSON.stringify(cart));
        localStorage.setItem("jewellery_wishlist", JSON.stringify(wishlist));
        if (user) {
          // Strip any base64 avatars before persisting
          const safeUser = { ...user, avatar: user.avatar?.startsWith('data:') ? undefined : user.avatar };
          localStorage.setItem("jewellery_user", JSON.stringify(safeUser));
        } else {
          localStorage.removeItem("jewellery_user");
        }
      } catch (e) {
        console.warn("localStorage quota exceeded, skipping save");
      }
    }
  }, [cart, wishlist, user, isLoaded]);

  const loginWithGoogle = async (credential: string) => {
    const loadingToast = toast.loading("Connecting...");
    try {
      const response = await fetch(`${API_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });

      if (!response.ok) {
        throw new Error("Authentication failure");
      }

      const data = await response.json();
      
      setUser(data.user);
      localStorage.setItem("jewellery_user_token", data.token);

      toast.dismiss(loadingToast);
      toast.custom((t) => (
        <div className="flex items-center gap-4 bg-black/90 backdrop-blur-2xl text-[#D4AF37] border border-[#D4AF37]/30 px-8 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.15)] border-l-4 border-l-[#D4AF37] animate-in fade-in slide-in-from-top-4 duration-500 w-fit whitespace-nowrap">
          <UserIcon size={18} className="stroke-[2.5px]" />
          <span className="text-[11px] uppercase tracking-[0.3em] font-black">
            Welcome back, <span className="text-white">{data.user.name.split(' ')[0]}</span>
          </span>
        </div>
      ));
    } catch (err) {
      console.error("Google Login Error:", err);
      toast.dismiss(loadingToast);
      toast.error("Authentication failed.");
    }
  };

  const logout = () => {
    setUser(null);
    toast.custom((t) => (
      <div className="flex items-center gap-4 bg-black/90 backdrop-blur-2xl text-[#D4AF37] border border-[#D4AF37]/30 px-8 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.15)] border-l-4 border-l-[#D4AF37] animate-in fade-in slide-in-from-top-4 duration-500 w-fit whitespace-nowrap">
        <LogOut size={18} className="stroke-[2.5px]" />
        <span className="text-[11px] uppercase tracking-[0.3em] font-black">
          Logged out <span className="text-white">Successfully</span>
        </span>
      </div>
    ));
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    toast.custom((t) => (
      <div className="flex items-center gap-4 bg-black/90 backdrop-blur-2xl text-[#D4AF37] border border-[#D4AF37]/30 px-8 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.15)] border-l-4 border-l-[#D4AF37] animate-in fade-in slide-in-from-top-4 duration-500 w-fit whitespace-nowrap">
        <ShoppingCart size={18} className="stroke-[2.5px]" />
        <span className="text-[11px] uppercase tracking-[0.3em] font-black">
          <span className="text-white mr-2">{product.name}</span> added to bag
        </span>
      </div>
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
    toast.custom((t) => (
      <div className="flex items-center gap-4 bg-black/90 backdrop-blur-2xl text-[#D4AF37] border border-[#D4AF37]/30 px-8 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.15)] border-l-4 border-l-[#D4AF37] animate-in fade-in slide-in-from-top-4 duration-500 w-fit whitespace-nowrap">
        <Trash2 size={18} className="stroke-[2.5px]" />
        <span className="text-[11px] uppercase tracking-[0.3em] font-black">
          Removed <span className="text-white">from Bag</span>
        </span>
      </div>
    ));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) => (item._id === productId ? { ...item, quantity } : item))
    );
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        toast.custom((t) => (
          <div className="flex items-center gap-4 bg-black/90 backdrop-blur-2xl text-[#D4AF37] border border-[#D4AF37]/30 px-8 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.15)] border-l-4 border-l-[#D4AF37] animate-in fade-in slide-in-from-top-4 duration-500 w-fit whitespace-nowrap">
            <Heart size={18} className="stroke-[2.5px]" />
            <span className="text-[10px] text-[#D4AF37] uppercase tracking-[0.5em] font-black italic">Verified Member</span>
            <span className="text-[11px] uppercase tracking-[0.3em] font-black">
              Removed <span className="text-white">from Wishlist</span>
            </span>
          </div>
        ));
        return prev.filter((item) => item._id !== product._id);
      }
      toast.custom((t) => (
        <div className="flex items-center gap-4 bg-black/90 backdrop-blur-2xl text-[#D4AF37] border border-[#D4AF37]/30 px-8 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.15)] border-l-4 border-l-[#D4AF37] animate-in fade-in slide-in-from-top-4 duration-500 w-fit whitespace-nowrap">
          <Heart size={18} className="stroke-[2.5px] fill-[#D4AF37]" />
          <span className="text-[11px] uppercase tracking-[0.3em] font-black">
            Saved <span className="text-white">to Wishlist</span>
          </span>
        </div>
      ));
      return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item._id === productId);
  };

  const clearCart = () => {
    setCart([]);
  };

  const cleanAddressLabels = (addresses: any[]) => {
    return (addresses || []).map(a => ({
      ...a,
      label: a.label === "Bespoke Destination" ? "Default" : (a.label || "Address")
    }));
  };

  // Refresh a single product's stock from server (called after stock conflict)
  const refreshProductStock = async (productId: string) => {
    try {
      const res = await fetch(`${API_URL}/products/${productId}`);
      if (!res.ok) return;
      const updated = await res.json();
      setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: updated.stock } : p));
      // Also clamp cart quantity to new stock
      setCart(prev => prev.map(item =>
        item._id === productId
          ? { ...item, stock: updated.stock, quantity: Math.min(item.quantity, updated.stock) }
          : item
      ));
    } catch {}
  };

  // Refetch all products with fresh stock
  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) return;
      const fresh: Product[] = await res.json();
      setProducts(fresh);
      setCart(prev => prev.map(item => {
        const freshProduct = fresh.find(p => p._id === item._id);
        if (!freshProduct) return item;
        return { ...item, stock: freshProduct.stock, quantity: Math.min(item.quantity, freshProduct.stock) };
      }));
    } catch {}
  }, []);

  const createOrder = async (orderData: any) => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.status === 409) {
        const err = await res.json();
        // Refresh the conflicting product's stock in realtime
        if (err.productId) await refreshProductStock(err.productId);
        throw { stockError: true, message: err.message };
      }
      if (!res.ok) throw new Error('Order creation failed');
      const data = await res.json();
      
      // Update local user state if backend returned an updated user (address saved)
      if (data.updatedUser) {
        const u = data.updatedUser;
        u.addresses = cleanAddressLabels(u.addresses);
        setUser(u);
        localStorage.setItem("jewellery_user", JSON.stringify(u));
      }
      
      return data.order || data;
    } catch (err) {
      console.error("❌ Order creation failed:", err);
      throw err;
    }
  };

  const addAddress = async (addressData: any) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/user/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, addressData })
      });
      const data = await res.json();
      const u = data.user || data;
      if (u) {
        const updatedUser = {
          id: u.googleId || u.id || user.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar,
          joinedAt: u.joinedAt,
          addresses: cleanAddressLabels(u.addresses)
        };
        setUser(updatedUser);
        localStorage.setItem("jewellery_user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("❌ Add address failed:", err);
    }
  };

  const updateAddress = async (addressId: string, addressData: any) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/user/addresses`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, addressId, addressData })
      });
      const data = await res.json();
      const u = data.user || data;
      if (u) {
        const updatedUser = {
          id: u.googleId || u.id || user.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar,
          joinedAt: u.joinedAt,
          addresses: cleanAddressLabels(u.addresses)
        };
        setUser(updatedUser);
        localStorage.setItem("jewellery_user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("❌ Update address failed:", err);
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/user/addresses`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, addressId })
      });
      const data = await res.json();
      const u = data.user || data;
      if (u) {
        const updatedUser = {
          id: u.googleId || u.id || user.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar,
          joinedAt: u.joinedAt,
          addresses: cleanAddressLabels(u.addresses)
        };
        setUser(updatedUser);
        localStorage.setItem("jewellery_user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("❌ Delete address failed:", err);
    }
  };

  const getOrder = async (orderId: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/detail/${orderId}`);
      if (!res.ok) throw new Error('Order not found');
      return await res.json();
    } catch (err) {
      console.error("❌ Fetching order failed:", err);
      throw err;
    }
  };

  const getUserOrders = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/customer/${email}`);
      if (!res.ok) throw new Error('Orders not found');
      return await res.json();
    } catch (err) {
      console.error("❌ Fetching user orders failed:", err);
      throw err;
    }
  };

  const updateProfile = async (data: { name?: string; phone?: string; avatar?: string }) => {
    if (!user) return;
    // Never store base64 in localStorage — strip it, keep only URLs
    const safeAvatar = data.avatar?.startsWith('data:') ? user.avatar : data.avatar;
    const safeData = { ...data, avatar: safeAvatar };
    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...safeData })
      });
      if (res.ok) {
        const result = await res.json();
        const u = result.user;
        const updatedUser = {
          ...user,
          name: u.name || safeData.name || user.name,
          phone: u.phone ?? safeData.phone ?? user.phone,
          avatar: u.avatar || safeData.avatar || user.avatar,
        };
        setUser(updatedUser);
        try { localStorage.setItem("jewellery_user", JSON.stringify(updatedUser)); } catch {}
        return;
      }
    } catch {}
    // Fallback: update locally if backend fails
    const updatedUser = { ...user, ...safeData };
    setUser(updatedUser);
    try { localStorage.setItem("jewellery_user", JSON.stringify(updatedUser)); } catch {}
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cart,
        wishlist,
        searchQuery,
        setSearchQuery,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleWishlist,
        isInWishlist,
        clearCart,
        cartTotal,
        user,
        loginWithGoogle,
        logout,
        loading,
        createOrder,
        addAddress,
        updateAddress,
        deleteAddress,
        getOrder,
        getUserOrders,
        updateProfile,
        refreshProductStock,
        refreshProducts,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
