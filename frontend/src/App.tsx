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
    <div style={{ position:'fixed', inset:0, background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🌾</div>
      <div style={{ color:'white', fontSize:'1.25rem', fontWeight:'bold' }}>Loading AgriDSS...</div>
      <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.875rem', marginTop:'0.5rem' }}>Kenya Agricultural Decision Support System</div>
    </div>
  )
  if (!user) return <Navigate to="/login"/>
  return <>{children}</>
}

export default function App() {
  return (
    <div style={{ background:'#000', minHeight:'100vh' }}>
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
    </div>
  )
}
