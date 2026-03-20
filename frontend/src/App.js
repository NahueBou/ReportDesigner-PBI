import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import Designer from "@/pages/Designer";
import LoginPage from "@/pages/LoginPage";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function AppContent() {
  const { user } = useAuth();
  return (
    <div className="App">
      {user ? <Designer /> : <LoginPage />}
      <Toaster position="bottom-right" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
