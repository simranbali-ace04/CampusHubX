import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { ROUTES, ROLES } from "../../../utils/constants";
import Avatar from "../../common/Avatar/Avatar";
import { HiMenu, HiX, HiUserCircle } from "react-icons/hi";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Derive roles directly from user object (safeguard if useRole hook doesn't exist)
  const isStudent = user?.role === ROLES.STUDENT;
  const isCollege = user?.role === ROLES.COLLEGE;
  const isRecruiter = user?.role === ROLES.RECRUITER;

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
    setMobileMenuOpen(false);
  };

  const getDashboardRoute = () => {
    if (isStudent) return ROUTES.STUDENT_DASHBOARD;
    if (isCollege) return ROUTES.COLLEGE_DASHBOARD;
    if (isRecruiter) return ROUTES.RECRUITER_DASHBOARD;
    return ROUTES.HOME;
  };

  const getProfileRoute = () => {
    if (isStudent) return ROUTES.STUDENT_PROFILE;
    if (isCollege) return ROUTES.COLLEGE_PROFILE;
    if (isRecruiter) return ROUTES.RECRUITER_PROFILE;
    return "#";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 1. LOGO */}
          <div className="flex items-center">
            <Link
              to={isAuthenticated ? getDashboardRoute() : ROUTES.HOME}
              className="flex items-center gap-2"
            >
              {/* You can place an <img> tag here for a real logo if you have one */}
              <span className="text-2xl font-bold text-primary-600">
                CampusHubX
              </span>
            </Link>
          </div>

          {/* 2. DESKTOP NAVIGATION */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to={getDashboardRoute()}
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
              >
                Dashboard
              </Link>

              {/* Student Specific Links */}
              {isStudent && (
                <>
                  <Link
                    to={ROUTES.STUDENT_OPPORTUNITIES}
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                  >
                    Opportunities
                  </Link>
                  <Link
                    to={ROUTES.STUDENT_APPLICATIONS}
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                  >
                    Applications
                  </Link>
                </>
              )}

              {/* Recruiter Specific Links (Added based on your dashboard logic) */}
              {isRecruiter && (
                <>
                  <Link
                    to={ROUTES.RECRUITER_OPPORTUNITIES}
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                  >
                    My Jobs
                  </Link>
                  <Link
                    to={ROUTES.RECRUITER_APPLICATIONS}
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                  >
                    Candidates
                  </Link>
                </>
              )}

              {/* College Specific Links */}
              {isCollege && (
                <>
                  <Link
                    to={ROUTES.COLLEGE_STUDENTS || "/college/students"}
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                  >
                    Students
                  </Link>
                  <Link
                    to={ROUTES.COLLEGE_VERIFICATIONS}
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                  >
                    Verifications
                  </Link>
                </>
              )}

              {/* RIGHT SIDE: Profile & Logout */}
              <div className="flex items-center space-x-4 border-l pl-4 border-gray-200">
                <Link
                  to={getProfileRoute()}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors group"
                >
                  <Avatar
                    name={`${user?.firstName || user?.companyName || ""} ${user?.lastName || ""}`}
                    src={user?.profilePicture || user?.logo}
                    size="sm"
                    className="group-hover:ring-2 group-hover:ring-primary-500 transition-all"
                  />
                  <span className="text-sm font-medium hidden lg:block">
                    My Profile
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </nav>
          ) : (
            // Non-Authenticated Desktop Nav
            <nav className="hidden md:flex items-center space-x-4">
              <Link
                to={ROUTES.LOGIN}
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Sign Up
              </Link>
            </nav>
          )}

          {/* 3. MOBILE MENU BUTTON */}
          <button
            className="md:hidden text-gray-700 p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <HiX className="w-6 h-6" />
            ) : (
              <HiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* 4. MOBILE MENU CONTENT */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-4">
            {isAuthenticated ? (
              <div className="flex flex-col space-y-3 px-2">
                <Link
                  to={getDashboardRoute()}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>

                {isStudent && (
                  <>
                    <Link
                      to={ROUTES.STUDENT_OPPORTUNITIES}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Opportunities
                    </Link>
                    <Link
                      to={ROUTES.STUDENT_APPLICATIONS}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Applications
                    </Link>
                  </>
                )}

                {isRecruiter && (
                  <>
                    <Link
                      to={ROUTES.RECRUITER_OPPORTUNITIES}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Jobs
                    </Link>
                    <Link
                      to={ROUTES.RECRUITER_APPLICATIONS}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Candidates
                    </Link>
                  </>
                )}

                <div className="border-t border-gray-200 my-2 pt-2">
                  <Link
                    to={getProfileRoute()}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HiUserCircle className="w-5 h-5 mr-3" />
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <span className="w-5 mr-3" /> {/* Spacer for alignment */}
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 px-2">
                <Link
                  to={ROUTES.LOGIN}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
