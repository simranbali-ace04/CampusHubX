import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBriefcase,
  FaMoneyBillWave,
  FaCheckCircle,
  FaPaperPlane,
} from "react-icons/fa";
import { opportunitiesApi } from "../../services/api/opportunities";
import { applicationsApi } from "../../services/api/applications";
import Card from "../../components/common/Card/Card";
import Spinner from "../../components/common/Spinner/Spinner";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import Badge from "../../components/common/Badge/Badge";
import Button from "../../components/common/Button/Button";
import Input from "../../components/common/Input/Input"; // Kept for Search Bar
import Select from "../../components/common/Select/Select";
import Modal from "../../components/common/Modal/Modal";
import { formatSalaryRange, formatDate } from "../../utils/helpers";
import {
  ROUTES,
  OPPORTUNITY_TYPES,
  LOCATION_TYPES,
} from "../../utils/constants";

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Modal & Selection State
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    type: "",
    locationType: "",
    search: "",
  });

  // Form Setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const oppResponse = await opportunitiesApi.getAll(filters);
      setOpportunities(oppResponse.data?.data || []);

      try {
        const appResponse = await applicationsApi.getMyApplications();
        const apps = appResponse.data?.data || appResponse.data || [];

        const ids = new Set(
          apps
            .filter((app) => app.status !== "withdrawn")
            .map((app) =>
              typeof app.opportunityId === "object"
                ? app.opportunityId._id
                : app.opportunityId,
            ),
        );
        setAppliedIds(ids);
      } catch (err) {
        console.warn("Could not fetch user applications", err);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  // Handle "Apply Now" Click
  const handleApplyClick = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsModalOpen(true);
    reset(); // Clear previous form data
  };

  // Handle Form Submission
  const onSubmitApplication = async (data) => {
    if (!selectedOpportunity) return;

    try {
      const payload = {
        opportunityId: selectedOpportunity._id,
        coverLetter: data.coverLetter,
        resumeUrl: data.resumeUrl,
      };

      const response = await applicationsApi.create(payload);

      if (response.success) {
        toast.success("Applied successfully!");
        setAppliedIds((prev) => new Set(prev).add(selectedOpportunity._id));
        setIsModalOpen(false);
        reset();
      }
    } catch (error) {
      const msg = error.response?.data?.error?.message || "Failed to apply";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900">
          Explore Opportunities
        </h1>
        <p className="mt-2 text-gray-600">
          Find your dream internship or full-time role from top recruiters.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Custom Input works here because it is Controlled (has value/onChange) */}
          <Input
            icon={FaSearch}
            placeholder="Search by role or company..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            placeholder="All Job Types"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            options={[
              { value: "", label: "All Job Types" },
              ...Object.values(OPPORTUNITY_TYPES).map((type) => ({
                value: type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
              })),
            ]}
          />
          <Select
            placeholder="All Locations"
            value={filters.locationType}
            onChange={(e) =>
              setFilters({ ...filters, locationType: e.target.value })
            }
            options={[
              { value: "", label: "All Locations" },
              ...Object.values(LOCATION_TYPES).map((loc) => ({
                value: loc,
                label: loc.charAt(0).toUpperCase() + loc.slice(1),
              })),
            ]}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : opportunities.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {opportunities.map((opportunity) => {
            const isApplied = appliedIds.has(opportunity._id);

            return (
              <Card
                key={opportunity._id}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <Card.Body className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="hidden md:flex flex-shrink-0">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xl uppercase">
                        {opportunity.recruiterId?.companyName?.slice(0, 2) ||
                          "Co"}
                      </div>
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link
                            to={`${ROUTES.STUDENT_OPPORTUNITIES}/${opportunity._id}`}
                            className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
                          >
                            {opportunity.title}
                          </Link>
                          <p className="text-gray-600 font-medium">
                            {opportunity.recruiterId?.companyName}
                          </p>
                        </div>
                        {isApplied && (
                          <Badge
                            variant="success"
                            className="flex items-center gap-1"
                          >
                            <FaCheckCircle className="text-xs" /> Applied
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaBriefcase className="text-gray-400" />
                          <span className="capitalize">{opportunity.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-gray-400" />
                          <span className="capitalize">
                            {opportunity.location?.type}
                          </span>
                        </div>
                        {opportunity.salaryRange && (
                          <div className="flex items-center gap-1">
                            <FaMoneyBillWave className="text-gray-400" />
                            <span>
                              {formatSalaryRange(
                                opportunity.salaryRange.min,
                                opportunity.salaryRange.max,
                                opportunity.salaryRange.currency,
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-gray-600 mt-4 line-clamp-2 text-sm">
                        {opportunity.description}
                      </p>

                      <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-400">
                          Posted {formatDate(opportunity.createdAt)}
                        </div>
                        <div className="flex gap-3">
                          <Link
                            to={`${ROUTES.STUDENT_OPPORTUNITIES}/${opportunity._id}`}
                          >
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          <Button
                            variant={isApplied ? "ghost" : "primary"}
                            size="sm"
                            disabled={isApplied}
                            onClick={() =>
                              !isApplied && handleApplyClick(opportunity)
                            }
                          >
                            {isApplied ? "Applied" : "Apply Now"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No opportunities found"
          message="Try adjusting your filters to find what you're looking for."
          icon={FaSearch}
        />
      )}

      {/* Application Modal */}
      {selectedOpportunity && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Apply for ${selectedOpportunity.title}`}
          size="lg"
        >
          <form
            onSubmit={handleSubmit(onSubmitApplication)}
            className="space-y-6"
          >
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">
              <h4 className="font-semibold mb-1">
                Make your application stand out!
              </h4>
              <p>
                Ensure your profile skills match the job requirements to
                increase your match score.
              </p>
            </div>

            {/* Replaced Custom Textarea with Native HTML to fix ref issue */}
            <div className="w-full">
              <label
                htmlFor="coverLetter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cover Letter
              </label>
              <textarea
                id="coverLetter"
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-y ${
                  errors.coverLetter ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Introduce yourself..."
                {...register("coverLetter", {
                  required: "Cover letter is required",
                })}
              />
              {errors.coverLetter && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.coverLetter.message}
                </p>
              )}
            </div>

            {/* Replaced Custom Input with Native HTML to fix ref issue */}
            <div className="w-full">
              <label
                htmlFor="resumeUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Resume / Portfolio URL
              </label>
              <input
                id="resumeUrl"
                type="text"
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.resumeUrl ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="https://drive.google.com/..."
                {...register("resumeUrl", {
                  required: "Resume URL is required",
                  pattern: {
                    value: /^(http|https):\/\/[^ "]+$/,
                    message: "Please enter a valid URL",
                  },
                })}
              />
              {errors.resumeUrl && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.resumeUrl.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Link to your Resume (Google Drive, LinkedIn, etc)
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting} className="px-8">
                <FaPaperPlane className="mr-2" /> Submit Application
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Opportunities;
