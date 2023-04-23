"use client";
import React from "react";
import ReactFlow, { Background } from "reactflow";

import "reactflow/dist/style.css";

const initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

export function BracketFlow() {
  return (
    <div className="h-[500px]">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView
        proOptions={{
          hideAttribution: true,
        }}
      >
        <Background></Background>
      </ReactFlow>
    </div>
  );
}
