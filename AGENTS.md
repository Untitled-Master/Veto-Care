# Project Guidelines for Agentic Coding Agents

Welcome to the `react-vite-shadcn-tailwind` repository. This file serves as the definitive reference for AI coding agents operating within this codebase. It outlines the technology stack, project architecture, code style, conventions, and essential commands required to effectively build, lint, and test this project.

## 1. Project Overview & Technology Stack

This project is a modern frontend application built with the following core technologies:
- **Framework:** React 19 (via Vite)
- **Language:** JavaScript (ESM, ECMA 2020+) - Note: This project uses JavaScript, NOT TypeScript.
- **Routing:** React Router v7 (`react-router-dom`)
- **Styling:** Tailwind CSS + PostCSS
- **Component Library:** shadcn/ui (configured with `new-york` style, JS variants, using CSS variables)
- **Icons:** `lucide-react` and `react-icons`
- **Backend/Services:** Supabase (`@supabase/supabase-js`)
- **Notifications/Toasts:** `sonner`
- **Code Editor:** Monaco Editor (`@monaco-editor/react`)

## 2. Important Commands

### Build & Run
- **Start Development Server:**
  ```bash
  npm run dev
  ```
- **Build for Production:**
  ```bash
  npm run build
  ```
- **Preview Production Build:**
  ```bash
  npm run preview
  ```

### Linting
The project uses ESLint configured for React and React Hooks.
- **Run Linter:**
  ```bash
  npm run lint
  ```
*Always run the linter after making code modifications to ensure style compliance. Do not ignore ESLint warnings.*

### Testing
*Note: A formal testing framework (e.g., Vitest or Jest) is not currently installed in the `package.json`. There are also no `.cursorrules` or `.github/copilot-instructions.md` in this repository.*

If you are tasked with creating tests, please follow these guidelines carefully:
1.  **Setup (if missing):** Ask the user to install `vitest` and `@testing-library/react`.
2.  **Running all tests:**
    ```bash
    npm test
    # or if using vitest directly
    npx vitest run
    ```
3.  **Running a single test (Crucial for Debugging):**
    When debugging a specific issue, always isolate your tests to speed up your feedback loop.
    ```bash
    npx vitest run path/to/specific.test.jsx
    ```
4.  **Test Naming & Location:** File names should match the component they test, e.g., `Component.test.jsx` or `Component.spec.jsx`, and sit alongside the component.

## 3. Architecture and File Structure

The project utilizes Vite's path aliases. The alias `@` resolves to the `./src` directory.
- `src/components/` - General reusable React components.
- `src/components/ui/` - shadcn/ui primitives. Never modify these unless explicitly required.
- `src/lib/` - Utility functions, configurations, and API clients (e.g., Supabase client: `supabase.js`).
- `src/hooks/` - Custom React hooks.
- `src/pages/` - Route components / View layers.

## 4. Code Style & Formatting Guidelines

### 4.1 Language and Types
- Write code in plain **JavaScript (.js / .jsx)**. Do not write TypeScript (.ts / .tsx).
- Rely on JSDoc comments sparingly if complex data structures need clarification, but prioritize clean, self-documenting variable names.

### 4.2 Imports & Exports
- Use ES Module syntax (`import` / `export`).
- Use absolute imports leveraging the `@` alias where applicable.
  ```javascript
  // Good
  import { Button } from "@/components/ui/button";
  import { cn } from "@/lib/utils";

  // Bad
  import { Button } from "../../components/ui/button";
  ```
- Group imports logically:
  1. React and third-party libraries (e.g., `react`, `react-router-dom`).
  2. Internal absolute imports (`@/...`).
  3. Relative imports (`./...`).
- Export components as default or named exports consistently. Prefer `export default function ComponentName` for page-level components.

### 4.3 React Components & Hooks
- Use Functional Components exclusively. Do not use Class Components.
- Embrace React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- Keep components small and single-responsibility. Extract complex logic into custom hooks.
- Destructure props in the function signature for better readability.
  ```javascript
  export default function UserProfile({ user, onUpdate }) {
    // ...
  }
  ```

### 4.4 Styling and UI Conventions
- Use **Tailwind CSS** for all styling. Avoid custom CSS files unless absolutely necessary (e.g., global resets in `index.css`).
- Use the `cn` utility (from `clsx` and `tailwind-merge`) when conditionally joining class names.
  ```javascript
  import { cn } from "@/lib/utils";
  
  <div className={cn("p-4 bg-white", isActive && "bg-blue-50")}>
  ```
- When adding new interactive components, prefer utilizing or modifying **shadcn/ui** components located in `src/components/ui/` over building from scratch.
- Follow the `new-york` design language established by the existing shadcn/ui setup.

### 4.5 State Management & Data Fetching
- For local state, use React's `useState` and `useReducer`.
- For backend interactions and database calls, utilize the `@supabase/supabase-js` client.
- When performing asynchronous operations, ensure you manage loading and error states properly. Avoid deeply nested promises; prefer `async/await`.

### 4.6 Error Handling
- Use `try...catch` blocks for asynchronous functions and Supabase calls.
- Fail gracefully and display user-friendly error messages to the DOM.
- Utilize the `sonner` library (`toast`) to notify the user of successes or errors seamlessly.
  ```javascript
  import { toast } from "sonner";

  try {
    const { data, error } = await supabase.from('users').select();
    if (error) throw error;
    toast.success("Users loaded successfully");
  } catch (error) {
    console.error("Error loading users:", error);
    toast.error("Failed to load users. Please try again.");
  }
  ```

### 4.7 Naming Conventions
- **Files/Directories:** `camelCase` or `kebab-case` for utility files (e.g., `api-client.js`). `PascalCase` for React components (e.g., `UserProfile.jsx`).
- **Variables/Functions:** `camelCase` (e.g., `fetchData`, `userData`).
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`).
- **Components:** `PascalCase` (e.g., `Button`, `NavigationMenu`).
- **Boolean variables:** Prefix with `is`, `has`, `should` (e.g., `isLoading`, `hasError`).

## 5. Agent Instructions for Modifying Code

1. **Verify Context:** Always read the surrounding code, especially imports and related custom hooks, before making edits. Do not assume the existence of utilities without checking.
2. **Adhere to JS:** Remember this is a JavaScript project. Avoid emitting TypeScript interfaces or types.
3. **Check UI Components:** Before building a new UI element, check if a similar primitive already exists in `src/components/ui/` or components.json.
4. **Self-Correction:** After writing or modifying code, run `npm run lint` via the bash tool to ensure you haven't introduced syntax or styling errors.
5. **Simplicity over cleverness:** Write code that is easy to read. Avoid deeply nested ternaries or overly complex one-liners.

End of File.