import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  X, 
  Building2, 
  Users, 
  UserCheck,
  UserX,
  UserMinus
} from 'lucide-react';

const EmployeeSearch = ({ 
  onSearch, 
  onFilterChange, 
  departments = [], 
  filters = {},
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [activeFilters, setActiveFilters] = useState({
    departmentId: filters.departmentId || '',
    status: filters.status || 'active'
  });

  // Update search term when filters prop changes
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  // Update active filters when filters prop changes
  useEffect(() => {
    setActiveFilters({
      departmentId: filters.departmentId || '',
      status: filters.status || 'active'
    });
  }, [filters.departmentId, filters.status]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterSelect = (filterType, value) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: value
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilter = (filterType) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: filterType === 'status' ? 'active' : ''
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const resetFilters = {
      departmentId: '',
      status: 'active'
    };
    setActiveFilters(resetFilters);
    setSearchTerm('');
    onSearch('');
    onFilterChange(resetFilters);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-4 w-4" />;
      case 'inactive':
        return <UserMinus className="h-4 w-4" />;
      case 'terminated':
        return <UserX className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.departmentId) count++;
    if (activeFilters.status && activeFilters.status !== 'active') count++;
    if (searchTerm) count++;
    return count;
  };

  const selectedDepartment = departments.find(dept => dept.id === parseInt(activeFilters.departmentId));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search employees by name, email, or employee ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onSearch('');
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="relative hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleFilterSelect('departmentId', '')}>
              <Building2 className="h-4 w-4 mr-2" />
              All Departments
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {departments.map((department) => (
              <DropdownMenuItem
                key={department.id}
                onClick={() => handleFilterSelect('departmentId', department.id)}
                className={activeFilters.departmentId === department.id ? 'bg-blue-50' : ''}
              >
                <Building2 className="h-4 w-4 mr-2" />
                {department.name}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            {['active', 'inactive', 'terminated'].map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => handleFilterSelect('status', status)}
                className={activeFilters.status === status ? 'bg-blue-50' : ''}
              >
                {getStatusIcon(status)}
                <span className="ml-2 capitalize">{status}</span>
              </DropdownMenuItem>
            ))}
            
            {getActiveFilterCount() > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearAllFilters} className="text-red-600">
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </form>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              Search: "{searchTerm}"
              <button
                onClick={() => {
                  setSearchTerm('');
                  onSearch('');
                }}
                className="ml-1 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {selectedDepartment && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
              <Building2 className="h-3 w-3 mr-1" />
              {selectedDepartment.name}
              <button
                onClick={() => clearFilter('departmentId')}
                className="ml-1 hover:text-purple-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {activeFilters.status && activeFilters.status !== 'active' && (
            <Badge variant="secondary" className={getStatusColor(activeFilters.status)}>
              {getStatusIcon(activeFilters.status)}
              <span className="ml-1 capitalize">{activeFilters.status}</span>
              <button
                onClick={() => clearFilter('status')}
                className="ml-1 hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeSearch;
