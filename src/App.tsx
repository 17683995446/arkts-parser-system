import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Graph } from "./pages/Graph";
import { Explorer } from "./pages/Explorer";
import { Query } from "./pages/Query";
import { Settings } from "./pages/Settings";

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-950">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/query" element={<Query />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
