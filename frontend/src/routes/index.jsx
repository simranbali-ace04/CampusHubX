// fileName: frontend/src/routes/index.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";
import { ROLES, ROUTES } from "../utils/constants";
import Layout from "../components/layout/Layout";

// Public pages
import Home from "../pages/public/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Student pages
import StudentDashboard from "../pages/student/Dashboard";
import StudentOpportunities from "../pages/student/Opportunities";
import StudentApplications from "../pages/student/Applications";
import StudentSkills from "../pages/student/Skills";
import StudentProjects from "../pages/student/Projects";
import StudentAchievements from "../pages/student/Achievements";
import StudentProfile from "../pages/student/Profile";
import OpportunityDetails from "../pages/student/OpportunityDetails";
import ApplicationDetails from "../pages/student/ApplicationDetails";

// College pages
import CollegeDashboard from "../pages/college/Dashboard";
import CollegeStudents from "../pages/college/Students";
// 👇 1. IMPORT COLLEGE PROFILE
import CollegeProfile from "../pages/college/Profile";
import CollegeVerifications from '../pages/college/Verifications';
import StudentProfileForCollege from "../pages/college/StudentProfileForCollege";


// Recruiter pages
import RecruiterDashboard from "../pages/recruiter/Dashboard";
import CreateOpportunity from "../pages/recruiter/CreateOpportunity";
import RecruiterOpportunities from "../pages/recruiter/Opportunities";
import RecruiterApplications from "../pages/recruiter/Applications";
import RecruiterProfile from "../pages/recruiter/Profile";
import RecruiterApplicationDetails from "../pages/recruiter/ApplicationDetails";

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
        path={`${ROUTES.STUDENT_APPLICATIONS}/:id`}
        element={
          <RoleRoute allowedRoles={[ROLES.STUDENT]}>
            <Layout>
              <ApplicationDetails />
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
        path={`${ROUTES.STUDENT_OPPORTUNITIES}/:id`}
        element={
          <RoleRoute allowedRoles={[ROLES.STUDENT]}>
            <Layout>
              <OpportunityDetails />
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

      <Route
        path="/student/profile"
        element={
          <RoleRoute allowedRoles={[ROLES.STUDENT]}>
            <Layout>
              <StudentProfile />
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
  path="/college/students/:id"
  element={
    <RoleRoute allowedRoles={[ROLES.COLLEGE]}>
      <Layout>
        <StudentProfileForCollege />
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
      <Route
  path="/college/verifications"
  element={
    <RoleRoute allowedRoles={[ROLES.COLLEGE]}>
      <Layout>
        <CollegeVerifications />
      </Layout>
    </RoleRoute>
  }
/>

      {/* 👇 2. ADDED COLLEGE PROFILE ROUTE */}
      <Route
        path={ROUTES.COLLEGE_PROFILE}
        element={
          <RoleRoute allowedRoles={[ROLES.COLLEGE]}>
            <Layout>
              <CollegeProfile />
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

      <Route
        path={ROUTES.RECRUITER_OPPORTUNITIES}
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <Layout>
              <RecruiterOpportunities />
            </Layout>
          </RoleRoute>
        }
      />

      <Route
        path={ROUTES.RECRUITER_PROFILE}
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <Layout>
              <RecruiterProfile />
            </Layout>
          </RoleRoute>
        }
      />

      <Route
        path={`${ROUTES.RECRUITER_OPPORTUNITIES}/create`}
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <Layout>
              <CreateOpportunity />
            </Layout>
          </RoleRoute>
        }
      />

      <Route
        path={ROUTES.RECRUITER_APPLICATIONS}
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <Layout>
              <RecruiterApplications />
            </Layout>
          </RoleRoute>
        }
      />

      <Route
        path={`${ROUTES.RECRUITER_APPLICATIONS}/:id`}
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <Layout>
              <RecruiterApplicationDetails />
            </Layout>
          </RoleRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
