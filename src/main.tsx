import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import { store, persistor } from '@/store';
import App from './App';
import '@/assets/styles/global.css';

/**
 * React 18+ Root Initialization
 * We find the HTML element with id="root" and inject the React tree.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 
      1. Redux Provider: 
         Makes the Redux 'store' available to all components in the tree.
    */}
    <Provider store={store}>
      {/* 
        2. PersistGate: 
           Delays the rendering of the app UI until the persisted state 
           has been retrieved and saved to the Redux store from localStorage.
           loading={null} means nothing renders until rehydration completes.
      */}
      <PersistGate loading={null} persistor={persistor}>
        {/* 
          3. BrowserRouter: 
             Provides navigation capabilities to the entire app context.
        */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);
