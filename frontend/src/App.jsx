import SpamDetectorApp from "./pages/home/home"
import SignupPage from "./pages/register/Register"
import ModernLoginPage from "./pages/login/Login"
import { Route, Routes, Navigate } from "react-router-dom"

function App() {


  return (
    <>
     <Routes>

      <Route path="/" element={<ModernLoginPage />} />

      <Route path="/home" element={<SpamDetectorApp/>} />
      <Route path="/login" element={<Navigate to="/"/>} />
      <Route path="/register" element={<SignupPage/>} />
     </Routes>
    </>
  )
}

export default App
