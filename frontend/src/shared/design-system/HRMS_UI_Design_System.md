# 🎨 HRMS UI Design System
*Complete design guidelines for fast-loading, beautiful, and consistent UI*

## 📋 **Design Principles**
- **Performance First**: Fast loading with optimized animations
- **Smooth Interactions**: Fluid transitions without jarring changes
- **Elegant Minimalism**: Clean, modern design with subtle depth
- **Consistent Experience**: Unified visual language across all components
- **Accessibility**: WCAG 2.1 AA compliant design

## 🔤 **Typography System**

### **Primary Font Stack**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

### **Font Weights & Usage**
```css
/* Headings */
.text-heading-xl    { font-size: 2.25rem; font-weight: 700; line-height: 1.2; }  /* 36px */
.text-heading-lg    { font-size: 1.875rem; font-weight: 600; line-height: 1.3; } /* 30px */
.text-heading-md    { font-size: 1.5rem; font-weight: 600; line-height: 1.4; }   /* 24px */
.text-heading-sm    { font-size: 1.25rem; font-weight: 600; line-height: 1.4; }  /* 20px */

/* Body Text */
.text-body-lg       { font-size: 1.125rem; font-weight: 400; line-height: 1.6; } /* 18px */
.text-body-md       { font-size: 1rem; font-weight: 400; line-height: 1.6; }     /* 16px */
.text-body-sm       { font-size: 0.875rem; font-weight: 400; line-height: 1.5; } /* 14px */
.text-body-xs       { font-size: 0.75rem; font-weight: 400; line-height: 1.5; }  /* 12px */

/* Special */
.text-label         { font-size: 0.875rem; font-weight: 500; line-height: 1.4; } /* Labels */
.text-caption       { font-size: 0.75rem; font-weight: 400; line-height: 1.4; }  /* Captions */
.text-code          { font-family: 'JetBrains Mono', 'Fira Code', monospace; }   /* Code */
```

## 🎨 **Color Palette System**

### **Primary Colors (CSS Variables)**
```css
/* Light Mode */
:root {
  /* Brand Colors */
  --primary: 221.2 83.2% 53.3%;           /* Blue #3B82F6 */
  --primary-foreground: 210 40% 98%;      /* White text on primary */
  
  /* Semantic Colors */
  --success: 142 76% 36%;                 /* Green #059669 */
  --warning: 38 92% 50%;                  /* Amber #F59E0B */
  --error: 0 84% 60%;                     /* Red #EF4444 */
  --info: 199 89% 48%;                    /* Sky #0EA5E9 */
  
  /* Neutral Colors */
  --background: 0 0% 100%;                /* Pure white */
  --foreground: 222.2 84% 4.9%;          /* Near black */
  --muted: 210 40% 96%;                   /* Light gray */
  --muted-foreground: 215.4 16.3% 46.9%; /* Medium gray */
  --border: 214.3 31.8% 91.4%;           /* Light border */
  --input: 214.3 31.8% 91.4%;            /* Input border */
  --ring: 221.2 83.2% 53.3%;             /* Focus ring */
}

/* Dark Mode */
.dark {
  --background: 222.2 84% 4.9%;          /* Dark background */
  --foreground: 210 40% 98%;             /* Light text */
  --muted: 217.2 32.6% 17.5%;            /* Dark muted */
  --muted-foreground: 215 20.2% 65.1%;   /* Light muted text */
  --border: 217.2 32.6% 17.5%;           /* Dark border */
  --input: 217.2 32.6% 17.5%;            /* Dark input */
}
```

### **HRMS Role Colors**
```css
/* Role-based color system */
--hrms-admin: 0 84% 60%;        /* Red #DC2626 */
--hrms-manager: 25 95% 53%;     /* Orange #D97706 */
--hrms-employee: 158 64% 52%;   /* Green #059669 */
--hrms-ai: 258 90% 66%;         /* Purple #8B5CF6 */

/* Role color variants */
--hrms-admin-light: 0 84% 95%;     /* Light red background */
--hrms-manager-light: 25 95% 95%;  /* Light orange background */
--hrms-employee-light: 158 64% 95%; /* Light green background */
--hrms-ai-light: 258 90% 95%;      /* Light purple background */
```

## 🌟 **Shadow System**

### **Elevation Levels**
```css
/* Subtle shadows for depth without harshness */
.shadow-xs    { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
.shadow-sm    { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
.shadow-md    { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
.shadow-lg    { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
.shadow-xl    { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }

/* Interactive shadows */
.shadow-hover { box-shadow: 0 8px 25px -8px rgb(0 0 0 / 0.15), 0 4px 12px -4px rgb(0 0 0 / 0.1); }
.shadow-focus { box-shadow: 0 0 0 3px hsl(var(--ring) / 0.2); }

/* Dark mode shadows */
.dark .shadow-sm { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3); }
.dark .shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3); }
.dark .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3); }
```

## ⚡ **Animation & Transition System**

### **Timing Functions**
```css
/* Smooth, natural easing curves */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);      /* Default smooth */
--ease-out: cubic-bezier(0, 0, 0.2, 1);           /* Deceleration */
--ease-in: cubic-bezier(0.4, 0, 1, 1);            /* Acceleration */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Subtle bounce */
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Spring effect */
```

### **Duration Standards**
```css
/* Performance-optimized durations */
--duration-fast: 150ms;     /* Micro-interactions */
--duration-normal: 200ms;   /* Standard transitions */
--duration-slow: 300ms;     /* Complex animations */
--duration-slower: 500ms;   /* Page transitions */
```

