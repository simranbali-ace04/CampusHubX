import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { applicationsApi } from "../../services/api/applications";
import { toast } from "react-hot-toast";
import Card from "../../components/common/Card/Card";
import Badge from "../../components/common/Badge/Badge";
import Spinner from "../../components/common/Spinner/Spinner";
import { formatDate, getStatusColor } from "../../utils/helpers";
import { ROUTES } from "../../utils/constants";
import {
  HiDownload,
  HiFilter,
  HiCheck,
  HiX,
  HiStar,
  HiOutlineBriefcase,
} from "react-icons/hi";

const Applications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all",
  );

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const filters = statusFilter !== "all" ? { status: statusFilter } : {};
      const response = await applicationsApi.getAll(filters);
      if (response.success) {
        setApplications(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await applicationsApi.updateStatus(id, newStatus);
      if (response.success) {
        toast.success(`Application ${newStatus} successfully`);
        setApplications((prev) =>
          prev.map((app) =>
            app._id === id ? { ...app, status: newStatus } : app,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    setSearchParams(value === "all" ? {} : { status: value });
  };

  const getAvatar = (student) => {
    if (student?.profilePicture) return student.profilePicture;
    const name = `${student?.firstName || "User"}+${student?.lastName || ""}`;
    return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=128`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Applications
          </h1>
          <p className="text-gray-500 mt-1">
            Review, shortlist, and hire top talent.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiFilter className="text-gray-400" />
          </div>
          <select
            value={statusFilter}
            onChange={handleFilterChange}
            className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <HiOutlineBriefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No applications found
          </h3>
          <p className="text-gray-500">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                {/* 1. Avatar & Name */}
                <div className="flex items-center gap-4 min-w-[250px]">
                  <img
                    src={getAvatar(app.studentId)}
                    alt="Student"
                    className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {app.studentId?.firstName} {app.studentId?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      Applied: {formatDate(app.appliedAt)}
                    </p>
                  </div>
                </div>

                {/* 2. Job & Score Info */}
                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
                      Role
                    </p>
                    <p
                      className="font-medium text-gray-900 truncate"
                      title={app.opportunityId?.title}
                    >
                      {app.opportunityId?.title || "Unknown Role"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
                      Match
                    </p>
                    {app.matchScore ? (
                      <span
                        className={`inline-flex items-center font-bold ${app.matchScore >= 80 ? "text-green-600" : app.matchScore >= 50 ? "text-yellow-600" : "text-red-500"}`}
                      >
                        {app.matchScore}%
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </div>
                </div>

                {/* 3. Status Badge */}
                <div className="min-w-[120px] flex justify-start lg:justify-center">
                  <Badge
                    className={`${getStatusColor(app.status)} px-3 py-1 rounded-full font-medium shadow-sm`}
                  >
                    {app.status}
                  </Badge>
                </div>

                {/* 4. Action Buttons (Updated) */}
                <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 border-gray-100 pt-4 lg:pt-0 mt-4 lg:mt-0">
                  {/* View Profile Button */}
                  <button
                    onClick={() =>
                      navigate(`${ROUTES.RECRUITER_APPLICATIONS}/${app._id}`)
                    }
                    className="px-3 py-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium border border-gray-200"
                  >
                    View Profile
                  </button>

                  {/* Resume Link */}
                  {app.resumeUrl && (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download Resume"
                    >
                      <HiDownload className="w-5 h-5" />
                    </a>
                  )}

                  {/* Logic for Status Buttons */}
                  {app.status === "pending" && (
                    <>
                      {/* ✅ REJECT BUTTON WITH TEXT */}
                      <button
                        onClick={() => handleStatusUpdate(app._id, "rejected")}
                        className="flex items-center gap-1 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                        title="Reject Candidate"
                      >
                        <HiX className="w-4 h-4" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() =>
                          handleStatusUpdate(app._id, "shortlisted")
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg font-medium transition-colors text-sm"
                        title="Shortlist Candidate"
                      >
                        <HiStar className="w-4 h-4" />
                        <span>Shortlist</span>
                      </button>
                    </>
                  )}

                  {app.status === "shortlisted" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(app._id, "rejected")}
                        className="flex items-center gap-1 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                        title="Reject"
                      >
                        <HiX className="w-4 h-4" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleStatusUpdate(app._id, "accepted")}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium shadow-sm transition-all hover:shadow-md text-sm"
                        title="Accept Candidate"
                      >
                        <HiCheck className="w-4 h-4" />
                        <span>Hire</span>
                      </button>
                    </>
                  )}

                  {(app.status === "accepted" || app.status === "rejected") && (
                    <span className="text-gray-300 text-sm italic pr-2">
                      No actions available
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
