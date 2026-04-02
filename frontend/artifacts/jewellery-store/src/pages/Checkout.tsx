import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useStore } from "@/context/StoreContext";
import { motion } from "framer-motion";
import { 
  ChevronRight, MapPin, Phone, User, Mail, 
  CreditCard, ShieldCheck, ArrowRight, ShoppingBag, Plus,
  Navigation, Target, Tag, X, CheckCircle, AlertTriangle
} from "lucide-react";
import { GoldenBackground } from "@/components/GoldenBackground";
import { toast } from "sonner";
import { useStockCheck } from "@/hooks/useStockCheck";

// Leaflet Imports
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const STATES_INDIA = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", 
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

// Map Event Component
function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} draggable={true} eventHandlers={{
      dragend: (e) => {
        const marker = e.target;
        const pos = marker.getLatLng();
        setPosition([pos.lat, pos.lng]);
      }
    }} />
  );
}

// Map Center Updater
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { cart, cartTotal, clearCart, createOrder, user, refreshProducts } = useStore();
  const { isOutOfStock, checked: stockChecked } = useStockCheck(cart.map(i => i._id));
  const oosItems = cart.filter(i => isOutOfStock(i._id));

  // Refresh stock on checkout mount
  useEffect(() => { refreshProducts(); }, []);
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [isNewAddress, setIsNewAddress] = useState(!user?.addresses?.length);
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.1458, 79.0882]);
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [pincodeInfo, setPincodeInfo] = useState<string>("");

  // Charges & Coupons
  const [charges, setCharges] = useState<{ _id: string; name: string; type: "fixed" | "percentage"; value: number }[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  // Payment screenshot
  const [paymentSS, setPaymentSS] = useState<string | null>(null);
  const [ssUploading, setSsUploading] = useState(false);
  const [ssError, setSsError] = useState("");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    label: "Home",
    latitude: null as number | null,
    longitude: null as number | null
  });

  // Fetch active charges on mount
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/charges/active`)
      .then(r => r.json())
      .then(data => setCharges(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), orderValue: cartTotal })
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.message || "Invalid coupon");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({ code: data.coupon?.code || couponCode.trim().toUpperCase(), discount: Math.round(data.discount) });
        setCouponError("");
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const chargesTotal = charges.reduce((sum, c) => {
    return sum + (c.type === "percentage" ? Math.round(cartTotal * c.value / 100) : c.value);
  }, 0);
  const grandTotal = Math.round(cartTotal + chargesTotal - (appliedCoupon?.discount || 0));

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) { setSsError("File must be under 1.5MB"); return; }
    setSsError("");
    setSsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/upload-screenshot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: reader.result })
        });
        const data = await res.json();
        if (data.url) { setPaymentSS(data.url); }
        else { setSsError("Upload failed, try again"); }
      } catch { setSsError("Upload failed, try again"); }
      finally { setSsUploading(false); }
    };
    reader.readAsDataURL(file);
  };

  // Location detection function (GPS with IP fallback)
  const detectLocation = async () => {
    setMapLoading(true);

    if (!navigator.geolocation) {
      // No GPS support — fall back to IP
      await ipFallback();
      return;
    }

    // Try GPS first with a 10s timeout
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ ...prev, latitude, longitude }));
        setMapCenter([latitude, longitude]);
        setMapLoading(false);
      },
      async () => {
        // GPS denied or failed — fall back to IP
        await ipFallback();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const ipFallback = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        setFormData(prev => ({
          ...prev,
          latitude: data.latitude,
          longitude: data.longitude,
          city: prev.city || data.city,
          state: prev.state || data.region,
          pincode: prev.pincode || data.postal
        }));
        setMapCenter([data.latitude, data.longitude]);
      }
    } catch (err) {
      console.error("IP Geolocation failed", err);
    } finally {
      setMapLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => {
        const newData = {
          ...prev,
          name: prev.name || user.name,
          email: prev.email || user.email
        };

        // Only load saved address if user has addresses AND isNewAddress is false
        if (user.addresses && user.addresses.length > 0 && !isNewAddress && !prev.address) {
          const addr = user.addresses[0];
          newData.address = addr.street;
          newData.city = addr.city;
          newData.state = addr.state;
          newData.pincode = addr.pincode;
          newData.phone = addr.phone;
          (newData as any).label = addr.label || "Home";
          (newData as any).latitude = addr.latitude || null;
          (newData as any).longitude = addr.longitude || null;
          if (addr.latitude && addr.longitude) {
            setMapCenter([addr.latitude, addr.longitude]);
          }
        } else if (!prev.latitude) {
          // If new address or no saved address, detect location
          detectLocation();
        }

        return newData;
      });
    } else {
      detectLocation();
    }
  }, [user]);

  // Auto-trigger pincode validation whenever pincode reaches 6 digits
  useEffect(() => {
    if (formData.pincode.length === 6 && pincodeStatus !== "checking" && pincodeStatus !== "valid") {
      validatePincode(formData.pincode);
    }
    if (formData.pincode.length < 6 && pincodeStatus !== "idle") {
      setPincodeStatus("idle");
      setPincodeInfo("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.pincode]);

  if (cart.length === 0) {
    return (
      <div className="pt-32 pb-20 text-center min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A]">
        <h1 className="text-4xl font-display mb-6 text-[#F5F5F5]">Your Bag is Empty</h1>
        <Link href="/shop" className="gold-gradient text-[#0A0A0A] px-8 py-3 rounded-full uppercase tracking-widest text-sm font-bold">Discover Collection</Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "pincode") {
      const digits = value.replace(/\D/g, "").slice(0, 6);
      setFormData({ ...formData, pincode: digits });
      // validation is handled by the useEffect watching formData.pincode
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const validatePincode = async (pin: string, skipMapUpdate = false) => {
    setPincodeStatus("checking");
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];

        let city = po.Name;
        let newLat: number | null = null;
        let newLng: number | null = null;

        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?postalcode=${pin}&country=India&format=json&addressdetails=1&limit=1`
          );
          const geoData = await geoRes.json();
          if (geoData.length > 0) {
            newLat = parseFloat(geoData[0].lat);
            newLng = parseFloat(geoData[0].lon);
            const addr = geoData[0].address;
            city = addr.city || addr.town || addr.village || addr.county || po.Name;
          }
        } catch {
          // fallback to India Post name
        }

        setPincodeStatus("valid");
        setPincodeInfo(`${city}, ${po.State}`);
        setFormData(prev => ({ ...prev, city, state: po.State }));

        // Only update map if not loading a saved address (which already has exact coords)
        if (!skipMapUpdate && newLat && newLng) {
          setMapCenter(prev => {
            const R = 6371;
            const dLat = ((newLat! - prev[0]) * Math.PI) / 180;
            const dLng = ((newLng! - prev[1]) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) ** 2 +
              Math.cos((prev[0] * Math.PI) / 180) *
                Math.cos((newLat! * Math.PI) / 180) *
                Math.sin(dLng / 2) ** 2;
            const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            if (dist > 45) {
              setFormData(p => ({ ...p, latitude: newLat, longitude: newLng }));
              return [newLat!, newLng!];
            }
            return prev;
          });
        }
      } else {
        setPincodeStatus("invalid");
        setPincodeInfo("");
      }
    } catch {
      setPincodeStatus("invalid");
      setPincodeInfo("");
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    toast.info("Requesting location access...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev: any) => ({ ...prev, latitude, longitude }));
        setMapCenter([latitude, longitude]);
        toast.success("Location identified");
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Location access denied. Please pinpoint manually on the map.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const setManualPosition = (pos: [number, number]) => {
    setFormData((prev: any) => ({ 
      ...prev, 
      latitude: pos[0], 
      longitude: pos[1] 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (oosItems.length > 0) {
      toast.error(`${oosItems.map(i => i.name).join(', ')} ${oosItems.length > 1 ? 'are' : 'is'} out of stock. Remove from cart first.`);
      return;
    }
    if (!formData.name.trim()) { toast.error("Please enter your full name"); return; }
    if (!formData.email.trim()) { toast.error("Please enter your email address"); return; }
    if (formData.phone.length !== 10) { toast.error("Phone number must be exactly 10 digits"); return; }
    if (!formData.address.trim()) { toast.error("Please enter your shipping address"); return; }
    if (pincodeStatus !== "valid") { toast.error("Please enter a valid 6-digit pincode"); return; }
    if (!formData.city.trim()) { toast.error("Please enter your city"); return; }
    if (!formData.state) { toast.error("Please select your state"); return; }
    if (!formData.latitude || !formData.longitude) { toast.error("Please select your location on the map"); return; }
    if (!paymentSS) { toast.error("Please upload your payment screenshot"); return; }
    setLoading(true);

    try {
      const orderData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        shippingDetails: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          phone: formData.phone,
          label: (formData as any).label || "",
          latitude: (formData as any).latitude,
          longitude: (formData as any).longitude
        },
        latitude: (formData as any).latitude,
        longitude: (formData as any).longitude,
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.images[0]
        })),
        subtotal: cartTotal,
        charges: charges.map(c => ({
          name: c.name,
          type: c.type,
          value: c.value,
          amount: c.type === 'percentage' ? Math.round(cartTotal * c.value / 100) : c.value
        })),
        couponCode: appliedCoupon?.code || null,
        couponDiscount: appliedCoupon?.discount || 0,
        totalAmount: grandTotal,
        paymentScreenshot: paymentSS,
        couponCode: appliedCoupon?.code || null
      };

      const result = await createOrder(orderData);
      toast.success("Order placed successfully!");
      clearCart();
      setLocation(`/orders/${result.orderId || result._id}`);
    } catch (err: any) {
      if (err?.stockError) {
        toast.error(err.message, { duration: 6000 });
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectSavedAddress = (addr: any) => {
    setMapLoading(true);
    setFormData({
      ...formData,
      address: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone,
      label: addr.label || "Home",
      latitude: addr.latitude || null,
      longitude: addr.longitude || null
    });
    if (addr.latitude && addr.longitude) {
      setMapCenter([addr.latitude, addr.longitude]);
      setTimeout(() => setMapLoading(false), 800);
    } else {
      setMapLoading(false);
    }
    // Validate pincode for city/state info only — pass skipMapUpdate=true so saved coords aren't overridden
    if (addr.pincode && addr.pincode.length === 6) {
      validatePincode(addr.pincode, true);
    }
    toast.message("Delivery address applied");
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#050505] relative overflow-hidden">
      <GoldenBackground />
      <div className="container relative z-10 mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-[#8A8A8A] mb-10 glass-card inline-flex px-6 py-3 rounded-full">
          <Link href="/cart" className="hover:text-[#D4AF37] transition-colors">Bag</Link>
          <ChevronRight size={12} className="text-[#D4AF37]" />
          <span className="text-[#D4AF37] font-bold">Secure Checkout</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-[2.5rem] border-[#D4AF37]/10 p-6 md:p-12 mb-8"
            >
              <h2 className="text-2xl lg:text-3xl font-display uppercase tracking-widest text-[#F5F5F5] mb-8 border-b border-[#D4AF37]/10 pb-6 text-center md:text-left">DELIVERY ADDRESS</h2>
              
              {user && (
                <div className="mb-10">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-black mb-4 ml-1">DELIVERY DESTINATION</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-address-scroll">
                    <button
                        onClick={() => {
                        setFormData(prev => ({
                          name: user.name,
                          email: user.email,
                          phone: "",
                          address: "",
                          city: "",
                          state: "",
                          pincode: "",
                          label: "Home",
                          latitude: null,
                          longitude: null
                        }));
                        setPincodeStatus("idle");
                        setPincodeInfo("");
                        setIsNewAddress(true);
                        // Trigger location detection for new address
                        detectLocation();
                      }}
                      type="button"
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all flex-shrink-0 ${
                        isNewAddress 
                          ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]" 
                          : "bg-white/[0.02] border-white/10 text-white/40 hover:border-[#D4AF37]/30 hover:text-white/60"
                      }`}
                    >
                      <Plus size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">New Address</span>
                    </button>

                    {user.addresses && user.addresses.length > 0 && user.addresses.map((addr: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          selectSavedAddress(addr);
                          setIsNewAddress(false);
                        }}
                        type="button"
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all flex-shrink-0 ${
                          !isNewAddress && formData.address === addr.street
                            ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]"
                            : "bg-white/[0.02] border-white/10 text-white/40 hover:border-[#D4AF37]/30 hover:text-white/60"
                        }`}
                      >
                        <MapPin size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{addr.label || `Address ${idx + 1}`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#555] font-black flex items-center gap-2">
                      <User size={12} className="text-[#D4AF37]" /> Full Name
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Aryan Radhikarn"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-6 text-[#F5F5F5] placeholder:text-[#333] outline-none focus:border-[#D4AF37]/40 focus:bg-white/[0.04] transition-all text-sm tracking-widest"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#555] font-black flex items-center gap-2">
                      <Mail size={12} className="text-[#D4AF37]" /> Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. aryan@luxury.com"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-6 text-[#F5F5F5] placeholder:text-[#333] outline-none focus:border-[#D4AF37]/40 focus:bg-white/[0.04] transition-all text-sm tracking-widest"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-[#555] font-black flex items-center gap-2">
                                <Phone size={12} className="text-[#D4AF37]" /> Contact Number
                            </label>
                            <div className="flex gap-2">
                                <span className="bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-4 text-[#555] text-sm font-black">+91</span>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        setFormData(prev => ({ ...prev, phone: val }));
                                    }}
                                    inputMode="numeric"
                                    maxLength={10}
                                    placeholder="9999988888"
                                    className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-6 text-[#F5F5F5] placeholder:text-[#333] outline-none focus:border-[#D4AF37]/40 focus:bg-white/[0.04] transition-all text-sm tracking-widest"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-[#555] font-black ml-1">Pincode</label>
                            <div className="flex gap-2">
                              <input 
                                name="pincode" 
                                value={formData.pincode} 
                                onChange={handleChange}
                                maxLength={6}
                                inputMode="numeric"
                                className={`flex-1 bg-white/[0.02] border rounded-2xl py-4 px-6 text-[#F5F5F5] placeholder:text-[#333] outline-none transition-all text-sm tracking-widest ${
                                  pincodeStatus === "valid" ? "border-green-400/40 focus:border-green-400/60" :
                                  pincodeStatus === "invalid" ? "border-red-400/40 focus:border-red-400/60" :
                                  "border-white/5 focus:border-[#D4AF37]/40 focus:bg-white/[0.04]"
                                }`}
                                placeholder="E.G. 400001"
                              />
                              {formData.pincode.length === 6 && pincodeStatus !== "valid" && pincodeStatus !== "checking" && (
                                <button
                                  type="button"
                                  onClick={() => validatePincode(formData.pincode)}
                                  className="px-4 rounded-2xl border border-[#D4AF37]/30 text-[#D4AF37] text-[9px] uppercase tracking-widest font-black hover:bg-[#D4AF37]/10 transition-all whitespace-nowrap"
                                >
                                  Check
                                </button>
                              )}
                            </div>
                            {pincodeStatus === "checking" && <p className="text-[9px] text-[#D4AF37] tracking-widest uppercase ml-1">Checking...</p>}
                            {pincodeStatus === "valid" && <p className="text-[9px] text-green-400 tracking-widest uppercase ml-1">✓ {pincodeInfo}</p>}
                            {pincodeStatus === "invalid" && <p className="text-[9px] text-red-400 tracking-widest uppercase ml-1">⚠ Invalid pincode</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-[#555] font-black flex items-center gap-2">
                                <MapPin size={12} className="text-[#D4AF37]" /> Shipping Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Grand Suite, Luxury Towers..."
                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-6 text-[#F5F5F5] placeholder:text-[#333] outline-none focus:border-[#D4AF37]/40 focus:bg-white/[0.04] transition-all text-sm tracking-widest resize-none"
                            />
                        </div>

                        {isNewAddress && (
                            <div className="space-y-4">
                                <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-black italic ml-1">Address Label</p>
                                <div className="flex flex-wrap gap-2">
                                    {["Home", "Work", "Office", "Studio", "Other"].map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, label: tag })}
                                            className={`px-4 py-2 rounded-full border transition-all text-[8px] uppercase font-bold tracking-widest ${
                                                formData.label === tag 
                                                    ? "bg-[#D4AF37] border-[#D4AF37] text-black" 
                                                    : "bg-white/[0.02] border-white/10 text-[#666] hover:border-[#D4AF37]/40"
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-end">
                            <button type="button" onClick={requestLocation} className="flex items-center gap-2 text-[8px] uppercase font-black text-white/40 hover:text-[#D4AF37] transition-colors">
                                <Navigation size={12} /> Use GPS
                            </button>
                        </div>
                        <div className="flex-1 min-h-[280px] h-full rounded-[2rem] border border-white/5 overflow-hidden relative glass-card">
                            <MapContainer center={mapCenter} zoom={13} minZoom={10} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
                                <ChangeView center={mapCenter} />
                                <LocationMarker 
                                    position={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : null} 
                                    setPosition={setManualPosition} 
                                />
                            </MapContainer>
                            {mapLoading && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[20] flex items-center justify-center text-center p-6 pointer-events-none transition-opacity duration-300">
                                     <div className="flex flex-col items-center gap-4">
                                         <div className="w-10 h-10 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                                         <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-black">Loading Map...</p>
                                     </div>
                                 </div>
                            )}
                            {!formData.latitude && !mapLoading && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[20] flex items-center justify-center text-center p-6 pointer-events-none transition-opacity duration-500">
                                     <div className="flex flex-col items-center gap-4">
                                         <div className="w-8 h-8 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                                         <p className="text-[9px] uppercase tracking-[0.3em] text-white/60 font-black">Locating...</p>
                                     </div>
                                 </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full">
                    <div className="space-y-2 min-w-0">
                        <label className="text-[10px] uppercase tracking-widest text-[#555] font-black ml-1">City</label>
                        <input 
                          name="city" 
                          value={formData.city} 
                          onChange={handleChange} 
                          className="w-full h-[56px] bg-white/[0.02] border border-white/5 rounded-xl px-4 text-[#F5F5F5] outline-none focus:border-[#D4AF37]/40 text-[11px] tracking-[0.1em] transition-all" 
                          placeholder="E.G. MUMBAI"
                        />
                    </div>
                    
                    <div className="space-y-2 min-w-0">
                        <label className="text-[10px] uppercase tracking-widest text-[#555] font-black ml-1">State / UT</label>
                        <div className="relative group">
                            <select 
                                name="state" 
                                value={formData.state} 
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })} 
                                className="w-full h-[56px] bg-white/[0.02] border border-white/5 rounded-xl px-4 pr-8 text-[#F5F5F5] outline-none focus:border-[#D4AF37]/40 text-[10px] tracking-widest appearance-none cursor-pointer transition-all"
                            >
                                <option value="" className="bg-[#111]">SELECT...</option>
                                {STATES_INDIA.map(s => (
                                    <option key={s} value={s} className="bg-[#111]">{s}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#444] group-hover:text-[#D4AF37] transition-colors">
                                <ChevronRight size={12} className="rotate-90" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 min-w-0">
                        <label className="text-[10px] uppercase tracking-widest text-[#555] font-black ml-1">Country</label>
                        <input 
                          value="INDIA" 
                          disabled 
                          className="w-full h-[56px] bg-white/[0.02] border border-white/5 rounded-xl px-4 text-white/20 outline-none cursor-not-allowed text-[11px] tracking-[0.2em] font-black" 
                        />
                    </div>
                </div>

                <div className="pt-8">
                  <button
                    disabled={loading || pincodeStatus !== "valid" || !paymentSS}
                    className={`w-full gold-gradient text-black py-5 rounded-2xl flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-[10px] font-black transition-all shadow-[0_20px_40px_-10px_rgba(212,175,55,0.4)] relative overflow-hidden group ${loading || pincodeStatus !== "valid" || !paymentSS ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"}`}
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Processing Order...
                      </div>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Confirm & Secure Order
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          <div className="w-full lg:w-[400px]">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-[2.5rem] border-[#D4AF37]/10 p-8 md:p-10 sticky top-28"
            >
              <h3 className="text-xl font-display uppercase tracking-widest text-[#F5F5F5] mb-8 flex items-center gap-3">
                <ShoppingBag size={20} className="text-[#D4AF37]" /> Your Selection
              </h3>

              <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => {
                  const oos = isOutOfStock(item._id);
                  return (
                    <div key={item._id} className={`flex gap-4 items-center border-b pb-4 last:border-0 ${oos ? 'border-red-500/20' : 'border-white/5'}`}>
                      <div className={`w-16 h-16 rounded-xl overflow-hidden border flex-shrink-0 relative ${oos ? 'border-red-500/30' : 'border-white/5'}`}>
                        <img src={item.images[0]} alt={item.name} className={`w-full h-full object-cover ${oos ? 'grayscale-[0.7]' : ''}`} />
                        {oos && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <AlertTriangle size={14} className="text-red-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold uppercase tracking-widest truncate ${oos ? 'text-red-400/70' : 'text-[#F5F5F5]'}`}>{item.name}</p>
                        {oos
                          ? <p className="text-red-400 text-[9px] mt-1 font-black uppercase tracking-widest">Out of stock</p>
                          : <p className="text-[#555] text-[10px] mt-1 font-bold italic">{item.quantity} x ₹{item.price.toLocaleString()}</p>
                        }
                      </div>
                      {!oos && <p className="text-[#D4AF37] text-xs font-black">₹{(item.price * item.quantity).toLocaleString()}</p>}
                    </div>
                  );
                })}
              </div>

              {/* OOS warning banner */}
              {stockChecked && oosItems.length > 0 && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                  <AlertTriangle size={13} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[9px] uppercase tracking-[0.25em] font-black text-red-400 leading-relaxed">
                    {oosItems.length} item{oosItems.length > 1 ? 's are' : ' is'} out of stock. Go back to cart and remove before placing order.
                  </p>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#666]">
                  <span>Subtotal</span>
                  <span className="text-[#AAA]">₹{cartTotal.toLocaleString()}</span>
                </div>

                {/* Dynamic charges only — nothing shown if none configured */}
                {charges.map(c => (
                  <div key={c._id} className="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#666]">
                    <span>{c.name}</span>
                    <span className="text-[#AAA]">
                      {c.type === "percentage"
                        ? `₹${Math.round(cartTotal * c.value / 100).toLocaleString()} (${c.value}%)`
                        : `₹${c.value.toLocaleString()}`}
                    </span>
                  </div>
                ))}

                {/* Coupon discount */}
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                    <span className="text-green-400 flex items-center gap-1">
                      <Tag size={10} /> {appliedCoupon.code}
                    </span>
                    <span className="text-green-400 font-black">-₹{appliedCoupon.discount.toLocaleString()}</span>
                  </div>
                )}

                {/* Coupon input */}
                <div className="pt-2">
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                      placeholder="COUPON CODE"
                      className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl py-2.5 px-4 text-[#F5F5F5] placeholder:text-[#333] outline-none focus:border-[#D4AF37]/40 text-[10px] tracking-widest"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}
                        className="px-3 rounded-xl border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <X size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={validateCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[9px] font-black uppercase tracking-widest hover:bg-[#D4AF37]/20 transition-all disabled:opacity-40"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    )}
                  </div>
                  {couponError && <p className="text-[9px] text-red-400 mt-1 ml-1 uppercase tracking-widest">{couponError}</p>}
                  {appliedCoupon && <p className="text-[9px] text-green-400 mt-1 ml-1 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10} /> Coupon applied</p>}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent my-4"></div>

                {/* Payment Screenshot Upload */}
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-black">Payment Screenshot <span className="text-red-400">*</span></p>
                  {paymentSS ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#D4AF37]/30">
                      <img src={paymentSS} alt="Payment proof" className="w-full h-32 object-cover" />
                      <button type="button" onClick={() => setPaymentSS(null)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white/60 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1.5 text-center">
                        <p className="text-[9px] text-green-400 uppercase tracking-widest font-black">✓ Uploaded</p>
                      </div>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-6 cursor-pointer transition-all ${ssUploading ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5' : 'border-white/10 hover:border-[#D4AF37]/40 hover:bg-white/[0.02]'}`}>
                      <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotUpload} disabled={ssUploading} />
                      {ssUploading ? (
                        <div className="w-6 h-6 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#D4AF37]/40"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      )}
                      <p className="text-[9px] uppercase tracking-widest text-white/30 font-black">{ssUploading ? 'Uploading...' : 'Upload screenshot'}</p>
                      <p className="text-[8px] text-white/20 uppercase tracking-widest">Max 1.5MB</p>
                    </label>
                  )}
                  {ssError && <p className="text-[9px] text-red-400 uppercase tracking-widest">{ssError}</p>}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent my-4"></div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#F5F5F5] font-black">Total</span>
                  <span className="text-2xl font-mono font-black text-[#D4AF37]">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
