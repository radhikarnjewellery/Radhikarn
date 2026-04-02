import { Switch, Route, Redirect, useLocation } from "wouter";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import Charges from "./pages/Charges";
import Coupons from "./pages/Coupons";
import Notifications from "./pages/Notifications";
import Homepage from "./pages/Homepage";
import Users from "./pages/Users";
import Visitors from "./pages/Visitors";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!token && location !== '/login') {
      setLocation('/login');
    }
  }, [token, location]);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('admin_token', newToken);
    setLocation('/');
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('admin_token');
    setLocation('/login');
  };

  if (!token) {
    return (
      <Switch>
        <Route path="/login">
          <Login onLogin={handleLogin} />
        </Route>
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-[#F5F5F5]">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 p-8 overflow-y-auto pt-32 lg:pt-12 lg:ml-72">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/products" component={Products} />
          <Route path="/categories" component={Categories} />
          <Route path="/orders" component={Orders} />
          <Route path="/charges" component={Charges} />
          <Route path="/coupons" component={Coupons} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/homepage" component={Homepage} />
          <Route path="/users" component={Users} />
          <Route path="/visitors" component={Visitors} />
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </main>
    </div>
  );
}
