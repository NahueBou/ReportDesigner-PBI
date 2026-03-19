import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import EditorPage from "@/pages/EditorPage";

function App() {
  return (
    <div className="App min-h-screen bg-background">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/editor/:projectId" element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
