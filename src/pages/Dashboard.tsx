import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Box, 
  Component as ComponentIcon, 
  FunctionSquare, 
  Play, 
  ArrowRight,
  Database
} from 'lucide-react';
import { useAppStore } from '../store';
import { parseProject, getStats } from '../api';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  description 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  color: string; 
  description: string; 
}) => (
  <div className={`${color} rounded-xl p-6 border border-white/10`}>
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-white/10 rounded-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-3xl font-bold text-white">{value}</span>
    </div>
    <h3 className="text-white font-semibold">{title}</h3>
    <p className="text-white/70 text-sm mt-1">{description}</p>
  </div>
);

export function Dashboard() {
  const { settings, setGraphData, setStats, stats, isParsing, setIsParsing } = useAppStore();

  useEffect(() => {
    if (!stats) {
      loadStats();
    }
  }, [stats]);

  const loadStats = async () => {
    try {
      const response = await getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleParse = async () => {
    if (!settings.projectPath) {
      alert('Please set a project path in Settings');
      return;
    }
    
    setIsParsing(true);
    
    try {
      const response = await parseProject(settings.projectPath);
      
      if (response.success) {
        setGraphData(response.data);
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Failed to parse project:', error);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to ArkTS Graph
          </h1>
          <p className="text-slate-400">
            Visualize and explore your HarmonyOS codebase with knowledge graphs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Files"
            value={stats?.files || 0}
            icon={FileText}
            color="bg-gradient-to-br from-blue-600 to-blue-700"
            description="Total files analyzed"
          />
          <StatCard
            title="Classes"
            value={stats?.classes || 0}
            icon={Box}
            color="bg-gradient-to-br from-purple-600 to-purple-700"
            description="Classes found"
          />
          <StatCard
            title="Components"
            value={stats?.components || 0}
            icon={ComponentIcon}
            color="bg-gradient-to-br from-emerald-600 to-emerald-700"
            description="ArkUI components"
          />
          <StatCard
            title="Methods"
            value={stats?.methods || 0}
            icon={FunctionSquare}
            color="bg-gradient-to-br from-amber-600 to-amber-700"
            description="Functions and methods"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-slate-700 rounded-lg">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Parse Project</h3>
                <p className="text-slate-400 text-sm">Analyze your codebase</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Project Path
                </label>
                <div className="bg-slate-900 rounded-lg p-3 text-slate-300 text-sm font-mono border border-slate-700">
                  {settings.projectPath || 'Not set - go to Settings'}
                </div>
              </div>
              
              <button
                onClick={handleParse}
                disabled={isParsing || !settings.projectPath}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isParsing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Parse Project
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/graph"
                className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <ComponentIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">View Graph</p>
                    <p className="text-slate-500 text-sm">Explore code relationships</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
              </Link>
              
              <Link
                to="/explorer"
                className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">File Explorer</p>
                    <p className="text-slate-500 text-sm">Browse code files</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
              </Link>
              
              <Link
                to="/query"
                className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <FunctionSquare className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">AI Query</p>
                    <p className="text-slate-500 text-sm">Ask about your code</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
