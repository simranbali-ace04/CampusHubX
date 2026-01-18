import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { recruitersApi } from "../../services/api/recruiters";
import { applicationsApi } from "../../services/api/applications";
import Card from "../../components/common/Card/Card";
import Spinner from "../../components/common/Spinner/Spinner";
import Button from "../../components/common/Button/Button";
import {
  HiBriefcase,
  HiClipboardCheck,
  HiUsers,
  HiChartBar,
  HiPlus,
} from "react-icons/hi";
import { ROUTES } from "../../utils/constants";
import Badge from "../../components/common/Badge/Badge";
import { formatDate, getStatusColor } from "../../utils/helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeOpportunities: 0,
    totalApplications: 0,
    pendingReviews: 0,
    averageMatchScore: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardResponse, applicationsResponse] = await Promise.all([
        recruitersApi.getDashboard(),
        applicationsApi.getAll({ limit: 5 }),
      ]);

      if (dashboardResponse?.success) {
        const statsData = dashboardResponse.data?.stats || {};
        setStats({
          activeOpportunities: statsData.activeOpportunities || 0,
          totalApplications: statsData.totalApplications || 0,
          pendingReviews: statsData.pendingApplications || 0,
          averageMatchScore: statsData.averageMatchScore || 0,
        });
      }

      if (applicationsResponse?.success) {
        setRecentApplications(applicationsResponse.data || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update the handleCardClick function
  const handleCardClick = (title) => {
    switch (title) {
      case "Active Opportunities":
        navigate(ROUTES.RECRUITER_OPPORTUNITIES);
        break;
      case "Total Applications":
        // Go to applications page with NO filter (shows all)
        navigate(ROUTES.RECRUITER_APPLICATIONS);
        break;
      case "Pending Reviews":
        // Go to applications page with FILTER for pending
        navigate(`${ROUTES.RECRUITER_APPLICATIONS}?status=pending`);
        break;
      default:
        break;
    }
  };
  
  const statCards = [
    {
      title: "Active Opportunities",
      value: stats.activeOpportunities,
      icon: HiBriefcase,
      color: "bg-blue-500",
      clickable: true, // Mark as clickable
    },
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: HiClipboardCheck,
      color: "bg-green-500",
      clickable: true,
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews,
      icon: HiUsers,
      color: "bg-yellow-500",
      clickable: true,
    },
    {
      title: "Avg Match Score",
      value: `${stats.averageMatchScore}%`,
      icon: HiChartBar,
      color: "bg-purple-500",
      clickable: false, // Usually just a stat, but can be clickable if you have a page for it
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Recruiter Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage opportunities and applications
          </p>
        </div>
        <Button
          onClick={() => navigate(`${ROUTES.RECRUITER_OPPORTUNITIES}/create`)}
        >
          <HiPlus className="w-5 h-5 mr-2" />
          Post Opportunity
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            // --- NEW: Add Click Handler & Pointer Cursor ---
            onClick={() => stat.clickable && handleCardClick(stat.title)}
            className={
              stat.clickable
                ? "cursor-pointer transition-transform hover:scale-105"
                : ""
            }
          >
            <Card hover={stat.clickable}>
              <Card.Body>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {/* Recent Applications List */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
            <Link
              to={ROUTES.RECRUITER_APPLICATIONS}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
        </Card.Header>
        <Card.Body>
          {recentApplications.length > 0 ? (
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div
                  key={application._id}
                  className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {application.opportunityId?.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {application.studentId?.firstName}{" "}
                        {application.studentId?.lastName}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied: {formatDate(application.appliedAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {application.matchScore && (
                        <span className="text-sm font-medium text-primary-600">
                          {application.matchScore}% match
                        </span>
                      )}
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No applications yet
            </p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;
