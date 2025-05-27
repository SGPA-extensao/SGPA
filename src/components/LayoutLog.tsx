// src/components/Layout.tsx
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar fixa */}
      <header className="fixed top-0 w-full bg-black border-b border-gray-800 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 text-lg font-bold text-white">
            <img src="/logo.png" alt="Moviment logo" className="h-6 w-6" />
            <span>Moviment</span>
          </div>
          <nav className="space-x-6 hidden md:flex items-center text-sm text-gray-300">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/sobre" className="hover:text-white transition">Sobre</Link>
            <Link to="/servicos" className="hover:text-white transition">Serviços</Link>
            <Link to="/contato" className="hover:text-white transition">Contato</Link>
            <Link to="/signup" className="bg-white text-black px-4 py-1 rounded-full hover:bg-gray-200 text-sm font-medium">
              Cadastrar-se
            </Link>
          </nav>
        </div>
      </header>

      {/* Espaço para compensar a navbar fixa */}
      <div className="h-20" />

      {/* Conteúdo principal */}
      <main className="px-4">{children}</main>
    </div>
  );
};

export default Layout;
