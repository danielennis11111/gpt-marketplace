import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProjectDetail from './components/ProjectDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/project/:id" element={<ProjectDetail />} />
    </Routes>
  );
}

export default App; 