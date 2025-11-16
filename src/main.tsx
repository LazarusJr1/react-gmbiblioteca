import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.css';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import EditoraPage from './pages/EditoraPage';
import CodigoPostalPage from './pages/CodigoPostalPage';
import UtentePage from './pages/UtentePage';
import AutorPage from './pages/AutorPage';
import GeneroPage from './pages/GeneroPage';
import LivroPage from './pages/LivroPage';
import ExemplarPage from './pages/ExemplarPage';
import SidebarLayout from './shared/SidebarLayout';

export const supabase = createClient(
  'https://ujundioyiojgvsahwfjj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqdW5kaW95aW9qZ3ZzYWh3ZmpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MTg2MjksImV4cCI6MjA3NTQ5NDYyOX0.4BT2bnnYVmgpFEKEi01eFuBQP7G7QKCxtH9ebbcJBqk'
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SidebarLayout />}>          
          <Route index element={<Navigate to="/livro" replace />} />
          <Route path="/livro" element={<LivroPage />} />
          <Route path="/exemplar" element={<ExemplarPage />} />
          <Route path="/editora" element={<EditoraPage />} />
          <Route path="/codigo-postal" element={<CodigoPostalPage />} />
          <Route path="/utente" element={<UtentePage />} />
          <Route path="/autor" element={<AutorPage />} />
          <Route path="/genero" element={<GeneroPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);


