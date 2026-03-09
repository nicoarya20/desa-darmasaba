# State Management Guide

## Overview

Desa Darmasaba menggunakan **Valtio** untuk global state management. Valtio adalah state management library yang menggunakan proxy pattern untuk reactive state yang sederhana dan performant.

## Why Valtio?

- ✅ **Simple API** - Menggunakan plain JavaScript objects
- ✅ **Performant** - Component re-renders hanya saat state yang digunakan berubah
- ✅ **TypeScript-friendly** - Full TypeScript support
- ✅ **No boilerplate** - Tidak perlu actions, reducers, atau selectors
- ✅ **Flexible** - Bisa digunakan di dalam atau luar React components

## Installation

```bash
bun install valtio
```

## State Structure

```
src/state/
├── admin/                  # Admin dashboard state
│   ├── index.ts           # Admin state exports
│   ├── adminNavState.ts   # Navigation state
│   ├── adminAuthState.ts  # Authentication state
│   ├── adminFormState.ts  # Form state (images, files)
│   └── adminModuleState.ts # Module-specific state
│
├── public/                 # Public pages state
│   ├── index.ts           # Public state exports
│   ├── publicNavState.ts  # Navigation state
│   └── publicMusicState.ts # Music player state
│
├── darkModeStore.ts        # Dark mode state (legacy)
└── index.ts                # Main exports
```

## Basic Usage

### Creating State

```typescript
// src/state/example/exampleState.ts
import { proxy, useSnapshot } from 'valtio';

export const exampleState = proxy<{
  count: number;
  items: string[];
  isLoading: boolean;
  increment: () => void;
  addItem: (item: string) => void;
}>({
  count: 0,
  items: [],
  isLoading: false,
  
  increment() {
    exampleState.count += 1;
  },
  
  addItem(item: string) {
    exampleState.items.push(item);
  },
});

// Hook untuk React components
export const useExample = () => {
  const snapshot = useSnapshot(exampleState);
  return {
    ...snapshot,
    increment: exampleState.increment,
    addItem: exampleState.addItem,
  };
};
```

### Using in React Components

```typescript
'use client';

import { useExample } from '@/state';

export function Counter() {
  const { count, increment } = useExample();
  
  return (
    <button onClick={increment}>
      Count: {count}
    </button>
  );
}
```

### Using Outside React

```typescript
// In non-React code (utilities, services, etc.)
import { exampleState } from '@/state';

// Direct mutation
exampleState.count = 10;
exampleState.increment();

// Subscribe to changes
import { subscribe } from 'valtio';

subscribe(exampleState, () => {
  console.log('State changed:', exampleState.count);
});
```

## Domain-Specific State

### Admin State

State untuk admin dashboard hanya digunakan di `/admin` routes.

```typescript
import { 
  adminNavState, 
  adminAuthState, 
  useAdminNav,
  useAdminAuth 
} from '@/state';

// In React component
export function AdminHeader() {
  const { mobileOpen, toggleMobile } = useAdminNav();
  const { user, isAuthenticated } = useAdminAuth();
  
  return (
    <Header>
      <Button onClick={toggleMobile}>Menu</Button>
      {user?.name}
    </Header>
  );
}

// Outside React
adminNavState.mobileOpen = true;
adminAuthState.clearUser();
```

### Public State

State untuk public pages hanya digunakan di `/darmasaba` routes.

```typescript
import { 
  publicNavState, 
  publicMusicState,
  usePublicNav,
  usePublicMusic 
} from '@/state';

// In React component
export function MusicPlayer() {
  const { isPlaying, currentSong, togglePlayPause } = usePublicMusic();
  
  return (
    <Player>
      {currentSong?.judul}
      <Button onClick={togglePlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </Button>
    </Player>
  );
}
```

## Async Operations

