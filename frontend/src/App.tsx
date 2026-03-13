import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth-store';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Toast } from './components/Toast';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BrowsePage } from './pages/BrowsePage';
import { LevelBrowsePage } from './pages/LevelBrowsePage';
import { LearnPage } from './pages/LearnPage';
import { ReadingPage } from './pages/ReadingPage';

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/browse/:level" element={<LevelBrowsePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/reading" element={<ReadingPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/browse" replace />} />
      </Routes>
      <Toast />
    </BrowserRouter>
  );
}
