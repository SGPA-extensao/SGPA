import { ReactNode, useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const LoadingSpinner = () => (
  <div
    role="status"
    aria-live="polite"
    aria-label="Carregando conteúdo"
    className="min-h-screen flex items-center justify-center bg-fitpro-lightGray dark:bg-fitpro-darkBg"
  >
    <svg
      className="animate-spin h-12 w-12 text-fitpro-purple dark:text-fitpro-lightPurple"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  </div>
);

const Layout = ({ children }: LayoutProps) => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Estado para modo escuro
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    document.getElementById('main-content')?.focus();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-fitpro-lightGray dark:bg-gray-900 text-fitpro-darkGray dark:text-fitpro-darkText">
      {/* Sidebar desktop fixo */}
      <aside
        ref={sidebarRef}
        id="sidebar"
        aria-label="Navegação lateral"
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-fitpro-lightGray dark:bg-gray-900 border-r border-gray-200 dark:border-fitpro-darkBorder
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar />
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden"
          aria-hidden="true"
          onClick={() => {
            setSidebarOpen(false);
            buttonRef.current?.focus();
          }}
        />
      )}

      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 min-h-screen md:ml-64 bg-fitpro-lightGray dark:bg-gray-900">
        {/* Header mobile */}
        <header
          role="banner"
          className="md:hidden flex items-center justify-between bg-white dark:bg-fitpro-darkBg border-b border-gray-200 dark:border-fitpro-darkBorder px-4 py-3 shadow-sm"
        >
          <button
            ref={buttonRef}
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu lateral"
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
            className="text-fitpro-purple dark:text-fitpro-lightPurple hover:text-fitpro-darkPurple dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-fitpro-purple rounded-md"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="ml-4 text-lg font-semibold select-none">FitPro Gym</h1>
          {/* Toggle modo escuro */}
          <button
            aria-label="Alternar modo claro/escuro"
            title="Alternar modo claro/escuro"
            onClick={() => setDarkMode(!darkMode)}
            className="ml-2 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-fitpro-purple hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? (
              <svg
                className="w-6 h-6 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM15.657 4.343a1 1 0 011.414 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707zM18 10a1 1 0 011 1h-1a1 1 0 110-2h1a1 1 0 01-1 1zM15.657 15.657a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM10 18a1 1 0 11-2 0v-1a1 1 0 112 0v1zM4.343 15.657a1 1 0 11-1.414-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707zM2 10a1 1 0 110-2h1a1 1 0 110 2H2zM4.343 4.343a1 1 0 011.414-1.414l.707.707A1 1 0 115.05 5.05l-.707-.707z" />
                <circle cx="10" cy="10" r="3" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.293 13.293A8 8 0 116.707 2.707a7 7 0 0010.586 10.586z" />
              </svg>
            )}
          </button>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-6 overflow-y-auto focus:outline-none bg-fitpro-lightGray dark:bg-gray-900"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