```typescript
// src/state/example/dataState.ts
import { proxy, useSnapshot } from 'valtio';
import ApiFetch from '@/lib/api-fetch';

export const dataState = proxy<{
  data: any[];
  isLoading: boolean;
  error: string | null;
  fetchData: (id: string) => Promise<void>;
}>({
  data: [],
  isLoading: false,
  error: null,
  
  async fetchData(id: string) {
    dataState.isLoading = true;
    dataState.error = null;
    
    try {
      const response = await ApiFetch.someApi.get({ id });
      dataState.data = response.data;
    } catch (error) {
      dataState.error = error instanceof Error ? error.message : 'Failed to fetch';
    } finally {
      dataState.isLoading = false;
    }
  },
});

export const useData = () => {
  const snapshot = useSnapshot(dataState);
  return {
    ...snapshot,
    fetchData: dataState.fetchData,
  };
};
```

## Best Practices

### ✅ DO

1. **Separate admin and public state**
   ```typescript
   // Good
   import { adminNavState } from '@/state/admin';
   import { publicNavState } from '@/state/public';
   ```

2. **Use methods in state for complex operations**
   ```typescript
   // Good
   export const state = proxy({
     count: 0,
     increment() {
       state.count += 1;
     },
   });
   ```

3. **Add error handling in async methods**
   ```typescript
   // Good
   async fetchData() {
     state.isLoading = true;
     state.error = null;
     try {
       // fetch logic
     } catch (error) {
       state.error = error.message;
     } finally {
       state.isLoading = false;
     }
   }
   ```

4. **Use TypeScript for type safety**
   ```typescript
   // Good
   type User = { id: string; name: string };
   
   export const authState = proxy<{
     user: User | null;
     setUser: (user: User | null) => void;
   }>({ ... });
   ```

### ❌ DON'T

1. **Don't mutate state directly in render**
   ```typescript
   // Bad
   function Component() {
     state.count += 1; // Don't do this in render
     return <div>{state.count}</div>;
   }
   ```

2. **Don't mix admin and public state**
   ```typescript
   // Bad
   import { adminAuthState } from '@/state/admin';
   import { publicNavState } from '@/state/public';
   
   // Don't use admin state in public pages
   ```

3. **Don't create new objects in state methods**
   ```typescript
   // Bad
   increment() {
     state.count = state.count + 1; // Creates new number
   }
   
   // Good
   increment() {
     state.count += 1; // Mutates existing value
   }
   ```

## Migration from Legacy State

### Old Pattern (Deprecated)

```typescript
// Old pattern - still works but deprecated
import stateNav from '@/state/state-nav';
import { authStore } from '@/store/authStore';
```

### New Pattern (Recommended)

```typescript
// New pattern - recommended
import { adminNavState } from '@/state/admin';
import { adminAuthState } from '@/state/admin';
```

## Music Player State

Music player sekarang menggunakan Valtio state dengan React Context wrapper untuk backward compatibility.

```typescript
// New way (recommended)
import { usePublicMusic } from '@/state/public';

function MusicPlayer() {
  const { isPlaying, currentSong, togglePlayPause } = usePublicMusic();
  // ...
}

// Old way (still works for backward compatibility)
import { useMusic } from '@/app/context/MusicContext';

function MusicPlayer() {
  const { isPlaying, currentSong, togglePlayPause } = useMusic();
  // ...
}
```

## Troubleshooting

### State not updating in component

Make sure you're using the hook in component:

```typescript
// Good
function Component() {
  const { count } = useExample(); // Subscribe to state
  return <div>{count}</div>;
}

// Bad
function Component() {
  const count = exampleState.count; // No subscription
  return <div>{count}</div>;
}
```

### Performance issues

Use selective subscriptions:

```typescript
// Good - only subscribe to what you need
function Component() {
  const { count } = useExample(); // Only count
  return <div>{count}</div>;
}

// Bad - subscribe to entire state
function Component() {
  const state = useExample(); // Entire state
  return <div>{state.count}</div>;
}
```

## Additional Resources

- [Valtio Documentation](https://github.com/pmndrs/valtio)
- [Valtio Examples](https://github.com/pmndrs/valtio/tree/main/examples)
- [Reactivity Guide](https://docs.pmnd.rs/valtio/guides/reactivity)
