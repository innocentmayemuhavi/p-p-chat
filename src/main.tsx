import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import ChatPage from "./pages/chat";
import LoginPage from "./pages/auth/login";
import SignupPage from "./pages/auth/signup";
import { AppProvider } from "./context/app-context";
import { Toaster } from "react-hot-toast";
import { ROUTES } from "./shared/constants";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />;
};

const appRoutes = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
      <Route
        path={ROUTES.CHAT}
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to={ROUTES.CHAT} replace />} />
    </>
  )
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <Toaster position="top-right" />
      <RouterProvider router={appRoutes} />
    </AppProvider>
  </StrictMode>
);
