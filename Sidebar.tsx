
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  BarChart,
  Calendar,
  CreditCard
} from 'lucide-react';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: 'Membros', path: '/members', icon: <Users className="h-5 w-5" /> },
  { name: 'Frequência', path: '/attendance', icon: <BarChart className="h-5 w-5" /> },
  { name: 'Agenda', path: '/agenda', icon: <Calendar className="h-5 w-5" /> },  // <-- aqui
  { name: 'Pagamentos', path: '/payments', icon: <CreditCard className="h-5 w-5" /> },
  { name: 'Configurações', path: '/settings', icon: <Settings className="h-5 w-5" /> },
]
  return (
    <div 
      className={cn(
        "h-screen bg-white text-fitpro-darkGray border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn(
        "flex items-center p-4 border-b border-gray-200",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center">
            <span className="text-xl font-bold text-fitpro-purple">FitPro</span>
            <span className="text-xl font-bold ml-1">Gym</span>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center">
            <span className="text-xl font-bold text-fitpro-purple">FP</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1 rounded-md hover:bg-gray-100",
            collapsed ? "ml-0" : "ml-2"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all",
                isActive
                  ? "bg-fitpro-lightPurple text-fitpro-darkPurple"
                  : "text-gray-600 hover:bg-gray-100 hover:text-fitpro-darkPurple",
                collapsed ? "justify-center" : ""
              )}
            >
              <div>{item.icon}</div>
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handleLogout}
          className={cn(
            "w-full justify-center text-gray-600 hover:text-fitpro-darkPurple hover:bg-fitpro-lightPurple",
            collapsed ? "px-2" : ""
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
