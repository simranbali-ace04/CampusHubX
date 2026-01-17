import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';
import { ROLES, ROUTES } from '../utils/constants';
import Layout from '../components/layout/Layout';

// Public pages
import Home from '../pages/public/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Student pages
import StudentDashboard from '../pages/student/Dashboard';
import StudentOpportunities from '../pages/student/Opportunities';
import StudentApplications from '../pages/student/Applications';
import StudentSkills from '../pages/student/Skills';
import StudentProjects from '../pages/student/Projects';
import StudentAchievements from '../pages/student/Achievements';

// College pages
import CollegeDashboard from '../pages/college/Dashboard';
import CollegeStudents from '../pages/college/Students';

// Recruiter pages
import RecruiterDashboard from '../pages/recruiter/Dashboard';

// Error pages
const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-4">Page not found</p>
      <a href="/" className="text-primary-600 hover:text-primary-700">
        Go back home
      </a>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />

          {/* Student routes */}
          <Route
            path={ROUTES.STUDENT_DASHBOARD}
            element={
              <RoleRoute allowedRoles={[ROLES.STUDENT]}>
                <Layout>
                  <StudentDashboard />
                </Layout>
              </RoleRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT_OPPORTUNITIES}
            element={
              <RoleRoute allowedRoles={[ROLES.STUDENT]}>
                <Layout>
                  <StudentOpportunities />
                </Layout>
              </RoleRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT_APPLICATIONS}
            element={
              <RoleRoute allowedRoles={[ROLES.STUDENT]}>
                <Layout>
                  <StudentApplications />
                </Layout>
              </RoleRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT_SKILLS}
            element={
              <RoleRoute allowedRoles={[ROLES.STUDENT]}>
                <Layout>
                  <StudentSkills />
                </Layout>
              </RoleRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT_PROJECTS}
            element={
              <RoleRoute allowedRoles={[ROLES.STUDENT]}>
                <Layout>
                  <StudentProjects />
                </Layout>
              </RoleRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT_ACHIEVEMENTS}
            element={
              <RoleRoute allowedRoles={[ROLES.STUDENT]}>
                <Layout>
                  <StudentAchievements />
                </Layout>
              </RoleRoute>
            }
          />

          {/* College routes */}
          <Route
            path={ROUTES.COLLEGE_DASHBOARD}
            element={
              <RoleRoute allowedRoles={[ROLES.COLLEGE]}>
                <Layout>
                  <CollegeDashboard />
                </Layout>
              </RoleRoute>
            }
          />
          <Route
  path="/college/students"
  element={
    <RoleRoute allowedRoles={[ROLES.COLLEGE]}>
      <Layout>
        <CollegeStudents />
      </Layout>
    </RoleRoute>
  }
/>


          {/* Recruiter routes */}
          <Route
            path={ROUTES.RECRUITER_DASHBOARD}
            element={
              <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
                <Layout>
                  <RecruiterDashboard />
                </Layout>
              </RoleRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
