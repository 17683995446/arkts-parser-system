import { useEffect } from 'react';
import { Filter, Search, X, Info } from 'lucide-react';
import { GraphVisualization } from '../components/GraphVisualization';
import { useAppStore } from '../store';
import { getGraphData } from '../api';

const NODE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  File: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  Class: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  Component: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  Method: { bg: 'bg-amber-500/20', text: 'text-amber-400' }
};

export function Graph() {
  const { graphData, setGraphData, selectedNode, setSelectedNode } = useAppStore();

  useEffect(() => {
    if (!graphData) {
      loadGraphData();
    }
  }, [graphData]);

  const loadGraphData = async () => {
    try {
      const response = await getGraphData();
      if (response.success) {
        setGraphData(response.data);
      }
    } catch (error) {
      console.error('Failed to load graph data');
    }
  };

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-medium mb-2">No Graph Data</h3>
          <p className="text-slate-400 text-sm">
            Parse a project first to see the visualization
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-800/90 backdrop-blur rounded-lg px-4 py-2 border border-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">
              {graphData.nodes.length} nodes · {graphData.links.length} links
            </span>
          </div>
        </div>
        
        <GraphVisualization 
          data={graphData} 
          onNodeClick={setSelectedNode}
        />
      </div>

      {selectedNode && (
        <div className="w-80 bg-slate-800 border-l border-slate-700 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Node Details</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                NODE_TYPE_COLORS[selectedNode.type]?.bg || 'bg-slate-700'
              }`}>
                <Info className={`w-5 h-5 ${
                  NODE_TYPE_COLORS[selectedNode.type]?.text || 'text-slate-400'
                }`} />
              </div>
              <div>
                <p className="text-white font-medium">{selectedNode.name}</p>
                <p className={`text-sm ${
                  NODE_TYPE_COLORS[selectedNode.type]?.text || 'text-slate-400'
                }`}>
                  {selectedNode.type}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedNode.path && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Path</p>
                  <p className="text-sm text-slate-300 font-mono break-all">
                    {selectedNode.path}
                  </p>
                </div>
              )}
              
              {selectedNode.file && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">File</p>
                  <p className="text-sm text-slate-300 font-mono break-all">
                    {selectedNode.file}
                  </p>
                </div>
              )}
              
              {selectedNode.class && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Class</p>
                  <p className="text-sm text-slate-300 font-mono">
                    {selectedNode.class}
                  </p>
                </div>
              )}
              
              {selectedNode.isEntry && (
                <div className="flex items-center gap-2 text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-sm font-medium">Entry Component</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Connections</p>
              <div className="space-y-2">
                {graphData.links
                  .filter((link: any) => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    return sourceId === selectedNode.id || targetId === selectedNode.id;
                  })
                  .slice(0, 10)
                  .map((link: any, index: number) => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    const otherId = sourceId === selectedNode.id ? targetId : sourceId;
                    const otherNode = graphData.nodes.find((n: any) => n.id === otherId);
                    
                    if (!otherNode) return null;
                    
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedNode(otherNode)}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          NODE_TYPE_COLORS[otherNode.type]?.text.replace('text-', 'bg-') || 'bg-slate-500'
                        }`} />
                        <span className="text-sm text-slate-300 truncate">
                          {otherNode.name}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
