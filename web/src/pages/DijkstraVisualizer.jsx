import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Row, Select, Space, Table, Typography } from 'antd';
import PageLayout from '../components/PageLayout.jsx';

const { Title, Text, Paragraph } = Typography;

// ---------------------------------------------------------------------------
// Static graph data (identical to the original dijkstra.html)
// ---------------------------------------------------------------------------
const graph = {
  nodes: [
    { id: 'A', x: 150, y: 100 },
    { id: 'B', x: 300, y: 100 },
    { id: 'C', x: 450, y: 100 },
    { id: 'D', x: 150, y: 250 },
    { id: 'E', x: 300, y: 250 },
    { id: 'F', x: 450, y: 250 },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'D', weight: 1 },
    { from: 'B', to: 'C', weight: 1 },
    { from: 'B', to: 'E', weight: 3 },
    { from: 'C', to: 'F', weight: 2 },
    { from: 'D', to: 'E', weight: 3 },
    { from: 'E', to: 'F', weight: 7 },
    { from: 'B', to: 'D', weight: 2 },
  ],
};

const NODE_RADIUS = 25;

const COLORS = {
  defaultNode: '#3498db',
  startNode: '#2ecc71',
  endNode: '#e74c3c',
  currentNode: '#3498db',
  visitedNode: '#f39c12',
  shortestPath: '#9b59b6',
  edge: '#95a5a6',
  edgeText: '#333',
  defaultText: 'white',
};

const LEGEND_ITEMS = [
  { color: COLORS.startNode, label: 'Start Node' },
  { color: COLORS.endNode, label: 'Target Node' },
  { color: COLORS.currentNode, label: 'Current Node' },
  { color: COLORS.visitedNode, label: 'Visited Node' },
  { color: COLORS.shortestPath, label: 'Shortest Path' },
];

const SPEED_OPTIONS = [
  { value: 1500, label: 'Slow' },
  { value: 800, label: 'Medium' },
  { value: 400, label: 'Fast' },
];

// ---------------------------------------------------------------------------
// Pure helpers (module scope - no React state involved)
// ---------------------------------------------------------------------------
function buildEmptyDistances(sNode) {
  const distances = {};
  graph.nodes.forEach((node) => {
    distances[node.id] = node.id === sNode ? 0 : Infinity;
  });
  return distances;
}

function getNeighbors(nodeId) {
  return graph.edges
    .filter((edge) => edge.from === nodeId || edge.to === nodeId)
    .map((edge) => (edge.from === nodeId ? edge.to : edge.from));
}

function findEdgeBetween(a, b) {
  return graph.edges.find(
    (edge) => (edge.from === a && edge.to === b) || (edge.from === b && edge.to === a)
  );
}

// Re-implements the original generateSteps(): runs the full algorithm ahead
// of time against a scratch copy of the state and records one "step" per
// visible change, so the UI can play them back one at a time (or all at
// once, on a timer).
function generateSteps(sNode, eNode) {
  const simDistances = buildEmptyDistances(sNode);
  const simPrevious = {};
  graph.nodes.forEach((node) => {
    simPrevious[node.id] = null;
  });
  const simVisited = new Set();
  const simQueue = graph.nodes.map((node) => node.id);
  const steps = [];

  while (simQueue.length > 0) {
    simQueue.sort((a, b) => simDistances[a] - simDistances[b]);
    const simCurrent = simQueue.shift();

    if (simVisited.has(simCurrent)) continue;
    simVisited.add(simCurrent);

    steps.push({
      type: 'select',
      node: simCurrent,
      message: `Selected node ${simCurrent} with smallest tentative distance (${simDistances[simCurrent]})`,
    });

    getNeighbors(simCurrent).forEach((neighbor) => {
      const edge = findEdgeBetween(simCurrent, neighbor);
      const alt = simDistances[simCurrent] + edge.weight;

      steps.push({
        type: 'consider',
        node: neighbor,
        edge,
        message: `Considering neighbor ${neighbor} (current distance: ${simDistances[neighbor]}, alternative distance: ${alt})`,
      });

      if (alt < simDistances[neighbor]) {
        steps.push({
          type: 'update',
          node: neighbor,
          previous: simCurrent,
          distance: alt,
          message: `Updating node ${neighbor}: new distance ${alt} (previous: ${simCurrent})`,
        });

        simDistances[neighbor] = alt;
        simPrevious[neighbor] = simCurrent;
      }
    });
  }

  if (eNode) {
    let path = [];
    let current = eNode;
    while (current !== null) {
      path.unshift(current);
      current = simPrevious[current];
    }

    if (path.length > 1) {
      steps.push({
        type: 'path',
        path,
        message: `Shortest path from ${sNode} to ${eNode}: ${path.join(' → ')} (distance: ${simDistances[eNode]})`,
      });
    } else {
      steps.push({
        type: 'path',
        path: [],
        message: `No path exists from ${sNode} to ${eNode}`,
      });
    }
  }

  steps.push({
    type: 'complete',
    message: `Algorithm complete. Shortest distances calculated from ${sNode}.`,
  });

  return steps;
}

