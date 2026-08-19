import { Navigate } from "react-router-dom";
import { TOKEN_KEY } from "../api/client";

export default function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