### **Core Transition Classes**
```css
/* Base transition for all interactive elements */
.hrms-transition {
  transition: all var(--duration-normal) var(--ease-in-out);
}

/* Specific property transitions */
.transition-colors { transition: color var(--duration-fast) var(--ease-in-out), 
                                background-color var(--duration-fast) var(--ease-in-out); }
.transition-transform { transition: transform var(--duration-normal) var(--ease-in-out); }
.transition-opacity { transition: opacity var(--duration-normal) var(--ease-in-out); }
.transition-shadow { transition: box-shadow var(--duration-normal) var(--ease-in-out); }
```

## 🔍 **Zoom & Scale Effects**

### **Hover Scale Effects**
```css
/* Subtle zoom effects for cards and buttons */
.scale-hover-sm:hover { transform: scale(1.02); }   /* 2% scale - cards */
.scale-hover-md:hover { transform: scale(1.05); }   /* 5% scale - buttons */
.scale-hover-lg:hover { transform: scale(1.08); }   /* 8% scale - icons */

/* Combined hover effects */
.hrms-card-interactive:hover {
  transform: scale(1.02) translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.hrms-button-interactive:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-lg);
}
```

### **Focus & Active States**
```css
/* Focus states for accessibility */
.focus-ring:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Active states */
.active-scale:active { transform: scale(0.98); }
```

## 🎭 **Component-Specific Animations**

### **Loading Animations**
```css
/* Smooth loading states */
@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

.loading-pulse { animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.loading-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}
```

### **Entrance Animations**
```css
/* Smooth page/component entrances */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in-up { animation: fade-in-up 0.3s var(--ease-out); }
.animate-slide-in-right { animation: slide-in-right 0.3s var(--ease-out); }
```

## 📐 **Spacing & Layout System**

### **Consistent Spacing Scale**
```css
/* 4px base unit system */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### **Border Radius System**
```css
/* Consistent rounded corners */
--radius-sm: 0.25rem;   /* 4px - small elements */
--radius-md: 0.375rem;  /* 6px - buttons, inputs */
--radius-lg: 0.5rem;    /* 8px - cards */
--radius-xl: 0.75rem;   /* 12px - modals */
--radius-2xl: 1rem;     /* 16px - large containers */
--radius-full: 9999px;  /* Full rounded - avatars */
```

## ⚡ **Performance Optimization Guidelines**

### **Animation Performance**
```css
/* Use transform and opacity for smooth 60fps animations */
.performance-optimized {
  /* GPU acceleration */
  will-change: transform, opacity;
  /* Smooth rendering */
  backface-visibility: hidden;
  /* Subpixel rendering */
  transform: translateZ(0);
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### **Loading Optimization**
```css
/* Critical CSS inlining */
.critical-above-fold {
  /* Inline critical styles for above-the-fold content */
  display: block;
  visibility: visible;
}

/* Lazy loading for below-the-fold */
.lazy-load {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.lazy-load.loaded {
  opacity: 1;
}
```

## 🎯 **Component Usage Guidelines**

### **Buttons**
```jsx
// Role-based button variants
<Button variant="admin">Admin Action</Button>
<Button variant="manager">Manager Action</Button>
<Button variant="employee">Employee Action</Button>
<Button variant="ai">AI Feature</Button>

// Interactive states
<Button className="hrms-button-interactive">Hover Me</Button>
```

### **Cards**
```jsx
// Interactive cards with hover effects
<div className="hrms-card hrms-card-interactive">
  <h3 className="text-heading-sm">Card Title</h3>
  <p className="text-body-md text-muted-foreground">Card content</p>
</div>
```

### **Forms**
```jsx
// Consistent form styling
<div className="hrms-form-container">
  <label className="text-label">Field Label</label>
  <input className="hrms-input focus-ring" />
</div>
```

## 📱 **Responsive Design Tokens**

### **Breakpoints**
```css
/* Mobile-first responsive design */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Medium devices */
--breakpoint-lg: 1024px;  /* Large devices */
--breakpoint-xl: 1280px;  /* Extra large devices */
--breakpoint-2xl: 1536px; /* 2X large devices */
```

### **Responsive Typography**
```css
/* Fluid typography that scales smoothly */
.text-responsive-xl { font-size: clamp(1.5rem, 4vw, 2.25rem); }
.text-responsive-lg { font-size: clamp(1.25rem, 3vw, 1.875rem); }
.text-responsive-md { font-size: clamp(1rem, 2vw, 1.5rem); }
```

## 🎨 **Dark Mode Considerations**

### **Color Adjustments**
```css
/* Ensure proper contrast in dark mode */
.dark .hrms-card {
  background-color: hsl(var(--card));
  border-color: hsl(var(--border));
}

.dark .text-muted {
  color: hsl(var(--muted-foreground));
}

/* Adjust shadows for dark mode */
.dark .shadow-lg {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.5);
}
```

## 📋 **Implementation Checklist**

### **For Every Component**
- ✅ Use CSS variables for colors
- ✅ Apply consistent spacing scale
- ✅ Include hover and focus states
- ✅ Add smooth transitions
- ✅ Ensure dark mode compatibility
- ✅ Test with reduced motion
- ✅ Validate accessibility
- ✅ Optimize for performance

### **Performance Targets**
- ✅ First Contentful Paint < 1.5s
- ✅ Largest Contentful Paint < 2.5s
- ✅ Cumulative Layout Shift < 0.1
- ✅ First Input Delay < 100ms
- ✅ 60fps animations
- ✅ Smooth scrolling

This design system ensures consistent, beautiful, and performant UI across the entire HRMS application.
