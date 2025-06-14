import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  Target, 
  Brain,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

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
      name: 'AI Features',
      href: '/ai-features',
      icon: Brain,
      roles: ['admin', 'manager', 'employee']
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
            {isOpen && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">HR</span>
                </div>
                <span className="font-bold text-foreground">HRMS</span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
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
                    <span className="truncate">{item.name}</span>
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
