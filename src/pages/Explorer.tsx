import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAppStore } from '../store';
import { getProjectTree, getFileContent } from '../api';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

const FileTreeItem = ({ node, onSelect, selectedPath }: { 
  node: FileNode; 
  onSelect: (path: string) => void;
  selectedPath: string | null;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (node.type === 'directory') {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors ${
            selectedPath === node.path
              ? 'bg-blue-500/10 text-blue-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <Folder className="w-4 h-4" />
          <span>{node.name}</span>
        </button>
        {isExpanded && node.children && (
          <div className="ml-4">
            {node.children.map((child) => (
              <FileTreeItem
                key={child.path}
                node={child}
                onSelect={onSelect}
                selectedPath={selectedPath}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(node.path)}
      className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors ${
        selectedPath === node.path
          ? 'bg-blue-500/10 text-blue-400'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <div className="w-4 h-4" />
      <FileText className="w-4 h-4" />
      <span>{node.name}</span>
    </button>
  );
};

export function Explorer() {
  const { settings } = useAppStore();
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings.projectPath) {
      loadFileTree();
    }
  }, [settings.projectPath]);

  const loadFileTree = async () => {
    if (!settings.projectPath) return;
    
    try {
      const response = await getProjectTree(settings.projectPath);
      if (response.success) {
        setFileTree(response.tree);
      }
    } catch (error) {
      console.error('Failed to load file tree');
    }
  };

  const handleFileSelect = async (path: string) => {
    setSelectedFile(path);
    setLoading(true);
    
    try {
      const response = await getFileContent(path, settings.projectPath!);
      if (response.success) {
        setFileContent(response.content);
      }
    } catch (error) {
      console.error('Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-72 bg-slate-800 border-r border-slate-700 p-4 overflow-y-auto">
        <h2 className="text-white font-semibold mb-4">Files</h2>
        {fileTree ? (
          <div className="space-y-1">
            <FileTreeItem
              node={fileTree}
              onSelect={handleFileSelect}
              selectedPath={selectedFile}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">No project loaded</p>
          </div>
        )}
      </div>

      <div className="flex-1 bg-slate-900 overflow-auto">
        {selectedFile && fileContent ? (
          <div className="h-full">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-sm font-mono">{selectedFile}</span>
            </div>
            <div className="p-4">
              <SyntaxHighlighter
                language="typescript"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  background: 'transparent',
                  fontSize: '13px',
                  lineHeight: '1.6'
                }}
                showLineNumbers
                lineNumberStyle={{
                  minWidth: '3em',
                  paddingRight: '1em',
                  textAlign: 'right',
                  userSelect: 'none',
                  opacity: 0.5
                }}
              >
                {fileContent}
              </SyntaxHighlighter>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Select a file to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
