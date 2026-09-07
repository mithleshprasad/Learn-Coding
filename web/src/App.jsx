import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spin } from 'antd';
import Home from './pages/Home.jsx';
import './App.css';

const ReactTutorial = lazy(() => import('./pages/ReactTutorial.jsx'));
const NodeTutorial = lazy(() => import('./pages/NodeTutorial.jsx'));
const JavaScriptTutorial = lazy(() => import('./pages/JavaScriptTutorial.jsx'));
const HtmlTutorial = lazy(() => import('./pages/HtmlTutorial.jsx'));
const MongoDbTutorial = lazy(() => import('./pages/MongoDbTutorial.jsx'));
const HrQuestions = lazy(() => import('./pages/HrQuestions.jsx'));

const Algebra = lazy(() => import('./pages/Algebra.jsx'));
const Geometry = lazy(() => import('./pages/Geometry.jsx'));
const Trigonometry = lazy(() => import('./pages/Trigonometry.jsx'));
const Calculus = lazy(() => import('./pages/Calculus.jsx'));
const Statistics = lazy(() => import('./pages/Statistics.jsx'));

const BinarySearchVisualizer = lazy(() => import('./pages/BinarySearchVisualizer.jsx'));
const DijkstraVisualizer = lazy(() => import('./pages/DijkstraVisualizer.jsx'));
const BubbleSortVisualizer = lazy(() => import('./pages/BubbleSortVisualizer.jsx'));
const MergeSortVisualizer = lazy(() => import('./pages/MergeSortVisualizer.jsx'));
const RsaVisualizer = lazy(() => import('./pages/RsaVisualizer.jsx'));
const KnnVisualizer = lazy(() => import('./pages/KnnVisualizer.jsx'));
const LinearRegressionVisualizer = lazy(() => import('./pages/LinearRegressionVisualizer.jsx'));

const CodeEditorPage = lazy(() => import('./pages/CodeEditorPage.jsx'));

function RouteFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Spin size="large" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/tutorials/react" element={<ReactTutorial />} />
        <Route path="/tutorials/node" element={<NodeTutorial />} />
        <Route path="/tutorials/javascript" element={<JavaScriptTutorial />} />
        <Route path="/tutorials/html" element={<HtmlTutorial />} />
        <Route path="/tutorials/mongodb" element={<MongoDbTutorial />} />
        <Route path="/hr-questions" element={<HrQuestions />} />

        <Route path="/math/algebra" element={<Algebra />} />
        <Route path="/math/geometry" element={<Geometry />} />
        <Route path="/math/trigonometry" element={<Trigonometry />} />
        <Route path="/math/calculus" element={<Calculus />} />
        <Route path="/math/statistics" element={<Statistics />} />

        <Route path="/visualizers/binary-search" element={<BinarySearchVisualizer />} />
        <Route path="/visualizers/dijkstra" element={<DijkstraVisualizer />} />
        <Route path="/visualizers/bubble-sort" element={<BubbleSortVisualizer />} />
        <Route path="/visualizers/merge-sort" element={<MergeSortVisualizer />} />
        <Route path="/visualizers/rsa" element={<RsaVisualizer />} />
        <Route path="/visualizers/knn" element={<KnnVisualizer />} />
        <Route path="/visualizers/linear-regression" element={<LinearRegressionVisualizer />} />

        <Route path="/code-editor" element={<CodeEditorPage />} />

        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  );
}
