import { useState, useEffect } from 'react';
import { Database, Key, FolderOpen, Save, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store';

export function Settings() {
  const { settings, setSettings } = useAppStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    setSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">
            Configure your Neo4j database and API keys
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Neo4j Database</h3>
                <p className="text-slate-400 text-sm">Connection settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">URI</label>
                <input
                  type="text"
                  value={localSettings.neo4j.uri}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    neo4j: { ...localSettings.neo4j, uri: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="bolt://localhost:7687"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Username</label>
                <input
                  type="text"
                  value={localSettings.neo4j.user}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    neo4j: { ...localSettings.neo4j, user: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="neo4j"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Password</label>
                <input
                  type="password"
                  value={localSettings.neo4j.password}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    neo4j: { ...localSettings.neo4j, password: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Project</h3>
                <p className="text-slate-400 text-sm">ArkTS project path</p>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Project Path</label>
              <input
                type="text"
                value={localSettings.projectPath || ''}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  projectPath: e.target.value
                })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                placeholder="/path/to/your/harmonyos/project"
              />
              <p className="text-xs text-slate-500 mt-2">
                The absolute path to your ArkTS/HarmonyOS project directory
              </p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">OpenAI API</h3>
                <p className="text-slate-400 text-sm">Optional, for natural language queries</p>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">API Key</label>
              <input
                type="password"
                value={localSettings.openaiApiKey || ''}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  openaiApiKey: e.target.value
                })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="sk-..."
              />
              <p className="text-xs text-slate-500 mt-2">
                Your API key is stored locally in your browser
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
