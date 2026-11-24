"use client";

import React, { useState, useCallback, useMemo } from "react";
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
import { WebhookModal } from "./WebhookModal";
import { NodeType, WorkflowGraphDefinition } from "@nexora/shared";
import { Save, Play, Check, Globe, Webhook, Radio } from "lucide-react";
import { Button } from "../ui/Button";

interface WorkflowCanvasProps {
  initialDefinition?: WorkflowGraphDefinition;
  workflowId: string;
  workflowName: string;
  workflowStatus: string;
  webhookUrl?: string | null;
  publishedAt?: string;
  onSave: (definition: WorkflowGraphDefinition) => Promise<void>;
  onRunWorkflow: () => Promise<void>;
  onPublish?: () => Promise<any>;
  onUnpublish?: () => Promise<any>;
  isSaving?: boolean;
  isRunning?: boolean;
  isPublishing?: boolean;
  currentExecution?: ExecutionDetails | null;
}

export function WorkflowCanvas({
  initialDefinition,
  workflowId,
  workflowName,
  workflowStatus,
  webhookUrl,
  publishedAt,
  onSave,
  onRunWorkflow,
  onPublish,
  onUnpublish,
  isSaving = false,
  isRunning = false,
  isPublishing = false,
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
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  // Compute node status map based on real-time execution step data
  const enrichedNodes = useMemo(() => {
    if (!currentExecution?.nodeExecutions || currentExecution.nodeExecutions.length === 0) {
      return nodes;
    }

    const statusMap = new Map<string, string>();
    for (const step of currentExecution.nodeExecutions) {
      statusMap.set(step.nodeId, step.status);
    }

    return nodes.map((node) => {
      const stepStatus = statusMap.get(node.id);
      if (node.data?.executionStatus !== stepStatus) {
        return {
          ...node,
          data: {
            ...node.data,
            executionStatus: stepStatus,
          },
        };
      }
      return node;
    });
  }, [nodes, currentExecution]);

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

  const handlePublishClick = async () => {
    if (isDirty) {
      await handleSaveClick();
    }
    if (onPublish) {
      const res = await onPublish();
      if (res?.webhookPath || res?.token) {
        setIsWebhookModalOpen(true);
      }
    }
  };

  const isLive = workflowStatus === "ACTIVE";

  return (
    <div className="flex flex-col h-full w-full bg-[#101827] relative">
      {/* Canvas Top Bar */}
      <div className="h-14 px-4 border-b border-[#1E293B] bg-[#101827]/90 backdrop-blur-md flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white tracking-tight">{workflowName}</span>

          {isLive ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#059669]/20 text-[#34D399] border border-[#059669]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
              LIVE
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#172D43] text-[#94A3B8] border border-[#2A4365]">
              DRAFT
            </span>
          )}

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
          {isLive && webhookUrl && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsWebhookModalOpen(true)}
              className="gap-1.5 border-[#22D3EE]/30 text-[#22D3EE] hover:bg-[#22D3EE]/10"
            >
              <Webhook className="w-3.5 h-3.5" />
              <span>Webhook Endpoint</span>
            </Button>
          )}

          {isLive ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={onUnpublish}
              isLoading={isPublishing}
              className="text-xs text-[#94A3B8] hover:text-[#EF4444]"
            >
              Unpublish
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={handlePublishClick}
              isLoading={isPublishing}
              className="gap-1.5 border-[#22D3EE]/40 text-white hover:border-[#22D3EE]"
            >
              <Globe className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Publish</span>
            </Button>
          )}

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
            nodes={enrichedNodes}
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
          workflowId={workflowId}
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

        {/* Webhook URL Endpoint Modal */}
        <WebhookModal
          isOpen={isWebhookModalOpen}
          onClose={() => setIsWebhookModalOpen(false)}
          webhookUrl={webhookUrl || `http://localhost:4000/api/v1/webhooks/${workflowId}`}
          workflowName={workflowName}
          publishedAt={publishedAt}
        />
      </div>
    </div>
  );
}
