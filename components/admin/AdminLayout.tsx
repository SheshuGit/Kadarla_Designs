import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  Home, 
  ShoppingBag, 
  Package, 
  CheckCircle, 
  PlusCircle, 
  CreditCard, 
  BarChart3, 
  MessageCircle,
  Menu,
  X,
  LogOut,
  Boxes
} from 'lucide-react';
import logo from '../../images/anuja_logo.png';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ordersSubmenuOpen, setOrdersSubmenuOpen] = useState(true);

  const menuItems = [
    {
      name: 'Home',
      icon: Home,
      path: '/admin',
      exact: true,
    },
    {
      name: 'My Orders',
      icon: ShoppingBag,
      path: '/admin/orders',
      submenu: [
        { name: 'Orders Received', path: '/admin/orders/received', icon: Package },
        { name: 'Completed Orders', path: '/admin/orders/completed', icon: CheckCircle },
      ],
    },
    {
      name: 'Items',
      icon: Boxes,
      path: '/admin/items',
    },
    {
      name: 'Add Item',
      icon: PlusCircle,
      path: '/admin/add-item',
    },
    {
      name: 'Payments',
      icon: CreditCard,
      path: '/admin/payments',
    },
    {
      name: 'Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
    },
    {
      name: 'Chat',
      icon: MessageCircle,
      path: '/admin/chat',
    },
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-pastel-blue/20">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-2xl transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-100">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Logo"
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-100"
              />
              <div>
                <h2 className="text-lg font-serif font-bold text-emerald-900">Admin Panel</h2>
                <p className="text-xs text-emerald-600">Kadarla Designs</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            const hasSubmenu = item.submenu && item.submenu.length > 0;

            return (
              <div key={item.name}>
                <Link
                  to={hasSubmenu ? (item.submenu?.[0]?.path || item.path) : item.path}
                  onClick={(e) => {
                    if (hasSubmenu && sidebarOpen) {
                      e.preventDefault();
                      const newState = !ordersSubmenuOpen;
                      setOrdersSubmenuOpen(newState);
                      if (newState && item.submenu?.[0]?.path) {
                        // Navigate to first submenu item when opening
                        navigate(item.submenu[0].path);
                      }
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span className="font-medium">{item.name}</span>}
                </Link>

                {/* Submenu */}
                {hasSubmenu && sidebarOpen && ordersSubmenuOpen && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const subActive = isActive(subItem.path);
                      return (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                            subActive
                              ? 'bg-emerald-100 text-emerald-900 font-medium'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <SubIcon size={16} />
                          <span className="text-sm">{subItem.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-100 bg-white">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

