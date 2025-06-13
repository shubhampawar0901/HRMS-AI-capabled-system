# AI Agent Development Rulebook 🛠

## 📌 Purpose

These rules guide the *AI assistant* writing code for a *React* web application using *JavaScript (JSX), **Tailwind CSS v4, and **ShadCN UI. Follow these exactly during development. **Exclude* deployment, hosting, routing framework, or monitoring considerations.


## 1. Project Context Reminder

* *Framework:* React with functional components (.jsx files)
* *Styling:* Tailwind CSS v4 + ShadCN UI components
* *Approach:* Standard Tailwind setup WITH tailwind.config.js (Required for ShadCN UI)
* *Configuration:* Proper CSS variables and design tokens for theming


## 2. Development Workflow Steps

1. *Restate Context:* “I am building a React app using JavaScript, Tailwind v4, and ShadCN UI.”
2. *Plan in Pseudocode:* Outline steps in simple English or code-like outline.
3. *Confirm Plan:* Wait for user approval before coding.
4. *Write Code:* Implement following all rules below.
5. *Compile & Lint:* Ensure no JavaScript, ESLint, or formatting errors.
6. *Test & Validate:* Add and run basic tests for functionality.


## 3. Code Structure & Naming

* *Single Responsibility:* One component or utility per file.
* *Naming Conventions:*

  * Components: PascalCase.tsx
  * Utilities/hooks: camelCase.ts
* *Early Returns:* Use early exits for clarity.
* *Descriptive Names:* Avoid single-letter or vague names.


## 4. Styling Rules (Tailwind v4 + ShadCN UI)

* *Required Tailwind Config:* Use tailwind.config.js for proper ShadCN UI integration and theming.
* *CSS Variables:* Define design tokens using CSS variables in globals.css for consistent theming.
* *Layered CSS:*

  css
  @layer base { /* resets and CSS variables */ }
  @layer components { /* component styles with @apply */ }
  @layer utilities { /* custom utility classes */ }

* *Tailwind Classes Only:* Apply styling via className with design tokens from config.
* *No Inline CSS:* No <style> tags or style attributes in components.
* *@apply for Components:* Use @apply in @layer components for reusable component styles.
* *ShadCN Theming:* Use CSS variables (--primary, --secondary, etc.) for consistent theming.


## 5. Interactive Styling & Effects

* *Smooth Transitions:*

  * Apply transitions on interactive elements (buttons, links, cards) to properties like background-color, opacity, and transform.
  * Use transition duration-200 ease-in-out or duration-300 classes for fluid change.
* *Hover Effects on Buttons:*

  * Provide subtle feedback such as a slight change in background shade, text color shift, or gentle scale up (transform scale-103).
  * Avoid heavy or multiple box shadows; keep effects minimal.
* *Smooth Scrolling:*

  * Enable global smooth scrolling via html { scroll-behavior: smooth; } in @layer base.
  * For in-app anchor links, use a lightweight solution (e.g., a custom hook).
* *Minimalist Aesthetic:*

  * Effects should be unobtrusive and consistent with the overall clean look.


## 6. ShadCN UI Guidelines
You have to use the browser search for finding best practices and guidelines for ShadCN UI. This is a very important part of the project and you
* *Required Configuration:* ShadCN UI requires proper tailwind.config.js setup with CSS variables.
* *Components Only:* Use ShadCN UI offerings (buttons, modals, inputs).
* *Import Location:* Place in components/ui/.
* *No Core Edits:* Wrap/extend to customize.
* *Tailwind Overrides:* Use utility classes for tweaks.
* *Theme Integration:* Use CSS variables (--primary, --secondary) for consistent theming.
* *Accessibility Defaults:* Preserve ShadCN a11y features.
* *Dark Mode Support:* Implement using CSS variables and class-based dark mode.


## 7. JavaScript & JavaScript Practices

* *Strict Mode:* "strict": true in tsconfig.json.
* *No @ts-ignore:* Unless with clear comment and ticket link.
* *Explicit Types:* Define for props, state, and return values.
* *Use Const Arrow Functions:* (e.g., const handleClick = (): void => {})
* *Handler Prefix:* Name events handleXxx.
* *Documentation Check:* If uncertain, respond with “I’m not sure—check docs.”


## 8. Accessibility Requirements

* Interactive elements must include:

  * tabIndex="0" if not natively focusable
  * aria-label or visible label
  * onClick + onKeyDown handlers


## 9. Performance & Optimization

* *Lazy Loading:* Use dynamic imports with React.lazy and <Suspense> for heavy components.
* *Avoid Render Blocking:* Heavy logic in hooks or data functions.
* *Image Usage:* Use <img> with explicit width and height or a lightweight image component.
* *Memoization:* Use useMemo/useCallback for costly ops.
* *Bundle Size Check:* Flag any file > 50 KB.
* *Fast Loading Focus:* Prefer minimal initial JavaScript and CSS.


## 10. UI Modernity & Clarity

* *Clean Layouts:* Follow design system spacing and hierarchy.
* *Consistent Look:* Use ShadCN themes and Tailwind utility consistency.
* *Minimal Visual Clutter:* Avoid unnecessary borders, shadows, or colors.
* *Responsive:* Ensure layouts adapt at common breakpoints.
* *Typography:* Use readable font sizes and line heights.

## 11. Required Configuration Files

### **tailwind.config.js (REQUIRED)**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // HRMS-specific colors
        'hrms': {
          'admin': '#DC2626',
          'manager': '#D97706',
          'employee': '#059669',
          'ai': '#8B5CF6'
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### **globals.css (REQUIRED)**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode variables */
  }
}

@layer components {
  .hrms-card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }
}
```

## 12. What to Avoid
* One giant component with mixed responsibilities.
* Any UI library aside from ShadCN UI.
* Editing core ShadCN components directly (wrap/extend instead).
* Inline or plain CSS in .jsx files.
* Skipping compile checks or tests.
* Using CSS-first approach without tailwind.config.js (breaks ShadCN UI).
* Hardcoded colors instead of CSS variables for theming.

> *Important:* These rules are the absolute source of truth. The AI assistant must follow them strictly for every code generation task during development.