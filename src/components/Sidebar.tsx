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
  CreditCard,
  List
} from 'lucide-react';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5 transition-colors" /> },
    { name: 'Membros', path: '/members', icon: <Users className="h-5 w-5 transition-colors" /> },
    { name: 'Agenda', path: '/agenda', icon: <Calendar className="h-5 w-5 transition-colors" /> },
    { name: 'Pagamentos', path: '/payments', icon: <CreditCard className="h-5 w-5 transition-colors" /> },
    { name: 'Treinos', path: '/trainings', icon: <List className="h-5 w-5 transition-colors" /> },
    { name: 'Configurações', path: '/settings', icon: <Settings className="h-5 w-5 transition-colors" /> },
  ];

  return (
    <div
      className={cn(
        collapsed
          ? "h-screen w-16 bg-white dark:bg-zinc-900 text-gray-800 dark:text-yellow-300 border-r border-gray-200 dark:border-zinc-800 flex flex-col overflow-hidden shadow-lg transition-colors"
          : "h-screen w-64 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-r border-gray-200 dark:border-zinc-800 flex flex-col overflow-hidden shadow-lg transition-colors",
        "transition-width duration-300 ease-in-out"
      )}
      aria-expanded={!collapsed}
    >
      {/* Cabeçalho da sidebar */}
      <div className={cn(
        collapsed
          ? "flex items-center justify-center p-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors"
          : "flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-gray-900 transition-colors"
      )}>
        {!collapsed ? (
          <div className="flex items-center select-none">
            <img
              src="/logo.png"
              alt="Logo Movimento"
              className="h-15 w-auto"
            />
          </div>

        ) : (
          <div className="text-2xl font-extrabold text-fitpro-purple dark:text-yellow-300 select-none">FP</div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir menu lateral" : "Colapsar menu lateral"}
          aria-pressed={!collapsed}
          className={cn(
            "p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-fitpro-purple transition-colors",
            collapsed
              ? "hover:bg-gray-100 dark:hover:bg-zinc-800 ml-0"
              : "hover:bg-gray-100 dark:hover:bg-gray-800 ml-2"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-fitpro-purple dark:text-yellow-300 transition-colors" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-fitpro-purple dark:text-yellow-300 transition-colors" />
          )}
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex-1 py-4 overflow-y-auto" aria-label="Menu principal">
        <ul className={cn("space-y-1", collapsed ? "px-0" : "px-2")}> 
          {navItems.map(({ name, path, icon }) => {
            const isActive = location.pathname === path;
            const tooltipId = `tooltip-${name.toLowerCase().replace(/\s+/g, '-')}`;
            return (
              <li key={path} className="relative group">
                <NavLink
                  to={path}
                  className={({ isActive: navIsActive }) => cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    navIsActive
                      ? "bg-indigo-100 dark:bg-zinc-800 text-indigo-700 dark:text-yellow-300 font-semibold shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-fitpro-purple dark:hover:text-yellow-300"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  tabIndex={0}
                  aria-describedby={collapsed ? tooltipId : undefined}
                >
                  <span className={cn(
                    "flex-shrink-0 transition-colors",
                    collapsed ? "mx-auto" : "mr-3",
                    "text-fitpro-purple dark:text-yellow-300"
                  )}>
                    {icon}
                  </span>
                  {!collapsed && name}
                </NavLink>
                {collapsed && (
                  <span
                    role="tooltip"
                    id={tooltipId}
                    className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 whitespace-nowrap rounded bg-gray-700 dark:bg-zinc-800 text-white dark:text-yellow-300 text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    {name}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className={cn(
        "p-4 border-t border-gray-200 dark:border-zinc-800 transition-colors",
        collapsed ? "bg-white dark:bg-zinc-900" : "bg-white dark:bg-gray-900"
      )}>
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center justify-center transition-colors",
            collapsed ? "text-fitpro-purple dark:text-yellow-300" : "text-fitpro-purple dark:text-yellow-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
          )}
          onClick={handleLogout}
          aria-label="Sair do sistema"
        >
          <LogOut className="mr-2 h-5 w-5" />
          {!collapsed && 'Sair'}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
