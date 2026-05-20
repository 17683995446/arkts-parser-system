import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Network, 
  FileCode, 
  MessageSquare, 
  Settings,
  Database,
  Sparkles
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/graph', icon: Network, label: 'Graph' },
  { path: '/explorer', icon: FileCode, label: 'Explorer' },
  { path: '/query', icon: MessageSquare, label: 'AI Query' },
  { path: '/settings', icon: Settings, label: 'Settings' }
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ArkTS Graph</h1>
            <p className="text-xs text-slate-400">Code Visualizer</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-emerald-600/20 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Tips</span>
          </div>
          <p className="text-xs text-slate-400">
            Select a project in Settings to start exploring your codebase
          </p>
        </div>
      </div>
    </aside>
  );
}
