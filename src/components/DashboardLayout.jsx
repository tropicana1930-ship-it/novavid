import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Video, 
  Image as ImageIcon, 
  Music, 
  Settings, 
  LogOut, 
  Zap, 
  Menu,
  PlusCircle,
  CreditCard
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Video Studio', icon: Video, path: '/video-creator' },
    { label: 'Image Editor', icon: ImageIcon, path: '/image-editor' },
    { label: 'Audio Studio', icon: Music, path: '/audio-studio' },
    { label: 'My Projects', icon: PlusCircle, path: '/projects' }, // Reutilizando icono para proyectos
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 text-white">
      <div className="p-6 border-b border-gray-800 flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="font-bold text-lg">N</span>
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          NovaVid
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 mb-1 ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* MONITOR DE CRÉDITOS (MÓVIL / SIDEBAR) */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800/50 rounded-xl p-4 mb-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Créditos Disponibles</span>
                <Zap className={`w-4 h-4 ${user?.credits > 10 ? 'text-yellow-400' : 'text-red-500 animate-pulse'}`} />
            </div>
            <div className="text-2xl font-bold text-white mb-2">
                {user?.credits || 0}
            </div>
            <Link to="/pricing">
                <Button size="sm" className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white border-0 h-8 text-xs">
                    <PlusCircle className="w-3 h-3 mr-1" /> Recargar
                </Button>
            </Link>
        </div>

        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{user?.plan || 'Free'} Plan</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar Desktop */}
      <div className="hidden md:block w-64 fixed h-full z-50">
        <SidebarContent />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white">N</span>
            </div>
            <span className="font-bold text-white">NovaVid</span>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Monitor Créditos Mini (Móvil) */}
            <Link to="/pricing" className="flex items-center gap-1 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-xs font-bold text-white">{user?.credits || 0}</span>
            </Link>

            <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                <Menu className="w-6 h-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-gray-900 border-gray-800">
                <SidebarContent />
            </SheetContent>
            </Sheet>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 mt-16 md:mt-0 overflow-y-auto h-screen bg-black">
        <div className="max-w-7xl mx-auto">
            {/* Header Desktop (Opcional, para mostrar créditos arriba también) */}
            <div className="hidden md:flex justify-end mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/pricing">
                        <div className="flex items-center gap-2 bg-gray-900/80 px-4 py-2 rounded-full border border-gray-800 hover:border-yellow-500/50 transition-colors cursor-pointer group">
                            <div className="bg-yellow-500/20 p-1.5 rounded-full group-hover:bg-yellow-500/30 transition-colors">
                                <Zap className="w-4 h-4 text-yellow-400" />
                            </div>
                            <div className="flex flex-col items-end leading-none">
                                <span className="text-sm font-bold text-white">{user?.credits || 0}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Créditos</span>
                            </div>
                            <Button size="icon" variant="ghost" className="h-6 w-6 ml-2 text-yellow-500 hover:text-yellow-400">
                                <PlusCircle className="w-4 h-4" />
                            </Button>
                        </div>
                    </Link>
                </div>
            </div>
            
            {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;