import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense } from 'react'
import Navbar from './components/Navbar/Navbar'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Productos from './pages/Productos/Productos'
import Clientes from './pages/Clientes/Clientes'
import Inventario from './pages/Inventario/Inventario'
import RecursosHumanos from './pages/RecursosHumanos/RecursosHumanos'
import Contabilidad from './pages/Contabilidad/Contabilidad'
import Ventas from './pages/Ventas/Ventas'
import Compras from './pages/Compras/Compras'
import Reportes from './pages/Reportes/Reportes'
import Sucursales from './pages/Sucursales/Sucursales'
import Ayuda from './pages/Ayuda/Ayuda'
import useAuth from './hooks/useAuth'
import './App.css'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="app">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? "main-content" : "full-content"}>
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login />
              )
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/productos" 
            element={
              <ProtectedRoute>
                <Productos />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/clientes" 
            element={
              <ProtectedRoute>
                <Clientes />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/inventario" 
            element={
              <ProtectedRoute>
                <Inventario />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/recursos-humanos" 
            element={
              <ProtectedRoute roles={['admin']}>
                <RecursosHumanos />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/contabilidad" 
            element={
              <ProtectedRoute>
                <Contabilidad />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/ventas" 
            element={
              <ProtectedRoute>
                <Ventas />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/compras" 
            element={
              <ProtectedRoute>
                <Compras />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/reportes" 
            element={
              <ProtectedRoute>
                <Reportes />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/ayuda"
            element={
              <ProtectedRoute>
                <Ayuda />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sucursales"
            element={
              <ProtectedRoute roles={['admin']}>
                <Sucursales />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="*" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </main>
    </div>
  )
}

export default App