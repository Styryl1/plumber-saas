# Tailwind CSS Patterns - Dashboard Implementation

## 🎯 Overview
Complete Tailwind CSS utility patterns for the plumbing dashboard, featuring container queries, responsive design, performance optimization, and consistent green theme implementation.

## 🎨 Design System Foundation

### **Color Palette**
```css
/* Primary Green Theme */
--emerald-50: #ecfdf5;
--emerald-100: #d1fae5;
--emerald-500: #10b981;
--emerald-600: #059669;  /* Primary brand color */
--emerald-700: #047857;
--emerald-800: #065f46;

/* Semantic Colors */
--success: #059669;      /* Emerald-600 */
--warning: #f59e0b;      /* Amber-500 */
--error: #ef4444;        /* Red-500 */
--info: #3b82f6;         /* Blue-500 */

/* Neutral Grays */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-600: #4b5563;
--gray-900: #111827;
```

### **Typography System**
```css
/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Scale */
.text-xs    { font-size: 0.75rem; }   /* 12px */
.text-sm    { font-size: 0.875rem; }  /* 14px */
.text-base  { font-size: 1rem; }      /* 16px */
.text-lg    { font-size: 1.125rem; }  /* 18px */
.text-xl    { font-size: 1.25rem; }   /* 20px */
.text-2xl   { font-size: 1.5rem; }    /* 24px */
.text-3xl   { font-size: 1.875rem; }  /* 30px */
```

## 📱 Responsive Breakpoints

### **Mobile-First Strategy**
```css
/* Breakpoint Strategy */
sm: '640px',   /* Small devices (phones) */
md: '768px',   /* Medium devices (tablets) */
lg: '1024px',  /* Large devices (desktops) */
xl: '1280px',  /* Extra large (wide screens) */
2xl: '1536px'  /* Ultra wide screens */

/* Usage Pattern */
.responsive-grid {
  @apply grid grid-cols-1 gap-4;
  @apply sm:grid-cols-2;
  @apply lg:grid-cols-3;
  @apply xl:grid-cols-4;
}
```

### **Container Queries (Tailwind CSS 4.0+)**
```css
/* Component-based responsiveness */
.calendar-container {
  @apply @container;
}

.calendar-view {
  @apply grid grid-cols-1;
  @apply @md:grid-cols-2;
  @apply @lg:grid-cols-3;
}
```

## 🧩 Component Patterns

### **Button System**
```html
<!-- Primary Button -->
<button class="
  inline-flex items-center justify-center
  px-4 py-2 text-sm font-medium
  bg-emerald-600 text-white
  border border-transparent rounded-lg
  hover:bg-emerald-700 focus:bg-emerald-700
  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors duration-200
">
  <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
  Add Job
</button>

<!-- Secondary Button -->
<button class="
  inline-flex items-center justify-center
  px-4 py-2 text-sm font-medium
  bg-gray-100 text-gray-700
  border border-gray-300 rounded-lg
  hover:bg-gray-200 focus:bg-gray-200
  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
  transition-colors duration-200
">
  Cancel
</button>

<!-- Danger Button -->
<button class="
  inline-flex items-center justify-center
  px-4 py-2 text-sm font-medium
  bg-red-600 text-white
  border border-transparent rounded-lg
  hover:bg-red-700 focus:bg-red-700
  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
  transition-colors duration-200
">
  Delete
</button>
```

### **Card Components**
```html
<!-- Standard Card -->
<div class="
  bg-white rounded-xl shadow-sm
  border border-gray-200
  p-6
  hover:shadow-md transition-shadow duration-200
">
  <!-- Card content -->
</div>

<!-- Stats Card -->
<div class="
  bg-white rounded-xl shadow-sm
  border border-gray-200
  p-6
  relative overflow-hidden
">
  <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-emerald-600/5"></div>
  <div class="relative">
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
          <i data-lucide="calendar" class="w-4 h-4 text-emerald-600"></i>
        </div>
      </div>
      <div class="ml-4">
        <p class="text-sm font-medium text-gray-600">Today's Jobs</p>
        <p class="text-2xl font-bold text-gray-900">12</p>
      </div>
    </div>
  </div>
</div>
```

