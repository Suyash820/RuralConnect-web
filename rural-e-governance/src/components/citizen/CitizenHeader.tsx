// src/components/citizen/CitizenHeader.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  MessageSquare, 
  Camera, 
  BookOpen, 
  Briefcase,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Settings,
  HelpCircle,
  Shield,
  Award,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function CitizenHeader() {
  const pathname = usePathname();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Dashboard', href: '/citizen/dashboard', icon: Home },
    { name: 'Complaints', href: '/citizen/complaints', icon: Camera },
    { name: 'Schemes', href: '/citizen/schemes', icon: Sparkles },
    { name: 'Learning', href: '/citizen/learning', icon: BookOpen },
    { name: 'Jobs', href: '/citizen/jobs', icon: Briefcase },
  ];

  const user = {
    name: 'Aditya Singh',
    role: 'Citizen',
    id: 'CG20240123456',
    email: 'aditya@gmail.com',
    avatar: 'AS',
    notifications: 3,
    verified: true
  };

  return (
    <header 
      className={`
        sticky top-0 z-50 transition-all duration-300
        ${scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50' 
          : 'bg-white shadow-sm border-b border-gray-100'
        }
      `}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link 
            href="/citizen/dashboard" 
            className="flex items-center space-x-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur-md opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-all group-hover:-translate-y-0.5">
                <Home className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                Grama e-Seva
              </h1>
              <div className="flex items-center">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Citizen Portal
                </span>
                {user.verified && (
                  <span className="ml-2 flex items-center text-xs text-emerald-600">
                    <Shield className="h-3 w-3 mr-0.5" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center bg-gray-50/80 backdrop-blur-sm p-1 rounded-2xl border border-gray-100">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`
                    relative flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-sm
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-white text-blue-600 shadow-md shadow-blue-500/10' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                    }
                  `}
                >
                  <link.icon className={`h-4.5 w-4.5 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors group">
              <Bell className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
              {user.notifications > 0 && (
                <span className="absolute top-2 right-2 h-5 w-5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {user.notifications}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`
                  flex items-center space-x-3 p-1.5 pr-3 rounded-xl transition-all duration-200
                  ${isProfileMenuOpen 
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 shadow-md' 
                    : 'hover:bg-gray-100 border border-transparent'
                  }
                `}
              >
                <div className="relative">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold text-sm">{user.avatar}</span>
                  </div>
                  {user.verified && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Shield className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="hidden lg:block text-left">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-500">ID: {user.id}</p>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <p className="text-xs font-medium text-blue-600">Citizen</p>
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-5">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30">
                        <span className="text-white font-bold text-lg">{user.avatar}</span>
                      </div>
                      <div className="text-white">
                        <p className="font-semibold text-lg">{user.name}</p>
                        <p className="text-sm text-white/80">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50/80 border-b border-gray-100">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Complaints</p>
                      <p className="text-lg font-bold text-gray-900">12</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Resolved</p>
                      <p className="text-lg font-bold text-emerald-600">10</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Schemes</p>
                      <p className="text-lg font-bold text-blue-600">4</p>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="p-2">
                    <Link
                      href="/citizen/profile"
                      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Profile Settings</p>
                          <p className="text-xs text-gray-500">Manage your account</p>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 -rotate-90" />
                    </Link>
                    
                    <Link
                      href="/citizen/documents"
                      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                          <Award className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">My Documents</p>
                          <p className="text-xs text-gray-500">Aadhaar, Certificates</p>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 -rotate-90" />
                    </Link>
                    
                    <Link
                      href="/citizen/support"
                      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                          <HelpCircle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Help & Support</p>
                          <p className="text-xs text-gray-500">Contact CSC center</p>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 -rotate-90" />
                    </Link>
                    
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    <Link
                      href="/"
                      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-red-50 transition-colors group"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                          <LogOut className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-red-600">Logout</p>
                          <p className="text-xs text-gray-500">End your session</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top duration-200">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-xl transition-all
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 border border-blue-100' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="font-medium">{link.name}</span>
                    {isActive && (
                      <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Active</span>
                    )}
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile User Info */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{user.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.id}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}