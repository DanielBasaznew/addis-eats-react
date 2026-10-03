import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeContext'
import { AuthProvider } from './auth/AuthProvider'
import { AdminAuthProvider } from './admin/useAdminAuth'
import RequireAuth from './auth/RequireAuth'
import RequireAdmin from './admin/RequireAdmin'
import Login from './auth/Login'
import AdminLogin from './admin/AdminLogin'
import Layout from './Layout'
import Home from './Home'
import Menu from './menu/Menu'
import DishDetail from './menu/DishDetail'
import Cart from './cart/Cart'
import Checkout from './checkout/Checkout'
import OrderHistory from './orders/OrderHistory'
import Favorites from './favorites/Favorites'
import Admin from './admin/Admin'
import './App.css'
import './skeleton/skeleton.css'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="menu" element={<Menu />} />
              <Route path="menu/:id" element={<DishDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route
                path="checkout"
                element={
                  <RequireAuth>
                    <Checkout />
                  </RequireAuth>
                }
              />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="login" element={<Login />} />
              <Route path="admin/login" element={<AdminLogin />} />
              <Route
                path="admin"
                element={
                  <RequireAdmin>
                    <Admin />
                  </RequireAdmin>
                }
              />
              <Route
                path="admin/:tab"
                element={
                  <RequireAdmin>
                    <Admin />
                  </RequireAdmin>
                }
              />
            </Route>
          </Routes>
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
