import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { APP_ROUTES } from "./constants/routes";
import { AuthProvider, useAuth } from "./state/AuthContext";

const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage").then((module) => ({ default: module.AuthCallbackPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((module) => ({ default: module.ProfilePage })));

function PageLoadingFallback() {
  return <main className="page"><div className="panel">Loading page...</div></main>;
}

function ProtectedProfile() {
  const { status, session } = useAuth();

  if (status === "checking") {
    return <main className="page"><div className="panel">Restoring session...</div></main>;
  }

  if (!session) {
    return <Navigate to={APP_ROUTES.login} replace />;
  }

  return <ProfilePage />;
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path={APP_ROUTES.root} element={<Navigate to={APP_ROUTES.profile} replace />} />
            <Route path={APP_ROUTES.login} element={<LoginPage />} />
            <Route path={APP_ROUTES.authCallback} element={<AuthCallbackPage />} />
            <Route path={APP_ROUTES.profile} element={<ProtectedProfile />} />
            <Route path={APP_ROUTES.wildcard} element={<Navigate to={APP_ROUTES.profile} replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}
