/**
 * Navigation Bridge
 *
 * This module acts as a bridge between the React Router context (Hooks)
 * and non-React codebases, such as Axios interceptors or utility functions,
 * allowing for programmatic navigation without causing a full page reload.
 */

// A private reference to the navigate function provided by React Router.
// Initialized as null until the app registers the actual navigate function.
let navigateFn: ((path: string) => void) | null = null;

/**
 * Registers the 'navigate' function from a React component.
 * Should be called inside a useEffect hook in a root component (e.g., App.tsx).
 *
 * @param fn - The 'navigate' function returned by the useNavigate() hook.
 */
export const setNavigate = (fn: (path: string) => void) => {
  navigateFn = fn;
};

/**
 * Triggers programmatic navigation from anywhere in the application.
 *
 * @param path - The URL path to navigate to.
 */
export const navigateTo = (path: string) => {
  if (navigateFn) {
    // If the navigate function is registered, perform a SPA (Single Page Application) navigation.
    navigateFn(path);
  } else {
    // Fallback: Use window.location.href if the router has not been initialized.
    // This triggers a full browser reload, but prevents the app from crashing.
    window.location.href = path;
  }
};
