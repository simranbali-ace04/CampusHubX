import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { collegesApi } from "../../services/api/colleges"; // Ensure this is imported
import Card from "../../components/common/Card/Card";
import Spinner from "../../components/common/Spinner/Spinner";
import {
  HiUserGroup,
  HiCheckCircle,
  HiClock,
  HiAcademicCap,
} from "react-icons/hi";
import { ROUTES } from "../../utils/constants";
import Badge from "../../components/common/Badge/Badge";
import { formatDate } from "../../utils/helpers";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    verifiedStudents: 0,
    pendingVerifications: 0,
    verifiedAchievements: 0,
  });
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.profile?._id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 👉 3. Call the new stats endpoint here
      const [statsRes, verificationsRes] = await Promise.all([
        collegesApi.getDashboardStats(),
        collegesApi.getPendingVerifications(),
      ]);

      // Update Stats with real data from backend
      if (statsRes?.success) {
        setStats(statsRes.data);
      }

      // Process Pending List
      const pendingAchievements = verificationsRes?.success
        ? verificationsRes.data.achievements?.data || []
        : [];
      const pendingProjects = verificationsRes?.success
        ? verificationsRes.data.projects?.data || []
        : [];

      // Combine and sort pending items
      const combined = [
        ...pendingAchievements.map((item) => ({
          ...item,
          type: "achievement",
          displayTitle: item.title,
        })),
        ...pendingProjects.map((item) => ({
          ...item,
          type: "project",
          displayTitle: item.title,
        })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPendingItems(combined);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (title) => {
    switch (title) {
      case "Total Students":
      case "Verified Students":
        navigate(ROUTES.COLLEGE_STUDENTS);
        break;
      case "Pending Verifications":
      case "Verified Achievements":
        navigate(ROUTES.COLLEGE_VERIFICATIONS);
        break;
      default:
        break;
    }
  };

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: HiUserGroup,
      color: "bg-blue-500",
      clickable: true,
    },
    {
      title: "Verified Students",
      value: stats.verifiedStudents,
      icon: HiCheckCircle,
      color: "bg-green-500",
      clickable: true,
    },
    {
      title: "Pending Verifications",
      value: stats.pendingVerifications,
      icon: HiClock,
      color: "bg-yellow-500",
      clickable: true,
    },
    {
      title: "Verified Achievements",
      value: stats.verifiedAchievements,
      icon: HiAcademicCap,
      color: "bg-purple-500",
      clickable: true,
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">College Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage students and verifications</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
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

      {/* Recent Pending Verifications List */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Recent Pending Verifications
            </h2>
            <Link
              to={ROUTES.COLLEGE_VERIFICATIONS}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
        </Card.Header>
        <Card.Body>
          {pendingItems.length > 0 ? (
            <div className="space-y-4">
              {pendingItems.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.displayTitle}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Student: {item.studentId?.firstName}{" "}
                        {item.studentId?.lastName}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Submitted: {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="info" className="capitalize">
                        {item.type}
                      </Badge>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No pending verifications
            </p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;
