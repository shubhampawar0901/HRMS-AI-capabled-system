# 🚀 HRMS UI Quick Reference Guide

## 📋 **Essential Classes for Fast Development**

### **🎨 Colors (Use CSS Variables)**
```jsx
// Primary colors
className="bg-primary text-primary-foreground"
className="bg-secondary text-secondary-foreground"

// Role-based colors
className="bg-hrms-admin text-white"      // Red for admin
className="bg-hrms-manager text-white"    // Orange for manager  
className="bg-hrms-employee text-white"   // Green for employee
className="bg-hrms-ai text-white"         // Purple for AI

// Status colors
className="text-success"    // Green
className="text-warning"    // Amber
className="text-error"      // Red
className="text-info"       // Blue
```

### **🔤 Typography (Performance Optimized)**
```jsx
// Headings
className="text-heading-xl"    // 36px, bold - Page titles
className="text-heading-lg"    // 30px, semibold - Section titles
className="text-heading-md"    // 24px, semibold - Subsections
className="text-heading-sm"    // 20px, semibold - Card titles

// Body text
className="text-body-lg"       // 18px - Important content
className="text-body-md"       // 16px - Regular content
className="text-body-sm"       // 14px - Secondary content
className="text-body-xs"       // 12px - Captions

// Special
className="text-label"         // 14px, medium - Form labels
className="text-caption"       // 12px - Helper text
```

### **📦 Cards (Smooth Animations)**
```jsx
// Basic card
<div className="hrms-card">Content</div>

// Interactive card with hover effects
<div className="hrms-card-interactive">Hover me!</div>

// Gradient cards
<div className="hrms-card hrms-gradient-primary">Primary theme</div>
<div className="hrms-card hrms-gradient-admin">Admin theme</div>
```

### **🎯 Buttons (Role-Based)**
```jsx
// ShadCN Button with HRMS variants
<Button variant="admin">Admin Action</Button>
<Button variant="manager">Manager Action</Button>
<Button variant="employee">Employee Action</Button>
<Button variant="ai">AI Feature</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>
```

### **🏷️ Status Badges**
```jsx
// Status badges
<span className="hrms-status-active">Active</span>
<span className="hrms-status-inactive">Inactive</span>
<span className="hrms-status-pending">Pending</span>
<span className="hrms-status-info">Info</span>

// Role badges
<span className="hrms-role-admin">Admin</span>
<span className="hrms-role-manager">Manager</span>
<span className="hrms-role-employee">Employee</span>
```

### **📝 Forms (Consistent Styling)**
```jsx
// Form container
<div className="hrms-form-container">
  <label className="text-label">Field Label</label>
  <input className="hrms-input focus-ring" />
</div>

// Focus states
className="focus-ring"           // Default focus
className="focus-ring-admin"     // Admin focus (red)
className="focus-ring-manager"   // Manager focus (orange)
className="focus-ring-employee"  // Employee focus (green)
```

### **📊 Tables (Responsive)**
```jsx
<div className="hrms-table-container">
  <table className="hrms-table">
    <thead>
      <tr>
        <th>Header</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

### **⚡ Loading States**
```jsx
// Skeleton loading
<div className="hrms-skeleton h-4 w-3/4"></div>

// Shimmer effect
<div className="hrms-shimmer h-20 bg-muted rounded"></div>

// Pulse loading
<div className="hrms-loading h-8 w-24"></div>
```

### **🎭 Animations (60fps Optimized)**
```jsx
// Entrance animations
className="animate-fade-in-up"      // Fade in from bottom
className="animate-slide-in-right"  // Slide in from right
className="animate-slide-in-left"   // Slide in from left
className="animate-bounce-in"       // Bounce entrance
className="animate-scale-in"        // Scale entrance

// Hover effects
className="scale-hover-sm"          // 2% scale on hover
className="scale-hover-md"          // 5% scale on hover
className="scale-hover-lg"          // 8% scale on hover
```

### **📐 Layout Grids**
```jsx
// Dashboard grid (responsive)
<div className="hrms-dashboard-grid">
  <div className="hrms-card">Metric 1</div>
  <div className="hrms-card">Metric 2</div>
</div>

// Content grid
<div className="hrms-content-grid">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

## 🎯 **Common Patterns**

### **Dashboard Metric Card**
```jsx
<div className="hrms-card text-center">
  <h3 className="text-heading-sm text-primary">150</h3>
  <p className="text-body-sm text-muted-foreground">Total Employees</p>
</div>
```

### **Employee Card with Avatar**
```jsx
<div className="hrms-card-interactive">
  <div className="flex items-center space-x-3">
    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
      <span className="text-sm text-primary-foreground font-medium">JD</span>
    </div>
    <div>
      <h4 className="text-body-md font-medium">John Doe</h4>
      <p className="text-body-sm text-muted-foreground">Software Engineer</p>
    </div>
  </div>
</div>
```

### **Action Button Group**
```jsx
<div className="flex gap-2">
  <Button variant="employee">Save</Button>
  <Button variant="outline">Cancel</Button>
  <Button variant="destructive">Delete</Button>
</div>
```

### **Status Row**
```jsx
<div className="flex items-center justify-between">
  <span className="text-body-md">Employee Status</span>
  <span className="hrms-status-active">Active</span>
</div>
```

## ⚡ **Performance Tips**

### **Fast Loading Classes**
```jsx
// Use these for critical above-the-fold content
className="performance-optimized"  // GPU acceleration
className="hrms-transition"        // Optimized transitions
```

### **Responsive Images**
```jsx
<img 
  className="w-full h-auto object-cover rounded-lg" 
  loading="lazy"
  alt="Description"
/>
```

### **Smooth Scrolling**
```jsx
<div className="scrollbar-thin overflow-y-auto max-h-96">
  {/* Scrollable content */}
</div>
```

## 🎨 **Dark Mode Support**
All classes automatically support dark mode. No additional classes needed!

```jsx
// These work in both light and dark mode
className="bg-card text-card-foreground"
className="border-border"
className="text-muted-foreground"
```

## 📱 **Responsive Breakpoints**
```jsx
// Mobile-first approach
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

// Responsive text
className="text-responsive-xl"  // Fluid typography
```

## 🚨 **Do's and Don'ts**

### **✅ DO**
- Use CSS variables for colors: `bg-primary`
- Use HRMS component classes: `hrms-card`
- Apply smooth transitions: `hrms-transition`
- Use semantic color names: `text-success`
- Follow the spacing scale: `space-y-4`

### **❌ DON'T**
- Use hardcoded colors: `bg-red-500`
- Skip hover states on interactive elements
- Use jarring animations or transitions
- Ignore dark mode compatibility
- Use inline styles

## 🎯 **Module Agent Checklist**
- ✅ Use `hrms-card` for all card components
- ✅ Apply role-based button variants
- ✅ Include hover effects on interactive elements
- ✅ Use consistent spacing with CSS variables
- ✅ Test in both light and dark mode
- ✅ Ensure responsive design
- ✅ Add loading states for async operations
- ✅ Use semantic status badges
- ✅ Apply smooth entrance animations
- ✅ Follow the typography scale

This quick reference ensures consistent, beautiful, and performant UI across all HRMS modules!
