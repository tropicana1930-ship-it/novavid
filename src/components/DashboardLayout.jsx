import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Sparkles, 
  LayoutDashboard, 
  Video, 
  Image, 
  Music, 
  FolderOpen, 
  Settings, 
  LogOut,
  CreditCard
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/video-creator', icon: Video, label: 'Video Creator' },
    { path: '/image-editor', icon: Image, label: 'Image Editor' },
    { path: '/audio-studio', icon: Music, label: 'Audio Studio' },
    { path: '/projects', icon: FolderOpen, label: 'Projects' },
    { path: '/pricing', icon: CreditCard, label: 'Upgrade' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950">
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-white">NovaVid</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              <div className="text-sm text-gray-400">Credits</div>
              <div className="text-lg font-bold text-blue-400">{user.credits}</div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="border-gray-700 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 border-r border-gray-800 bg-gray-950/50 min-h-screen p-4 hidden md:block">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;