### **Form Elements**
```html
<!-- Input Field -->
<div class="space-y-1">
  <label class="block text-sm font-medium text-gray-700">
    Customer Name
  </label>
  <input type="text" class="
    block w-full px-3 py-2
    border border-gray-300 rounded-lg
    text-sm placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
    disabled:bg-gray-50 disabled:text-gray-500
  " placeholder="Enter customer name">
</div>

<!-- Select Dropdown -->
<select class="
  block w-full px-3 py-2
  border border-gray-300 rounded-lg
  text-sm bg-white
  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
">
  <option>Select service type</option>
  <option>Leak Repair</option>
  <option>Boiler Service</option>
</select>

<!-- Textarea -->
<textarea class="
  block w-full px-3 py-2
  border border-gray-300 rounded-lg
  text-sm placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
  resize-none
" rows="3" placeholder="Job description"></textarea>
```

## 🎯 Layout Patterns

### **Dashboard Grid System**
```html
<!-- Main Dashboard Layout -->
<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Header content -->
      </div>
    </div>
  </header>
  
  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <!-- Stats cards -->
    </div>
    
    <!-- Content Grid -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <!-- Main content area -->
      <div class="lg:col-span-2">
        <!-- Primary content -->
      </div>
      
      <!-- Sidebar -->
      <div class="lg:col-span-1">
        <!-- Secondary content -->
      </div>
    </div>
  </main>
</div>
```

### **Filter/Action Area (NO White Container)**
```html
<!-- ✅ CORRECT: Direct to background -->
<div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
  <!-- Filter tabs in gray container -->
  <div class="flex bg-gray-100 rounded-lg p-1 w-full lg:w-auto">
    <button class="flex-1 lg:flex-none px-4 py-2 text-sm rounded bg-white text-gray-900 shadow-sm">
      Active Jobs
    </button>
    <button class="flex-1 lg:flex-none px-4 py-2 text-sm rounded text-gray-600 hover:text-gray-900">
      Completed
    </button>
    <button class="flex-1 lg:flex-none px-4 py-2 text-sm rounded text-gray-600 hover:text-gray-900">
      Scheduled
    </button>
  </div>
  
  <!-- Action buttons -->
  <div class="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
    <div class="flex-1 sm:flex-none">
      <input type="search" placeholder="Search jobs..." class="
        w-full px-4 py-2 text-sm
        border border-gray-300 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
      ">
    </div>
    <button class="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
      <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
      New Job
    </button>
  </div>
</div>
```

## 🎨 Animation & Transitions

### **Smooth Transitions**
```css
/* Standard transition timing */
.transition-default {
  @apply transition-all duration-200 ease-in-out;
}

/* Hover effects */
.card-hover {
  @apply transform transition-all duration-200 ease-in-out;
  @apply hover:scale-[1.02] hover:shadow-lg;
}

/* Loading states */
.loading-pulse {
  @apply animate-pulse bg-gray-200 rounded;
}

/* Slide-in animations */
.slide-in-right {
  @apply transform translate-x-full transition-transform duration-300 ease-in-out;
}

.slide-in-right.active {
  @apply translate-x-0;
}
```

### **Micro-interactions**
```html
<!-- Button with micro-interaction -->
<button class="
  group relative overflow-hidden
  px-4 py-2 bg-emerald-600 text-white rounded-lg
  transition-all duration-200 ease-in-out
  hover:bg-emerald-700 hover:scale-105
  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
  active:scale-95
">
  <span class="relative z-10">Click me</span>
  <div class="
    absolute inset-0 bg-white opacity-0
    group-hover:opacity-10 transition-opacity duration-200
  "></div>
</button>
```

## 📱 Mobile Optimization

### **Touch-Friendly Patterns**
```css
/* Minimum touch target (44px iOS requirement) */
.touch-target {
  @apply min-h-[44px] min-w-[44px];
}

/* Mobile button sizing */
.mobile-button {
  @apply px-6 py-3 text-base;
  @apply sm:px-4 sm:py-2 sm:text-sm;
}

/* Mobile spacing */
.mobile-spacing {
  @apply space-y-6;
  @apply sm:space-y-4;
}
```

