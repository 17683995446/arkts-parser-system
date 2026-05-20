import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GraphData, ProjectStats, AppSettings } from '../../shared/types';

interface AppState {
  settings: AppSettings;
  setSettings: (settings: Partial<AppSettings>) => void;
  
  graphData: GraphData | null;
  setGraphData: (data: GraphData) => void;
  
  stats: ProjectStats | null;
  setStats: (stats: ProjectStats) => void;
  
  isParsing: boolean;
  setIsParsing: (parsing: boolean) => void;
  
  selectedNode: any | null;
  setSelectedNode: (node: any | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: {
        neo4j: {
          uri: 'bolt://localhost:7687',
          user: 'neo4j',
          password: '12345678'
        },
        openaiApiKey: '',
        projectPath: ''
      },
      setSettings: (settings) => 
        set((state) => ({ settings: { ...state.settings, ...settings } })),
      
      graphData: null,
      setGraphData: (data) => set({ graphData: data }),
      
      stats: null,
      setStats: (stats) => set({ stats }),
      
      isParsing: false,
      setIsParsing: (parsing) => set({ isParsing: parsing }),
      
      selectedNode: null,
      setSelectedNode: (node) => set({ selectedNode: node })
    }),
    {
      name: 'arkts-graph-storage'
    }
  )
);
