import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { RoomProvider } from './contexts/room-context.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RoomProvider>
      <App />
    </RoomProvider>
  </React.StrictMode>
);