export default function DijkstraVisualizer() {
  const canvasRef = useRef(null);
  const stepsRef = useRef([]);
  const speedRef = useRef(800);

  // Controls
  const [startNode, setStartNode] = useState('A');
  const [endNode, setEndNode] = useState('');
  const [speed, setSpeed] = useState(800);

  // Algorithm state (mirrors the original's module-level `let` variables)
  const [distances, setDistances] = useState(() => buildEmptyDistances('A'));
  const [previous, setPrevious] = useState({});
  const [visited, setVisited] = useState(() => new Set());
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [shortestPath, setShortestPath] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // UI state
  const [stepMessage, setStepMessage] = useState(
    'Click "Start Visualization" to begin Dijkstra\'s algorithm.'
  );
  const [startDisabled, setStartDisabled] = useState(false);
  const [nextDisabled, setNextDisabled] = useState(true);

  // -- Core step application ------------------------------------------------
  // Applies steps[index]'s effects to state, exactly as the original
  // performStep() did via direct DOM/variable mutation.
  const applyStepAt = useCallback((index, autoplaying) => {
    const step = stepsRef.current[index];
    if (!step) return;

    switch (step.type) {
      case 'select':
        setCurrentNode(step.node);
        setVisited((prev) => {
          const next = new Set(prev);
          next.add(step.node);
          return next;
        });
        setPriorityQueue((prev) => prev.filter((id) => id !== step.node));
        break;
      case 'update':
        setDistances((prev) => ({ ...prev, [step.node]: step.distance }));
        setPrevious((prev) => ({ ...prev, [step.node]: step.previous }));
        break;
      case 'path':
        setShortestPath(step.path);
        break;
      case 'complete':
        setCurrentNode(null);
        break;
      default:
        // 'consider' steps only narrate - no state change.
        break;
    }

    setStepMessage(step.message);

    const nextIndex = index + 1;
    setCurrentStepIndex(nextIndex);

    const isLastStep = nextIndex >= stepsRef.current.length;
    if (autoplaying) {
      if (isLastStep) {
        setIsAutoPlaying(false);
        setStartDisabled(true);
      }
    } else if (isLastStep) {
      setStartDisabled(true);
    } else {
      setNextDisabled(false);
    }
  }, []);

  // Drives auto-play: whenever isAutoPlaying/currentStepIndex change, schedule
  // the next step. The very first step of a run fires immediately (no delay),
  // matching the original's synchronous performStep() call in startAlgorithm().
  useEffect(() => {
    if (!isAutoPlaying) return undefined;
    if (currentStepIndex >= stepsRef.current.length) return undefined;

    const delay = currentStepIndex === 0 ? 0 : speedRef.current;
    const timer = setTimeout(() => applyStepAt(currentStepIndex, true), delay);
    return () => clearTimeout(timer);
  }, [isAutoPlaying, currentStepIndex, applyStepAt]);

  const initDijkstra = useCallback((sNode, eNode) => {
    stepsRef.current = generateSteps(sNode, eNode);

    const emptyPrevious = {};
    graph.nodes.forEach((node) => {
      emptyPrevious[node.id] = null;
    });

    // Same net ordering as the original's
    // `priorityQueue.sort((a, b) => distances[a] - distances[b])` against
    // freshly-initialized distances (sNode=0, everyone else=Infinity): the
    // start node sorts first, and ties among the rest keep the graph's
    // declared node order (a stable sort of all-Infinity distances).
    const initialQueue = graph.nodes
      .map((node) => node.id)
      .sort((a, b) => (a === sNode ? -1 : b === sNode ? 1 : 0));

    setDistances(buildEmptyDistances(sNode));
    setPrevious(emptyPrevious);
    setVisited(new Set());
    setPriorityQueue(initialQueue);
    setCurrentNode(null);
    setShortestPath([]);
    setHasStarted(true);
    setCurrentStepIndex(0);
  }, []);

  const performReset = useCallback((sNode, eNode) => {
    setIsAutoPlaying(false);
    stepsRef.current = [];
    setCurrentStepIndex(0);
    setPrevious({});
    setVisited(new Set());
    setPriorityQueue([]);
    setCurrentNode(null);
    setShortestPath([]);
    setStartDisabled(false);
    setNextDisabled(false);
    setHasStarted(false);
    setDistances(buildEmptyDistances(sNode));
    setStepMessage(
      sNode
        ? `Ready to find shortest paths from node ${sNode}${eNode ? ` to node ${eNode}` : ''}. Click "Start Visualization" to begin.`
        : 'Please select a start node.'
    );
  }, []);

  // -- Control handlers ------------------------------------------------------
  const handleStart = useCallback(() => {
    speedRef.current = speed;
    initDijkstra(startNode, endNode);
    setIsAutoPlaying(true);
    setStartDisabled(true);
    setNextDisabled(true);
  }, [speed, startNode, endNode, initDijkstra]);

  const handleNextStep = useCallback(() => {
    setIsAutoPlaying(false);
    if (currentStepIndex === 0) {
      speedRef.current = speed;
      initDijkstra(startNode, endNode);
    }
    applyStepAt(currentStepIndex, false);
  }, [currentStepIndex, speed, startNode, endNode, initDijkstra, applyStepAt]);

  const handleReset = useCallback(() => {
    performReset(startNode, endNode);
  }, [startNode, endNode, performReset]);

  const handleSpeedChange = useCallback((value) => {
    setSpeed(value);
  }, []);

  const handleStartNodeChange = useCallback(
    (value) => {
      const newStart = value || '';
      setStartNode(newStart);
      performReset(newStart, endNode);
    },
    [endNode, performReset]
  );

  const handleEndNodeChange = useCallback(
    (value) => {
      const newEnd = value || '';
      setEndNode(newEnd);
      performReset(startNode, newEnd);
    },
    [startNode, performReset]
  );

  const handleCanvasClick = useCallback(
    (event) => {
      if (isAutoPlaying) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const clicked = graph.nodes.find((node) => Math.hypot(x - node.x, y - node.y) <= NODE_RADIUS);
      if (!clicked) return;

      let newStart = startNode;
      let newEnd = endNode;

      if (!startNode) {
        newStart = clicked.id;
      } else if (!endNode && clicked.id !== startNode) {
        newEnd = clicked.id;
      } else if (clicked.id === startNode) {
        newStart = '';
      } else if (clicked.id === endNode) {
        newEnd = '';
      }

      setStartNode(newStart);
      setEndNode(newEnd);
      performReset(newStart, newEnd);
    },
    [isAutoPlaying, startNode, endNode, performReset]
  );

  // -- Canvas drawing ----------------------------------------------------------
  // Redraws whenever any state that affects node/edge appearance changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Edges
    graph.edges.forEach((edge) => {
      const fromNode = graph.nodes.find((n) => n.id === edge.from);
      const toNode = graph.nodes.find((n) => n.id === edge.to);

      const isInShortestPath = shortestPath.some(
        (node, i) =>
          (node === edge.from && shortestPath[i + 1] === edge.to) ||
          (node === edge.to && shortestPath[i + 1] === edge.from)
      );

      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.strokeStyle = isInShortestPath ? COLORS.shortestPath : COLORS.edge;
      ctx.lineWidth = isInShortestPath ? 3 : 2;
      ctx.stroke();

      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      ctx.fillStyle = COLORS.edgeText;
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(edge.weight.toString(), midX, midY - 10);
    });

    // Nodes
    graph.nodes.forEach((node) => {
      let nodeColor = COLORS.defaultNode;
      if (node.id === startNode) {
        nodeColor = COLORS.startNode;
      } else if (node.id === endNode && endNode) {
        nodeColor = COLORS.endNode;
      } else if (node.id === currentNode) {
        nodeColor = COLORS.currentNode;
      } else if (visited.has(node.id)) {
        nodeColor = COLORS.visitedNode;
      } else if (shortestPath.includes(node.id)) {
        nodeColor = COLORS.shortestPath;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = COLORS.defaultText;
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id, node.x, node.y);

      if (distances[node.id] !== Infinity && distances[node.id] !== undefined) {
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(distances[node.id].toString(), node.x, node.y + NODE_RADIUS + 15);
      }
    });
  }, [distances, visited, currentNode, shortestPath, startNode, endNode]);

  // -- Derived display data -----------------------------------------------------
  const distanceData = graph.nodes.map((node) => ({
    key: node.id,
    node: node.id,
    distance: distances[node.id],
    previous: previous[node.id],
  }));

  const distanceColumns = [
    {
      title: 'Node',
      dataIndex: 'node',
      key: 'node',
      render: (value) => (value === currentNode ? <Text strong>{value}</Text> : value),
    },
    {
      title: 'Distance',
      dataIndex: 'distance',
      key: 'distance',
      render: (value) => (value === Infinity ? '∞' : value),
    },
    {
      title: 'Previous',
      dataIndex: 'previous',
      key: 'previous',
      render: (value) => value || '-',
    },
  ];

  const sortedQueue = [...priorityQueue].sort(
    (a, b) => (distances[a] ?? Infinity) - (distances[b] ?? Infinity)
  );
  const priorityQueueText = !hasStarted
    ? ''
    : sortedQueue.length > 0
      ? sortedQueue.map((id) => `${id} (${distances[id]})`).join(', ')
      : 'Empty';

  return (
    <PageLayout
      title="Dijkstra's Algorithm Visualizer"
      subtitle="Step through Dijkstra's shortest-path algorithm on a weighted graph - watch distances update live and trace the shortest path once it's found."
      wide
    >
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>
              Animation Speed
            </Text>
            <Select
              style={{ width: '100%' }}
              value={speed}
              onChange={handleSpeedChange}
              options={SPEED_OPTIONS}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>
              Start Node
            </Text>
            <Select
              style={{ width: '100%' }}
              value={startNode || undefined}
              placeholder="Select a node"
              onChange={handleStartNodeChange}
              options={graph.nodes.map((node) => ({ value: node.id, label: node.id }))}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>
              Target Node (optional)
            </Text>
            <Select
              style={{ width: '100%' }}
              value={endNode}
              onChange={handleEndNodeChange}
              options={[
                { value: '', label: 'None' },
                ...graph.nodes.map((node) => ({ value: node.id, label: node.id })),
              ]}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Space orientation="vertical" style={{ width: '100%' }}>
              <Button type="primary" block disabled={startDisabled} onClick={handleStart}>
                Start Visualization
              </Button>
              <Button block onClick={handleReset}>
                Reset
              </Button>
              <Button block disabled={nextDisabled} onClick={handleNextStep}>
                Next Step
              </Button>
            </Space>
          </Col>
        </Row>

        <Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
          Tip: click any node on the graph below to set it as the start or target node.
        </Paragraph>
      </Card>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <Card title="Graph Visualization">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              style={{
                width: '100%',
                height: 500,
                border: '1px solid #ddd',
                background: '#fff',
                display: 'block',
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, marginTop: 20 }}>
              {LEGEND_ITEMS.map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14 }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: item.color,
                      display: 'inline-block',
                    }}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Algorithm Progress">
            <div
              style={{
                padding: 15,
                background: '#f8f9fa',
                borderRadius: 4,
                borderLeft: '4px solid #3498db',
                minHeight: 100,
              }}
            >
              {stepMessage}
            </div>

            <Title level={5} style={{ marginTop: 20 }}>
              Distance Table
            </Title>
            <Table
              columns={distanceColumns}
              dataSource={distanceData}
              pagination={false}
              size="small"
              bordered
            />

            <Title level={5} style={{ marginTop: 20 }}>
              Current Priority Queue
            </Title>
            <div style={{ padding: 15, background: '#f8f9fa', borderRadius: 4 }}>
              {priorityQueueText}
            </div>
          </Card>
        </Col>
      </Row>
    </PageLayout>
  );
}
