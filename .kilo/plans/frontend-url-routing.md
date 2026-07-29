# Plan: Add URL-based Routing to Frontend

## Problem
The frontend uses a `currentView` state variable (defaulting to `'dashboard'`) to render components, not URL paths. Visiting `http://192.168.1.29:3000/admin` does NOT show the admin login — it shows the dashboard (or regular login) because the initial `currentView` is `'dashboard'`, not `'admin-login'`.

## Route Mappings Needed
| URL Path | `currentView` Value | Component |
|----------|---------------------|-----------|
| `/admin` | `admin-login` | `AdminLogin` |
| `/admin/dashboard` | `admin-dashboard` | `AdminDashboard` |
| `/editor` | `editor` | `EditorCanvas` (via App.tsx) |
| `/catalog-setup` | `catalog-setup` | `CatalogSetup` |
| `/your-work` | `your-work` | `YourWork` |
| `/publish` | `publish` | `PublishView` |
| `/pricing` | `pricing` | `PricingView` |
| `/settings` | `settings` | `SettingsView` |

## Implementation Steps

### 1. Add URL path → view mapping in App.tsx
Read `window.location.pathname` on initial load (in the existing `useEffect` with `checkAuth`) and map it to a `currentView`:
- `/admin` → `'admin-login'`
- `/admin/dashboard` → `'admin-dashboard'`
- `/editor` → `'editor'`
- etc.

Call `setView(mappedView)` before `setLoading(false)`.

### 2. Update the `useEffect` initialization block in App.tsx
- After `checkAuth()` completes (or if session is not found), check `window.location.pathname`
- Map path → view via a helper function `getViewFromPath(pathname)`
- Call `setView(viewFromPath)` to set the correct initial view

### 3. Add `<Routes>` / redirect fallback
Since the app is SPA without a router, the simplest fix is to use `window.location.pathname` at the top of App render to override `currentView` before rendering. Or, add a `useEffect` that calls `setView()` when the pathname changes.

### 4. Verify admin login works at `/admin`
After the fix, visiting `http://192.168.1.29:3000/admin` should render `AdminLogin` component.

## Verification
1. Start the frontend dev server (`npm run dev`)
2. Visit `http://localhost:3000/admin` — should show admin login
3. Visit `http://localhost:3000/editor` — should show editor view
4. Visit `http://localhost:3000/` — should show regular login (default)
5. Login with `admin@admin.com` / `admin@123` at `/admin` — should show admin dashboard