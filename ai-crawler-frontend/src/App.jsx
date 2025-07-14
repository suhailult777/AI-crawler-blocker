import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import NavBar from './components/NavBar-component'
import LandingPage from './components/landing-page-component'
import PricingPage from './components/pricing-component'
import Dashboard from './components/dashboard-component'
import AuthComponent from './components/Auth-component'
import SignInPage from './pages/sign-in-page'
import SignOutPage from './pages/sign-out-page'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NavBar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/auth" element={<AuthComponent />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-out" element={<SignOutPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
