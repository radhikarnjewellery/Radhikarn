import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Home, 
  Briefcase, 
  Building2, 
  Globe,
  ChevronLeft,
  X,
  Target,
  Phone,
  Navigation
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/context/StoreContext";
import { GoldenBackground } from "@/components/GoldenBackground";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ConfirmationModal";

// Leaflet Imports
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons in production/vite
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

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const TAG_OPTIONS = [
  { id: "Home", icon: Home, label: "Home" },
  { id: "Work", icon: Briefcase, label: "Work" },
  { id: "Office", icon: Building2, label: "Office" },
  { id: "Studio", icon: Target, label: "Studio" },
  { id: "Other", icon: Globe, label: "Other" }
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

export default function Addresses() {
  const { user, loading, addAddress, updateAddress, deleteAddress } = useStore();
  const [, setLocation] = useLocation();
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.1458, 79.0882]); // Default center (Nagpur/India)
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [pincodeInfo, setPincodeInfo] = useState<string>("");

  if (loading) {
     return (
       <div className="min-h-screen bg-[#050505] flex items-center justify-center">
         <div className="w-12 h-12 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
       </div>
     );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  useEffect(() => {
    const detectLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setEditingAddress((prev: any) => prev ? ({ ...prev, latitude, longitude }) : null);
            setMapCenter([latitude, longitude]);
          },
          async () => {
            try {
              const res = await fetch('https://ipapi.co/json/');
              const data = await res.json();
              if (data.latitude && data.longitude) {
                setEditingAddress((prev: any) => prev ? ({ 
                  ...prev, 
                  latitude: data.latitude, 
                  longitude: data.longitude,
                  city: (prev as any).city || data.city,
                  state: (prev as any).state || data.region,
                  pincode: (prev as any).pincode || data.postal
                }) : null);
                setMapCenter([data.latitude, data.longitude]);
              }
            } catch (err) {
              console.error("IP Geolocation failed", err);
            }
          }
        );
      }
    };

    if (showModal && editingAddress && !editingAddress.id && !editingAddress.latitude) {
      detectLocation();
    }
  }, [showModal, editingAddress?.id]);

  const validatePincode = async (pin: string) => {
    if (pin.length !== 6) {
      setPincodeStatus("idle");
      setPincodeInfo("");
      return;
    }

    setPincodeStatus("checking");
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      
      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        let city = po.District;
        let newLat: number | null = null;
        let newLng: number | null = null;

        // Try geocoding for map placement
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?postalcode=${pin}&country=India&format=json&addressdetails=1&limit=1`
          );
          const geoData = await geoRes.json();
          if (geoData.length > 0) {
            newLat = parseFloat(geoData[0].lat);
            newLng = parseFloat(geoData[0].lon);
            const addr = geoData[0].address;
            city = addr.city || addr.town || addr.village || addr.county || po.District;
          }
        } catch (e) {
          console.warn("Geocoding failed", e);
        }

        setPincodeStatus("valid");
        setPincodeInfo(`${city}, ${po.State}`);
        setEditingAddress((prev: any) => ({ ...prev, city, state: po.State, pincode: pin }));

        if (newLat && newLng) {
          setMapCenter([newLat, newLng]);
          setEditingAddress((prev: any) => ({ ...prev, latitude: newLat, longitude: newLng }));
        }
        toast.success(`Autofilled: ${city}, ${po.State}`);
      } else {
        setPincodeStatus("invalid");
        setPincodeInfo("");
      }
    } catch (error) {
      console.error("Pincode validation failed", error);
      setPincodeStatus("invalid");
      setPincodeInfo("");
    }
  };

  const handleEdit = (addr: any) => {
    setEditingAddress({ ...addr, id: addr._id });
    if (addr.latitude && addr.longitude) {
      setMapCenter([addr.latitude, addr.longitude]);
    }
    if (addr.pincode && addr.pincode.length === 6) {
      validatePincode(addr.pincode);
    } else {
      setPincodeStatus("idle");
      setPincodeInfo("");
    }
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingAddress({
      street: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      label: "",
      latitude: null,
      longitude: null
    });
    setPincodeStatus("idle");
    setPincodeInfo("");
    setShowModal(true);
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
        setEditingAddress((prev: any) => ({ ...prev, latitude, longitude }));
        setMapCenter([latitude, longitude]);
        toast.success("Location identified");
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Location access denied. Please pinpoint manually on the map.");
      }
    );
  };

  const setManualPosition = (pos: [number, number]) => {
    setEditingAddress((prev: any) => ({ 
      ...prev, 
      latitude: pos[0], 
      longitude: pos[1] 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress.label) { toast.error("Please select an address label"); return; }
    if (!editingAddress.street?.trim()) { toast.error("Street & area is required"); return; }
    if (!editingAddress.city?.trim()) { toast.error("City is required"); return; }
    if (!editingAddress.state) { toast.error("Please select a state"); return; }
    if (!editingAddress.pincode?.trim() || editingAddress.pincode.length < 6) { toast.error("Valid 6-digit pincode is required"); return; }
    const phone = editingAddress.phone?.replace('+91','').replace(/\D/g,'') || '';
    if (phone.length !== 10) { toast.error("Phone number must be exactly 10 digits"); return; }
    if (!editingAddress.latitude || !editingAddress.longitude) { toast.error("Please pin your location on the map"); return; }
    if (pincodeStatus === "invalid") { toast.error("Please use a valid pincode"); return; }
    setIsSaving(true);
    try {
      if (editingAddress.id) {
        await updateAddress(editingAddress.id, editingAddress);
        toast.success("Delivery address updated");
      } else {
        await addAddress(editingAddress);
        toast.success("New address added successfully");
      }
      setShowModal(false);
      setEditingAddress(null);
    } catch (err) {
      console.error("❌ Action failed:", err);
      toast.error("Failed to save. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSaving(true);
    try {
      await deleteAddress(id);
      toast.success("Address removed");
      setIsDeleting(null);
    } catch (err) {
      toast.error("Failed to remove address");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#050505] relative overflow-hidden font-outfit">
      <GoldenBackground />
      <div className="absolute top-0 right-0 w-1/2 h-screen bg-[#D4AF37]/[0.02] -skew-x-12 blur-[120px]"></div>

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <motion.div initial="hidden" animate="visible" className="space-y-12">
          {/* Address Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <Link href="/account" className="flex items-center gap-2 text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-black hover:opacity-70 transition-opacity">
                <ChevronLeft size={16} />
                Back to Dashboard
              </Link>
              <h1 className="text-4xl md:text-5xl font-display text-white uppercase tracking-tight">
                Delivery <span className="gold-gradient-text italic font-medium font-cormorant lowercase tracking-normal">Addresses</span>
              </h1>
            </div>
            
            <button 
              onClick={handleAddNew}
              className="px-8 py-4 rounded-full bg-[#D4AF37] text-black text-[10px] uppercase font-black tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-[#D4AF37]/10"
            >
              <Plus size={18} />
              Add New Address
            </button>
          </div>

          {/* Address Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            {user.addresses && user.addresses.length > 0 ? (
              user.addresses.map((addr: any, idx: number) => (
                <motion.div 
                  key={addr._id || idx}
                  variants={fadeInUp}
                  className="glass-card rounded-[2.5rem] border-white/5 p-10 relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all shadow-2xl bg-gradient-to-br from-white/[0.04] to-transparent min-h-[250px] flex flex-col justify-center"
                >
                  <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#D4AF37]/5 blur-[60px] rounded-full group-hover:bg-[#D4AF37]/10 transition-colors"></div>
                  
                  <div className="relative space-y-8">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl glass-card border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-lg group-hover:scale-110 transition-transform">
                          <MapPin size={28} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-white text-[9px] uppercase tracking-[0.4em] font-black italic opacity-40">Saved Location</h4>
                          <span className="text-[10px] uppercase tracking-[0.2em] font-black px-4 py-1.5 rounded-full bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 inline-block">
                            {addr.label || "Address"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleEdit(addr)} 
                          className="w-11 h-11 rounded-full glass-card border-white/5 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all shadow-xl"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setIsDeleting(addr._id)} 
                          className="w-11 h-11 rounded-full glass-card border-white/5 flex items-center justify-center text-red-500/60 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <div className="space-y-3">
                        <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-black italic">Street & Area</p>
                        <p className="text-white/90 text-base font-medium tracking-wide leading-relaxed">{addr.street}</p>
                      </div>
                      
                      <div className="space-y-5">
                        <div className="flex items-center gap-3">
                          <Phone size={13} className="text-[#D4AF37] shrink-0" strokeWidth={2.5} />
                          <p className="text-white/70 text-sm font-bold tracking-widest">+91 {addr.phone}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin size={13} className="text-[#D4AF37] shrink-0" strokeWidth={2} />
                          <p className="text-white/60 text-sm tracking-wide">{addr.city}, {addr.state} — {addr.pincode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-1 lg:col-span-2 py-32 glass-card rounded-[3rem] border-white/5 flex flex-col items-center justify-center gap-6 text-center">
                 <div className="w-24 h-24 rounded-full glass-card border-[#D4AF37]/10 flex items-center justify-center text-[#222]">
                   <MapPin size={40} strokeWidth={1} />
                 </div>
                 <div className="space-y-2">
                    <p className="text-white/40 text-[11px] uppercase tracking-[0.5em] font-black italic">No Registered Addresses</p>
                    <p className="text-[#444] text-xs font-medium max-w-sm mx-auto tracking-widest leading-relaxed">Your delivery destinations have not yet been added to your profile vault.</p>
                 </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Editor Modal Popover */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl glass-card rounded-[3rem] border-[#D4AF37]/20 p-6 md:p-10 shadow-2xl overflow-hidden my-auto"
            >
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#D4AF37]/5 blur-[100px] rounded-full"></div>
              
              <div className="relative space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-display text-white uppercase tracking-tight">
                    {editingAddress.id ? "Edit" : "New"} <span className="gold-gradient-text italic font-cormorant font-medium lowercase">Address</span>
                  </h3>
                  <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 text-[#444] hover:text-white transition-all">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Left Side: Form Fields */}
                  <div className="space-y-6">
                    {/* Tag Selection */}
                    <div className="space-y-4">
                      <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-black italic ml-1">Label</p>
                      <div className="flex flex-wrap gap-2">
                        {TAG_OPTIONS.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => setEditingAddress({ ...editingAddress, label: tag.id })}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-[9px] uppercase font-bold tracking-widest ${
                              editingAddress.label === tag.id 
                                ? "bg-[#D4AF37] border-[#D4AF37] text-black" 
                                : "bg-white/[0.02] border-white/10 text-[#666] hover:border-[#D4AF37]/40"
                            }`}
                          >
                            <tag.icon size={12} />
                            {tag.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <input 
                        placeholder="Street & Area"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-[#333] focus:border-[#D4AF37]/50 transition-all outline-none"
                        value={editingAddress.street || ""}
                        onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-[#555] uppercase tracking-[0.3em] font-black ml-1">City</label>
                          <input 
                            placeholder="Mumbai"
                            className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 h-12 text-sm text-white placeholder:text-[#333] focus:border-[#D4AF37]/50 transition-all outline-none"
                            value={editingAddress.city || ""}
                            onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-[#555] uppercase tracking-[0.3em] font-black ml-1">Pincode</label>
                          <input 
                            placeholder="400001"
                            className={`w-full bg-white/[0.02] border rounded-xl px-4 h-12 text-sm text-white placeholder:text-[#333] transition-all outline-none ${
                              pincodeStatus === 'valid' ? 'border-green-500/30 focus:border-green-500/50' : 
                              pincodeStatus === 'invalid' ? 'border-red-500/30 focus:border-red-500/50' : 
                              'border-white/10 focus:border-[#D4AF37]/50'
                            }`}
                            value={editingAddress.pincode || ""}
                            maxLength={6}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                              setEditingAddress({ ...editingAddress, pincode: val });
                              if (val.length === 6) validatePincode(val);
                              else { setPincodeStatus("idle"); setPincodeInfo(""); }
                            }}
                          />
                          {pincodeStatus === "checking" && <p className="text-[9px] text-[#D4AF37] tracking-widest uppercase mt-1">Verifying...</p>}
                          {pincodeStatus === "valid" && <p className="text-[9px] text-green-400 tracking-widest uppercase mt-1">✓ {pincodeInfo}</p>}
                          {pincodeStatus === "invalid" && <p className="text-[9px] text-red-500 tracking-widest uppercase mt-1">⚠ Invalid pincode</p>}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] text-[#555] uppercase tracking-[0.3em] font-black ml-1">State / UT</label>
                        <div className="relative">
                          <select 
                            className="w-full h-12 bg-white/[0.02] border border-white/10 rounded-xl px-4 pr-8 text-sm text-white focus:border-[#D4AF37]/50 transition-all outline-none appearance-none cursor-pointer"
                            value={editingAddress.state || ""}
                            onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })}
                          >
                            <option value="" className="bg-[#111]">Select state...</option>
                            {STATES_INDIA.map(s => (
                              <option key={s} value={s} className="bg-[#111]">{s}</option>
                            ))}
                          </select>
                          <ChevronLeft size={12} className="-rotate-90 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#444]" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] text-[#555] uppercase tracking-[0.3em] font-black ml-1">Phone Number</label>
                        <div className="flex gap-2">
                          <span className="bg-white/[0.02] border border-white/10 rounded-xl px-4 h-12 flex items-center text-[#555] text-sm font-bold shrink-0">+91</span>
                          <input 
                            placeholder="9999988888"
                            inputMode="numeric"
                            maxLength={10}
                            className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl px-4 h-12 text-sm text-white placeholder:text-[#333] focus:border-[#D4AF37]/50 transition-all outline-none tracking-widest"
                            value={editingAddress.phone?.replace('+91','') || ""}
                            onChange={(e) => setEditingAddress({ ...editingAddress, phone: e.target.value.replace(/\D/g,'').slice(0,10) })}
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black text-[11px] uppercase font-black tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                          {editingAddress.id ? "Updating..." : "Saving..."}
                        </>
                      ) : (
                        "Confirm & Register"
                      )}
                    </button>
                  </div>

                  {/* Right Side: Map Integration */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-black italic ml-1">Identify Sanctuary</p>
                       <button 
                         type="button"
                         onClick={requestLocation}
                         className="flex items-center gap-2 text-[8px] uppercase font-black text-white/40 hover:text-[#D4AF37] transition-colors"
                       >
                         <Navigation size={12} />
                         Use GPS
                       </button>
                    </div>
                    
                    <div className="h-full min-h-[300px] rounded-[2rem] overflow-hidden border border-white/5 relative glass-card shadow-inner">
                       <MapContainer center={mapCenter} zoom={13} minZoom={10} style={{ height: '100%', width: '100%' }}>
                         <TileLayer
                           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                         />
                         <ChangeView center={mapCenter} />
                         <LocationMarker 
                           position={editingAddress.latitude && editingAddress.longitude ? [editingAddress.latitude, editingAddress.longitude] : null} 
                           setPosition={setManualPosition} 
                         />
                       </MapContainer>
                        {!editingAddress.latitude && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center text-center p-6 pointer-events-none transition-opacity duration-500">
                             <div className="flex flex-col items-center gap-4">
                                <div className="w-8 h-8 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                                <p className="text-[9px] uppercase tracking-[0.3em] text-white/60 font-black">Locating Sanctuary...</p>
                             </div>
                          </div>
                        )}
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={isDeleting !== null}
        onClose={() => setIsDeleting(null)}
        onConfirm={() => isDeleting && handleDelete(isDeleting)}
        title="Remove Address"
        message="Are you sure you wish to remove this saved location? This action cannot be undone."
        confirmText="Remove Address"
        cancelText="Keep Address"
        variant="danger"
        isLoading={isSaving}
        loadingText="Deleting..."
      />
    </div>
  );
}
