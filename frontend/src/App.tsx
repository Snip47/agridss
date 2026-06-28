import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CropAdvisor from './pages/CropAdvisor'
import LivestockAdvisor from './pages/LivestockAdvisor'
import DiseaseDiagnosis from './pages/DiseaseDiagnosis'
import AIAdvisor from './pages/AIAdvisor'
import ClimateAdvisor from './pages/ClimateAdvisor'
import AdminPanel from './pages/AdminPanel'

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-leaf-800">
      <div className="text-center">
        <div className="text-5xl mb-4">🌾</div>
        <div className="text-white text-xl font-semibold">Loading AgriDSS...</div>
        <div className="text-leaf-300 text-sm mt-1">Kenya Agricultural Decision Support System</div>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login"/>
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/" element={<Protected><Layout/></Protected>}>
            <Route index element={<Dashboard/>}/>
            <Route path="crops" element={<CropAdvisor/>}/>
            <Route path="livestock" element={<LivestockAdvisor/>}/>
            <Route path="diseases" element={<DiseaseDiagnosis/>}/>
            <Route path="climate" element={<ClimateAdvisor/>}/>
            <Route path="ai" element={<AIAdvisor/>}/>
            <Route path="admin" element={<AdminPanel/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
