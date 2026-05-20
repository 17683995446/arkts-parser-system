import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData } from '../../shared/types';

interface GraphVisualizationProps {
  data: GraphData;
  onNodeClick?: (node: any) => void;
}

const NODE_COLORS: Record<string, string> = {
  File: '#3B82F6',
  Class: '#8B5CF6',
  Component: '#10B981',
  Method: '#F59E0B'
};

export function GraphVisualization({ data, onNodeClick }: GraphVisualizationProps) {
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const fgRef = useRef<any>();

  useEffect(() => {
    // 适配到节点
    setTimeout(() => {
      if (fgRef.current) {
        fgRef.current.zoomToFit(400, 60);
      }
    }, 100);
  }, [data]);

  const handleNodeHover = (node: any) => {
    if (!node) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      return;
    }

    const connectedNodes = new Set<string>();
    const connectedLinks = new Set<string>();
    
    connectedNodes.add(node.id);
    
    data.links.forEach((link: any) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (sourceId === node.id) {
        connectedNodes.add(targetId);
        connectedLinks.add(`${sourceId}-${targetId}`);
      } else if (targetId === node.id) {
        connectedNodes.add(sourceId);
        connectedLinks.add(`${sourceId}-${targetId}`);
      }
    });

    setHighlightNodes(connectedNodes);
    setHighlightLinks(connectedLinks);
  };

  const nodeColor = (node: any) => {
    if (highlightNodes.size > 0 && !highlightNodes.has(node.id)) {
      return 'rgba(156, 163, 175, 0.2)';
    }
    return NODE_COLORS[node.type] || '#9CA3AF';
  };

  const linkColor = (link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    const linkId = `${sourceId}-${targetId}`;
    
    if (highlightLinks.size > 0 && !highlightLinks.has(linkId)) {
      return 'rgba(156, 163, 175, 0.1)';
    }
    
    return 'rgba(156, 163, 175, 0.4)';
  };

  const nodeCanvasObject = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    const nodeRadius = 6;
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = nodeColor(node);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    if (globalScale >= 0.5) {
      ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = highlightNodes.size > 0 && !highlightNodes.has(node.id) 
        ? 'rgba(156, 163, 175, 0.5)' 
        : '#E5E7EB';
      ctx.fillText(label, node.x, node.y - nodeRadius - 8);
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeColor={nodeColor}
        linkColor={linkColor}
        linkWidth={1}
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => 'replace'}
        onNodeClick={onNodeClick}
        onNodeHover={handleNodeHover}
        cooldownTime={3000}
        backgroundColor="#0f172a"
      />
    </div>
  );
}
