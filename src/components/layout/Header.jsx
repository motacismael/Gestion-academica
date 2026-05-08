import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = ({ setIsOpen }) => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/students': return 'Gestión de Estudiantes';
      case '/grades': return 'Calificaciones';
      default: return '';
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className="text-slate-500 hover:text-slate-700 lg:hidden"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-semibold text-slate-800 hidden sm:block">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="hidden text-right text-sm sm:block">
            <p className="font-medium text-slate-700">Administrador</p>
            <p className="text-slate-500 text-xs">admin@academicsys.com</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-100 text-navy-700">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