### **Mobile Navigation**
```html
<!-- Mobile-optimized navigation -->
<nav class="lg:hidden">
  <div class="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 px-4 py-2">
    <div class="flex justify-around">
      <button class="flex flex-col items-center py-2 px-3 text-xs">
        <i data-lucide="home" class="w-6 h-6 text-gray-600"></i>
        <span class="mt-1 text-gray-600">Home</span>
      </button>
      <button class="flex flex-col items-center py-2 px-3 text-xs">
        <i data-lucide="calendar" class="w-6 h-6 text-emerald-600"></i>
        <span class="mt-1 text-emerald-600">Jobs</span>
      </button>
      <button class="flex flex-col items-center py-2 px-3 text-xs">
        <i data-lucide="users" class="w-6 h-6 text-gray-600"></i>
        <span class="mt-1 text-gray-600">Customers</span>
      </button>
    </div>
  </div>
</nav>
```

## ⚡ Performance Optimization

### **CSS Purging Strategy**
```javascript
// tailwind.config.ts
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#ecfdf5',
          600: '#059669',
          700: '#047857',
        }
      }
    }
  }
}
```

### **Critical CSS Patterns**
```css
/* Above-the-fold critical styles */
.critical-layout {
  @apply min-h-screen bg-gray-50;
}

.critical-header {
  @apply bg-gradient-to-r from-emerald-600 to-emerald-700 text-white;
}

.critical-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}
```

### **Utility Class Optimization**
```html
<!-- ✅ Optimized class usage -->
<div class="card-base card-hover">
  <!-- content -->
</div>

<!-- ❌ Avoid excessive inline utilities -->
<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 transform hover:scale-[1.02]">
  <!-- content -->
</div>
```

## 🎯 Component Library Integration

### **Schedule-X Calendar Styling**
```css
/* Schedule-X calendar integration */
.schedule-x-calendar {
  @apply bg-white rounded-xl shadow-sm border border-gray-200;
}

.schedule-x-calendar .sx-calendar-header {
  @apply bg-emerald-50 text-emerald-900;
}

.schedule-x-calendar .sx-event {
  @apply bg-emerald-100 border-emerald-300 text-emerald-800;
}

.schedule-x-calendar .sx-event.emergency {
  @apply bg-red-100 border-red-300 text-red-800;
}
```

### **shadcn/ui Component Overrides**
```css
/* Button variants */
.btn-primary {
  @apply bg-emerald-600 text-white hover:bg-emerald-700;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

/* Data table styling */
.data-table {
  @apply bg-white rounded-xl shadow-sm border border-gray-200;
}

.data-table th {
  @apply bg-gray-50 text-gray-900 font-medium;
}

.data-table td {
  @apply border-t border-gray-200;
}
```

## 🌙 Dark Mode Support

### **Dark Mode Utilities**
```css
/* Dark mode color scheme */
@media (prefers-color-scheme: dark) {
  .dark-mode-card {
    @apply bg-gray-800 border-gray-700 text-white;
  }
  
  .dark-mode-button {
    @apply bg-emerald-600 hover:bg-emerald-500;
  }
}
```

### **Manual Dark Mode Toggle**
```html
<!-- Dark mode implementation -->
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  <button class="bg-emerald-600 dark:bg-emerald-500 text-white">
    Toggle Theme
  </button>
</div>
```

## 🎨 Green Theme Consistency

### **Brand Color Usage**
```css
/* Primary actions */
.brand-primary {
  @apply bg-emerald-600 text-white hover:bg-emerald-700;
}

/* Success states */
.brand-success {
  @apply bg-emerald-100 text-emerald-800 border-emerald-300;
}

/* Accents and highlights */
.brand-accent {
  @apply text-emerald-600 border-emerald-600;
}

/* Gradients */
.brand-gradient {
  @apply bg-gradient-to-r from-emerald-600 to-emerald-700;
}
```

---

**This Tailwind CSS patterns guide provides complete utility patterns for building consistent, performant, and mobile-optimized dashboard interfaces with proper green theme implementation and modern CSS features.**