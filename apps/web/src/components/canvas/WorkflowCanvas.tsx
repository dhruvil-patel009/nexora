"use client";

import React, { useState, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./nodes";
import { NodePalette } from "./NodePalette";
import { NodeConfigDrawer } from "./NodeConfigDrawer";
import { ExecutionPanel, ExecutionDetails } from "./ExecutionPanel";
import { NodeType, WorkflowGraphDefinition } from "@nexora/shared";
import { Save, Play, Check } from "lucide-react";
import { Button } from "../ui/Button";

interface WorkflowCanvasProps {
  initialDefinition?: WorkflowGraphDefinition;
  workflowId: string;
  workflowName: string;
  workflowStatus: string;
  onSave: (definition: WorkflowGraphDefinition) => Promise<void>;
  onRunWorkflow: () => Promise<void>;
  isSaving?: boolean;
  isRunning?: boolean;
  currentExecution?: ExecutionDetails | null;
}

export function WorkflowCanvas({
  initialDefinition,
  workflowId,
  workflowName,
  workflowStatus,
  onSave,
  onRunWorkflow,
  isSaving = false,
  isRunning = false,
  currentExecution = null,
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    (initialDefinition?.nodes as any[]) || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    (initialDefinition?.edges as any[]) || []
  );
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExecutionPanelOpen, setIsExecutionPanelOpen] = useState(false);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#22D3EE", strokeWidth: 2 },
          },
          eds
        )
      );
      setIsDirty(true);
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleAddNode = (type: NodeType, label: string) => {
    const id = `${type}_${Date.now().toString(36)}`;
    const newNode: Node = {
      id,
      type,
      position: {
        x: 250 + Math.random() * 80,
        y: 150 + Math.random() * 80,
      },
      data: {
        label,
        description: "",
        config: {},
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
    setIsDirty(true);
  };

  const handleUpdateNodeConfig = (nodeId: string, updatedData: any) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: updatedData } : n))
    );
    setSelectedNode((prev) =>
      prev && prev.id === nodeId ? { ...prev, data: updatedData } : prev
    );
    setIsDirty(true);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    setIsDirty(true);
  };

  const handleSaveClick = async () => {
    const graphDefinition: WorkflowGraphDefinition = {
      nodes: nodes as any,
      edges: edges as any,
    };
    await onSave(graphDefinition);
    setIsDirty(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleRunClick = async () => {
    setIsExecutionPanelOpen(true);
    await onRunWorkflow();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#101827] relative">
      {/* Canvas Top Bar */}
      <div className="h-14 px-4 border-b border-[#1E293B] bg-[#101827]/90 backdrop-blur-md flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white tracking-tight">{workflowName}</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#172D43] text-[#22D3EE] border border-[#22D3EE]/30">
            {workflowStatus}
          </span>
          {isDirty && (
            <span className="text-[11px] font-mono text-[#F59E0B] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
              Unsaved changes
            </span>
          )}
          {saveSuccess && (
            <span className="text-[11px] font-mono text-[#22C55E] flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSaveClick}
            isLoading={isSaving}
            className="gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleRunClick}
            isLoading={isRunning}
            className="gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Workflow</span>
          </Button>
        </div>
      </div>

      {/* Canvas Main Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Node Palette */}
        <NodePalette onAddNode={handleAddNode} />

        {/* Interactive React Flow Canvas */}
        <div className="flex-1 h-full w-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#101827]"
          >
            <Background color="#1E293B" gap={16} size={1.5} />
            <Controls className="!bg-[#172D43] !border-[#2A4365] !rounded-lg text-white fill-white" />
          </ReactFlow>
        </div>

        {/* Configuration Drawer */}
        <NodeConfigDrawer
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onUpdateConfig={handleUpdateNodeConfig}
          onDeleteNode={handleDeleteNode}
        />

        {/* Execution Results Drawer */}
        <ExecutionPanel
          execution={currentExecution}
          isOpen={isExecutionPanelOpen}
          onClose={() => setIsExecutionPanelOpen(false)}
        />
      </div>
    </div>
  );
}
