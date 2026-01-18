import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { applicationsApi } from "../../services/api/applications";
import { toast } from "react-hot-toast";
import Card from "../../components/common/Card/Card";
import Badge from "../../components/common/Badge/Badge";
import Button from "../../components/common/Button/Button";
import Spinner from "../../components/common/Spinner/Spinner";
import Select from "../../components/common/Select/Select";
import { formatDate, getStatusColor } from "../../utils/helpers";
import { APPLICATION_STATUS } from "../../utils/constants";
import { HiDownload, HiExternalLink, HiFilter } from "react-icons/hi";

const Applications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get initial status from URL (e.g. ?status=pending) or default to 'all'
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all",
  );

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Build filters
      const filters = {};
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }

      const response = await applicationsApi.getAll(filters);

      if (response.success) {
        // --- FIX IS HERE ---
        // The API returns { data: { data: [...], pagination: {...} } }
        // We must access response.data.data to get the actual array
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
        // Refresh list or update local state
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

  // Update URL when filter changes
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    setSearchParams(value === "all" ? {} : { status: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600">
            Review and manage student applications
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <HiFilter className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={handleFilterChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
          >
            <option value="all">All Applications</option>
            <option value="pending">Pending Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-10">
            <p className="text-gray-500">
              No applications found matching your criteria.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app._id}>
              <Card.Body>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Student Info */}
                  <div className="flex-shrink-0">
                    <img
                      src={
                        app.studentId?.profilePicture ||
                        "https://via.placeholder.com/100"
                      }
                      alt="Student"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  </div>

                  <div className="flex-grow space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {app.studentId?.firstName} {app.studentId?.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Applied for:{" "}
                          <span className="font-medium text-primary-600">
                            {app.opportunityId?.title}
                          </span>
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>Applied: {formatDate(app.appliedAt)}</span>
                          {app.matchScore && (
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              {app.matchScore}% Match
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(app.status)}>
                        {app.status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Actions / Details */}
                    <div className="pt-2 flex flex-wrap gap-3 items-center border-t border-gray-100 mt-3">
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <HiDownload className="mr-1" /> Resume
                        </a>
                      )}

                      {/* Review Buttons - Only show if status is not final */}
                      <div className="flex-grow flex justify-end gap-2">
                        {app.status === "pending" && (
                          <>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                handleStatusUpdate(app._id, "shortlisted")
                              }
                            >
                              Shortlist
                            </Button>
                            <Button
                              size="xs"
                              variant="danger"
                              onClick={() =>
                                handleStatusUpdate(app._id, "rejected")
                              }
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {app.status === "shortlisted" && (
                          <Button
                            size="xs"
                            onClick={() =>
                              handleStatusUpdate(app._id, "accepted")
                            }
                          >
                            Accept Candidate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
