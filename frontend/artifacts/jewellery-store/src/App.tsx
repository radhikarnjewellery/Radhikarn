import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider, useStore } from "@/context/StoreContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { useState, useEffect, useRef } from "react";

// Pages
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderTracking from "@/pages/OrderTracking";
import About from "@/pages/About";
import Wishlist from "@/pages/Wishlist";
import Login from "@/pages/Login";
import Account from "@/pages/Account";
import Addresses from "@/pages/Addresses";
import MyOrders from "@/pages/MyOrders";
import OrderDetail from "@/pages/OrderDetail";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function NotificationBanner() {
  const [notifications, setNotifications] = useState<{ _id: string; text: string }[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/notifications/active`)
      .then(r => r.json())
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  if (notifications.length === 0) return null;

  const items = [...notifications, ...notifications];

  return (
    <div className="fixed top-[62px] md:top-[72px] left-0 right-0 z-[99] bg-[#0a0a0a] border-b border-[#D4AF37]/15 py-2.5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((n, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-10 text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-[#D4AF37]">
            <span className="w-1 h-1 rounded-full bg-[#D4AF37] shrink-0 opacity-60" />
            {n.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function sendVisit(payload: any) {
  fetch(`${import.meta.env.VITE_API_URL}/api/visitors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

function Router() {
  const { user, loading } = useStore();
  const hasSent = useRef(false);

  useEffect(() => {
    // Wait until store has resolved user from localStorage
    if (loading) return;
    // Only send once per page load
    if (hasSent.current) return;
    hasSent.current = true;

    const payload: any = {};
    if (user) {
      payload.userEmail = user.email.toLowerCase().trim();
      payload.userName = user.name;
    }

    // Try GPS only if already granted (no prompt)
    const doSend = (lat?: number, lng?: number) => {
      if (lat) payload.lat = lat;
      if (lng) payload.lng = lng;
      sendVisit(payload);
    };

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(perm => {
        if (perm.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            pos => doSend(pos.coords.latitude, pos.coords.longitude),
            () => doSend()
          );
        } else {
          doSend();
        }
      }).catch(() => doSend());
    } else {
      doSend();
    }
  }, [loading, user?.email]);

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] overflow-x-hidden">
      <ScrollToTop />
      <Header />
      <NotificationBanner />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/track" component={OrderTracking} />
          <Route path="/about" component={About} />
          <Route path="/wishlist" component={Wishlist} />
          <Route path="/login" component={Login} />
          <Route path="/account" component={Account} />
          <Route path="/addresses" component={Addresses} />
          <Route path="/orders" component={MyOrders} />
          <Route path="/orders/:id" component={OrderDetail} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster position="top-center" />
        </TooltipProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}

export default App;
