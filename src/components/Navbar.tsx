import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Linkedin, Layout, Calendar, Clock, Settings, Menu, X } from 'lucide-react';
import logo from './logo.png';

interface NavbarProps {
  user: any | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const fallbackUrl = 'https://via.placeholder.com/100';
  
  
  const navItems = [
    { path: '/create', label: 'Create Post', icon: Linkedin },
    { path: '/scheduled', label: 'Scheduled', icon: Calendar },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
          </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center">
            {user ? (
              <>
                <div className="flex space-x-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          location.pathname === item.path
                            ? 'text-[#0A66C2] bg-blue-50'
                            : 'text-gray-600 hover:text-[#0A66C2] hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 mr-2" />
                          {item.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="ml-6 flex items-center">
                  <div className="flex items-center">
                    <div className="ml-3 relative">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full object-cover"
                          src={user?.picture || fallbackUrl}
                          alt="User"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">{user?.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link
                to="/"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0A66C2] hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-[#0A66C2] hover:bg-blue-50 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {user ? (
              <>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`block px-3 py-2 text-base font-medium ${
                        location.pathname === item.path
                          ? 'text-[#0A66C2] bg-blue-50'
                          : 'text-gray-600 hover:text-[#0A66C2] hover:bg-blue-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.picture || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'}
                        alt="User"
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.name}</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link
                to="/"
                className="block px-3 py-2 text-base font-medium text-white bg-[#0A66C2] hover:bg-blue-700 rounded-md mx-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;