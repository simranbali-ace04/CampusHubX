// fileName: frontend/src/pages/student/OpportunityDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form"; // Import React Hook Form
import {
  FaMapMarkerAlt,
  FaBriefcase,
  FaMoneyBillWave,
  FaClock,
  FaBuilding,
  FaArrowLeft,
  FaCheckCircle,
  FaGlobe,
  FaPaperPlane,
} from "react-icons/fa";
import { opportunitiesApi } from "../../services/api/opportunities";
import { applicationsApi } from "../../services/api/applications";
import Spinner from "../../components/common/Spinner/Spinner";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";
import Modal from "../../components/common/Modal/Modal"; // Import Modal
import Input from "../../components/common/Input/Input"; // Import Input
import Textarea from "../../components/common/Textarea/Textarea"; // Import Textarea
import { formatDate, formatSalaryRange } from "../../utils/helpers";

const OpportunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const oppRes = await opportunitiesApi.getById(id);
      if (oppRes.success) {
        setOpportunity(oppRes.data);
      }

      try {
        const appRes = await applicationsApi.getMyApplications();
        const apps = appRes.data?.data || appRes.data || [];
        const isApplied = apps.some(
          (app) =>
            (app.opportunityId?._id === id || app.opportunityId === id) &&
            app.status !== "withdrawn",
        );
        setHasApplied(isApplied);
      } catch (err) {
        console.warn("Could not check application status");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitApplication = async (data) => {
    try {
      const payload = {
        opportunityId: id,
        coverLetter: data.coverLetter,
        resumeUrl: data.resumeUrl,
      };

      const response = await applicationsApi.create(payload);
      if (response.success) {
        toast.success("Application submitted successfully!");
        setHasApplied(true);
        setIsModalOpen(false);
        reset();
      }
    } catch (error) {
      const msg =
        error.response?.data?.error?.message || "Failed to submit application";
      toast.error(msg);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  if (!opportunity)
    return (
      <div className="text-center py-20 text-gray-500">
        Opportunity not found
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
      >
        <FaArrowLeft className="mr-2" /> Back to Opportunities
      </button>

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex gap-6">
            <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400 uppercase">
              {opportunity.recruiterId?.companyName?.slice(0, 2) || "Co"}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {opportunity.title}
              </h1>
              <div className="flex items-center text-gray-600 mt-2 text-lg">
                <FaBuilding className="mr-2 text-gray-400" />
                <span className="font-medium">
                  {opportunity.recruiterId?.companyName}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                <Badge variant="primary">{opportunity.type}</Badge>
                <Badge
                  variant={
                    opportunity.location?.type === "remote" ? "success" : "info"
                  }
                >
                  {opportunity.location?.type}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 min-w-[150px]">
            <Button
              size="lg"
              variant={hasApplied ? "success" : "primary"}
              className="w-full shadow-md"
              onClick={() => !hasApplied && setIsModalOpen(true)} // Open Modal
              disabled={hasApplied}
            >
              {hasApplied ? (
                <>
                  <FaCheckCircle className="mr-2" /> Applied
                </>
              ) : (
                "Apply Now"
              )}
            </Button>
            {opportunity.applicationDeadline && (
              <p className="text-sm text-red-500 font-medium">
                Deadline: {formatDate(opportunity.applicationDeadline)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Card.Body className="p-8 space-y-8">
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                  About the Role
                </h3>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {opportunity.description}
                </div>
              </section>
              {opportunity.responsibilities?.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                    Key Responsibilities
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    {opportunity.responsibilities.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                </section>
              )}
              {opportunity.requirements?.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                    Requirements
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    {opportunity.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </section>
              )}
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.requiredSkills?.map((skill) => (
                    <span
                      key={skill._id}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </section>
            </Card.Body>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <Card.Header className="bg-gray-50 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Job Overview</h3>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div className="flex items-start">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3">
                  <FaMoneyBillWave />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="font-medium text-gray-900">
                    {opportunity.salaryRange
                      ? formatSalaryRange(
                          opportunity.salaryRange.min,
                          opportunity.salaryRange.max,
                          opportunity.salaryRange.currency,
                        )
                      : "Not disclosed"}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg mr-3">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {opportunity.location?.city
                      ? `${opportunity.location.city}, ${opportunity.location.country}`
                      : opportunity.location?.type}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg mr-3">
                  <FaBriefcase />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Job Type</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {opportunity.type}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg mr-3">
                  <FaClock />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Posted On</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(opportunity.createdAt)}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="bg-gray-50 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">About the Company</h3>
            </Card.Header>
            <Card.Body className="space-y-4">
              <p className="text-gray-600 text-sm leading-relaxed">
                {opportunity.recruiterId?.description ||
                  "No company description available."}
              </p>
              {opportunity.recruiterId?.website && (
                <a
                  href={opportunity.recruiterId.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  <FaGlobe className="mr-2" /> Visit Website
                </a>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Apply for ${opportunity.title}`}
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
              Ensure your profile skills match the job requirements to increase
              your match score.
            </p>
          </div>

          <Textarea
            label="Cover Letter"
            placeholder="Introduce yourself and explain why you're a good fit for this role..."
            rows={6}
            {...register("coverLetter", {
              required: "Cover letter is required",
            })}
            error={errors.coverLetter?.message}
          />

          <Input
            label="Resume / Portfolio URL"
            placeholder="https://drive.google.com/..."
            {...register("resumeUrl", {
              required: "Resume URL is required",
              pattern: {
                value: /^(http|https):\/\/[^ "]+$/,
                message: "Please enter a valid URL",
              },
            })}
            error={errors.resumeUrl?.message}
            hint="Provide a link to your Resume (Google Drive, LinkedIn, Portfolio)"
          />

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
    </div>
  );
};

export default OpportunityDetails;
