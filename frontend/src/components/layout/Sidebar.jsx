import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  DollarSign,
  Target,
  Brain,
  Sparkles,
  MessageCircle,
  MessageSquare,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Sidebar = ({ isOpen, onClose, onToggle }) => {
  const { user } = useAuthContext();

  // State for expandable menu items (persisted in localStorage)
  const [expandedMenus, setExpandedMenus] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar-expanded-menus');
      return saved ? JSON.parse(saved) : { aiFeatures: false };
    } catch {
      return { aiFeatures: false };
    }
  });

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-expanded-menus', JSON.stringify(expandedMenus));
  }, [expandedMenus]);

  // Toggle menu expansion
  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  /**
   * Get Smart Reports href based on user role
   */
  const getSmartReportsHref = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/smart-reports';
      case 'manager':
        return '/manager/smart-reports';
      default:
        return '/smart-reports';
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'employee']
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: Users,
      roles: ['admin']
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: Clock,
      roles: ['admin', 'manager', 'employee']
    },
    {
      name: 'Leave',
      href: '/leave',
      icon: Calendar,
      roles: ['admin', 'manager', 'employee']
    },
    {
      name: 'Payroll',
      href: '/payroll',
      icon: DollarSign,
      roles: ['admin', 'employee']
    },
    {
      name: 'Performance',
      href: '/performance',
      icon: Target,
      roles: ['admin', 'manager', 'employee']
    },

    {
      name: 'AI Chatbot',
      href: '/ai-chatbot',
      icon: MessageCircle,
      roles: ['employee'],
      badge: 'AI',
      description: 'Chat with Shubh, your HR assistant'
    },
    {
      name: 'AI Features',
      icon: Brain,
      roles: ['admin', 'manager'],
      badge: 'AI',
      expandable: true,
      menuKey: 'aiFeatures',
      subItems: [
        {
          name: 'Smart Feedback',
          href: '/ai-features/smart-feedback',
          icon: MessageSquare,
          roles: ['manager'],
          description: 'AI-powered employee feedback generation'
        },
        {
          name: 'Attrition Predictor',
          href: '/ai-features/attrition',
          icon: TrendingUp,
          roles: ['admin'],
          description: 'AI-powered employee attrition risk analysis'
        },
        {
          name: 'Anomaly Detection',
          href: '/ai-features/anomaly-detection',
          icon: AlertTriangle,
          roles: ['admin'],
          description: 'AI-powered attendance anomaly detection'
        },
        {
          name: 'Resume Parser',
          href: '/ai-features/resume-parser',
          icon: FileText,
          roles: ['admin', 'manager'],
          description: 'AI-powered resume parsing and employee onboarding'
        },
        {
          name: 'Smart Reports',
          href: '/ai-features/smart-reports',
          icon: BarChart3,
          roles: ['admin', 'manager'],
          description: 'AI-powered intelligent reporting'
        }
      ]
    }
  ];

  // Filter navigation items based on user role
  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(user?.role || 'employee')
  );

  return (
    <>
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full bg-card border-r border-border transition-all duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-16"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              {!isOpen && (
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">HR</span>
                </div>
              )}
              {isOpen && (
                <>
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">HR</span>
                  </div>
                  <span className="font-bold text-foreground">HRMS</span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-1">
              {/* Toggle button for desktop */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="hidden lg:flex hover:bg-accent"
                title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <ChevronLeft className={`h-4 w-4 transition-transform duration-200 ${isOpen ? '' : 'rotate-180'}`} />
              </Button>

              {/* Close button for mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;

              // Handle expandable menu items
              if (item.expandable) {
                const isExpanded = expandedMenus[item.menuKey];
                const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

                return (
                  <div key={item.name}>
                    {/* Main expandable menu item */}
                    <button
                      onClick={() => {
                        if (isOpen) {
                          toggleMenu(item.menuKey);
                        }
                      }}
                      className={cn(
                        "w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-accent hover:text-accent-foreground group",
                        "text-muted-foreground hover:text-foreground",
                        !isOpen && "lg:justify-center"
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isOpen ? "mr-3" : "lg:mr-0"
                      )} />
                      {isOpen && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="truncate">{item.name}</span>
                          <div className="flex items-center space-x-2">
                            {item.badge && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                                {item.badge}
                              </span>
                            )}
                            <ChevronIcon className="h-4 w-4 transition-transform duration-300" />
                          </div>
                        </div>
                      )}

                      {/* Tooltip for collapsed sidebar */}
                      {!isOpen && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden lg:block">
                          {item.name}
                        </div>
                      )}
                    </button>

                    {/* Submenu items */}
                    {isOpen && isExpanded && item.subItems && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.subItems
                          .filter(subItem => subItem.roles.includes(user?.role || 'employee'))
                          .map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <NavLink
                                key={subItem.name}
                                to={subItem.href}
                                onClick={() => {
                                  // Close sidebar on mobile when navigating
                                  if (window.innerWidth < 1024) {
                                    onClose();
                                  }
                                }}
                                className={({ isActive }) =>
                                  cn(
                                    "flex items-center px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground group",
                                    isActive
                                      ? "bg-primary text-primary-foreground"
                                      : "text-muted-foreground hover:text-foreground"
                                  )
                                }
                              >
                                <SubIcon className="h-4 w-4 flex-shrink-0 mr-2" />
                                <div className="flex items-center justify-between flex-1 min-w-0">
                                  <span className="truncate">{subItem.name}</span>
                                  {subItem.badge && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </div>
                              </NavLink>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              }

              // Handle regular menu items
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    // Close sidebar on mobile when navigating
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground group",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                      !isOpen && "lg:justify-center"
                    )
                  }
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isOpen ? "mr-3" : "lg:mr-0"
                  )} />
                  {isOpen && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tooltip for collapsed sidebar */}
                  {!isOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden lg:block">
                      {item.name}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className={cn(
              "flex items-center",
              isOpen ? "space-x-3" : "justify-center"
            )}>
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role || 'Role'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
