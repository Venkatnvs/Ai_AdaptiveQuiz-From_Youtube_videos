import { Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import routes from './routes'
import { Toaster } from "./components/ui/sonner";
import PrivateRoute from "./components/PrivateRoute";
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import MainLandingPage from "./pages/LandingPage/MainLandingPage";

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<MainLandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
              {routes.map(route => {
                return (
                  <Route
                    key={route.name}
                    path={route.path}
                    element={<route.element />}
                  />
                );
              })}
          </Route>
          <Route path="*" element={<p className="text-white-1">404 Not Found</p>} />
        </Routes >
        <Toaster />
      </Suspense>
    </BrowserRouter>
  )
}

export default App