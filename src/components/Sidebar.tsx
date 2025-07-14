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
        "h-screen bg-white dark:bg-fitpro-darkBg text-fitpro-darkGray dark:text-fitpro-darkText border-r border-gray-200 dark:border-fitpro-darkBorder flex flex-col overflow-hidden shadow-lg",
        "transition-width duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
      aria-expanded={!collapsed}
    >
      {/* Cabeçalho da sidebar */}
      <div className={cn(
        "flex items-center p-4 border-b border-gray-200 dark:border-fitpro-darkBorder",
        collapsed ? "justify-center" : "justify-between"
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
          <div className="text-2xl font-extrabold text-fitpro-purple dark:text-fitpro-lightPurple select-none">FP</div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir menu lateral" : "Colapsar menu lateral"}
          aria-pressed={!collapsed}
          className={cn(
            "p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-fitpro-purple",
            collapsed ? "ml-0" : "ml-2"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-fitpro-purple dark:text-fitpro-lightPurple" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-fitpro-purple dark:text-fitpro-lightPurple" />
          )}
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex-1 py-4 overflow-y-auto" aria-label="Menu principal">
        <ul className="px-2 space-y-1">
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
                      ? "bg-fitpro-lightPurple dark:bg-fitpro-darkPurple text-fitpro-darkPurple dark:text-fitpro-lightPurple font-semibold shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-fitpro-purple dark:hover:text-fitpro-lightPurple"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  tabIndex={0}
                  aria-describedby={collapsed ? tooltipId : undefined}
                >
                  <span className="flex-shrink-0 mr-3 text-fitpro-purple dark:text-fitpro-lightPurple">
                    {icon}
                  </span>
                  {!collapsed && name}
                </NavLink>
                {collapsed && (
                  <span
                    role="tooltip"
                    id={tooltipId}
                    className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 whitespace-nowrap rounded bg-gray-700 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
      <div className="p-4 border-t border-gray-200 dark:border-fitpro-darkBorder">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-center text-fitpro-purple dark:text-fitpro-lightPurple hover:bg-gray-100 dark:hover:bg-gray-700"
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
