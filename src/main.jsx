import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import Wardrobe from './pages/Wardrobe.jsx';
import OutfitBuilder from './pages/OutfitBuilder.jsx';
import MyOutfits from './pages/MyOutfits.jsx';
import NotWornRecently from './pages/NotWornRecently.jsx';
import Settings from './pages/Settings.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Wardrobe />} />
          <Route path="builder" element={<OutfitBuilder />} />
          <Route path="outfits" element={<MyOutfits />} />
          <Route path="not-worn" element={<NotWornRecently />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
