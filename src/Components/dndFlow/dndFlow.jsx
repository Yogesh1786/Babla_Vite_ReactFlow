import React, { useRef, useCallback, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  Background,
} from "@xyflow/react";
import styles from "./dndFlow.module.css";
import "@xyflow/react/dist/style.css";

import Sidebar from "../Sidebar/sideBar";
import CustomNode from "../customNode/customNode";
import { DnDProvider, useDnD } from "../dndContext/DnDProvider";

const getId = () => `dndnode_${Date.now()}`;

const safeParse = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const getNodeTypes = (onUpdate, onDelete) => ({
  input: (props) => (
    <CustomNode {...props} onUpdate={onUpdate} onDelete={onDelete} />
  ),
  default: (props) => (
    <CustomNode {...props} onUpdate={onUpdate} onDelete={onDelete} />
  ),
  output: (props) => (
    <CustomNode {...props} onUpdate={onUpdate} onDelete={onDelete} />
  ),
});

const DnDFlow = () => {
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("ResizeObserver loop completed")
      ) {
        return;
      }
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(safeParse("nodes"));
  const [edges, setEdges, onEdgesChange] = useEdgesState(safeParse("edges"));

  const [visibleNodes, setVisibleNodes] = React.useState([]);

  const createHardcodedChildren = (parentNode) => {
    const labels = [
      "Machine",
      "Material",
      "Method",
      "Man Power",
      "Environment",
    ];
    const spacingX = 180;
    const startX = parentNode.position.x - (spacingX * (labels.length - 1)) / 2;
    const y = parentNode.position.y + 150;

    return labels.map((label, index) => ({
      id: `${parentNode.id}-${label}`,
      type: "default",
      position: {
        x: startX + index * spacingX,
        y,
      },
      data: { label },
      draggable: true,
    }));
  };

  useEffect(() => {
    const handleMakeParentEvent = (e) => {
      const parentId = e.detail.parentId;
      const parentNode = nodes.find((n) => n.id === parentId);
      if (!parentNode) return;

      const children = createHardcodedChildren(parentNode);
      const newNodes = [parentNode, ...children];

      setVisibleNodes(newNodes);
    };

    const handleResetView = () => {
      setVisibleNodes([]);
    };

    window.addEventListener("make-parent", handleMakeParentEvent);
    window.addEventListener("reset-view", handleResetView);

    return () => {
      window.removeEventListener("make-parent", handleMakeParentEvent);
      window.removeEventListener("reset-view", handleResetView);
    };
  }, [nodes]);

  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  const handleEditNode = useCallback(
    (nodeId, newLabel) => {
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, label: newLabel } }
              : node
          )
        );
      }, 0);
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    },
    [setNodes]
  );

  const nodeTypesRef = useRef(null);
  if (!nodeTypesRef.current) {
    nodeTypesRef.current = getNodeTypes(handleEditNode, handleDeleteNode);
  }

  useEffect(() => {
    localStorage.setItem("nodes", JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem("edges", JSON.stringify(edges));
  }, [edges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, screenToFlowPosition, type]
  );

  return (
    <div className={styles.dndflow}>
      <div className={styles.reactflow_wrapper} ref={reactFlowWrapper}>
        <ReactFlow
          nodeTypes={nodeTypesRef.current}
          nodes={visibleNodes.length ? visibleNodes : nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          style={{ backgroundColor: "#F7F9FB" }}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <Sidebar />
    </div>
  );
};

const FlowWrapper = () => (
  <ReactFlowProvider>
    <DnDProvider>
      <DnDFlow />
    </DnDProvider>
  </ReactFlowProvider>
);

export default FlowWrapper;
