import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/Students/StudentList';
import GradeEntry from './pages/Grades/GradeEntry';
import GradeHistory from './pages/Grades/GradeHistory';
import StudentPortal from './pages/StudentPortal';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <Router>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<StudentList />} />
            <Route path="grades" element={
              <div className="space-y-8">
                <GradeEntry />
                <hr className="border-slate-200" />
                <GradeHistory />
              </div>
            } />
            <Route path="student-portal" element={<StudentPortal />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </Router>
  );
}

export default App;
