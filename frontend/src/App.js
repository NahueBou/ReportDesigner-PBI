import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import Designer from "@/pages/Designer";

function App() {
  return (
    <div className="App">
      <Designer />
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
