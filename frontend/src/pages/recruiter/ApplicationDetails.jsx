// fileName: frontend/src/pages/recruiter/ApplicationDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { applicationsApi } from "../../services/api/applications";
import { toast } from "react-hot-toast";
import Spinner from "../../components/common/Spinner/Spinner";
import Badge from "../../components/common/Badge/Badge";
import Button from "../../components/common/Button/Button";
import Card from "../../components/common/Card/Card";
import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaLinkedin,
  FaGithub,
  FaLink,
  FaCheck,
  FaTimes,
  FaStar,
  FaDownload,
  FaUniversity,
} from "react-icons/fa";
import { formatDate, getStatusColor } from "../../utils/helpers";

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await applicationsApi.getById(id);
      if (response.success) {
        setApplication(response.data);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    setUpdating(true);
    try {
      const response = await applicationsApi.updateStatus(id, status);
      if (response.success) {
        toast.success(`Candidate marked as ${status}`);
        setApplication((prev) => ({ ...prev, status }));
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  if (!application)
    return <div className="text-center py-20">Application not found</div>;

  const {
    studentId: student,
    opportunityId: job,
    status,
    matchScore,
  } = application;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-primary-600"
      >
        <FaArrowLeft className="mr-2" /> Back to Applications
      </button>

      {/* Header Card: Candidate Summary & Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-5">
            <img
              src={
                student.profilePicture ||
                `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random`
              }
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-gray-500">
                Applying for{" "}
                <span className="font-semibold text-primary-600">
                  {job.title}
                </span>
              </p>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={getStatusColor(status)}>{status}</Badge>
                <span className="text-sm text-gray-400">
                  • Applied {formatDate(application.appliedAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            {matchScore && (
              <div className="text-right mb-1">
                <span
                  className={`text-3xl font-bold ${matchScore >= 80 ? "text-green-600" : matchScore >= 50 ? "text-yellow-500" : "text-red-500"}`}
                >
                  {matchScore}%
                </span>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Match Score
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate("rejected")}
                    loading={updating}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <FaTimes className="mr-2" /> Reject
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleStatusUpdate("shortlisted")}
                    loading={updating}
                    className="text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                  >
                    <FaStar className="mr-2" /> Shortlist
                  </Button>
                </>
              )}
              {status === "shortlisted" && (
                <Button
                  variant="primary"
                  onClick={() => handleStatusUpdate("accepted")}
                  loading={updating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FaCheck className="mr-2" /> Hire Candidate
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Application Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Letter */}
          <Card>
            <Card.Header>
              <h3 className="font-semibold text-gray-900">Cover Letter</h3>
            </Card.Header>
            <Card.Body>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {application.coverLetter || (
                  <span className="text-gray-400 italic">
                    No cover letter provided.
                  </span>
                )}
              </p>
            </Card.Body>
          </Card>

          {/* Resume Link */}
          <Card>
            <Card.Header>
              <h3 className="font-semibold text-gray-900">Attachments</h3>
            </Card.Header>
            <Card.Body>
              {application.resumeUrl ? (
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 group transition-all"
                >
                  <div className="p-3 bg-red-100 text-red-600 rounded-lg mr-4 group-hover:bg-red-200">
                    <FaDownload size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-primary-600">
                      Resume / CV
                    </h4>
                    <p className="text-sm text-gray-500">
                      Click to view or download
                    </p>
                  </div>
                </a>
              ) : (
                <p className="text-gray-400 italic">No resume attached.</p>
              )}
            </Card.Body>
          </Card>

          {/* Projects Snapshot */}
          <Card>
            <Card.Header>
              <h3 className="font-semibold text-gray-900">
                Candidate Projects
              </h3>
            </Card.Header>
            <Card.Body>
              {student.projects && student.projects.length > 0 ? (
                <div className="space-y-4">
                  {student.projects.map((project) => (
                    <div
                      key={project._id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900">
                          {project.title}
                        </h4>
                        {project.projectUrl && (
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary-600 text-sm hover:underline flex items-center"
                          >
                            View <FaLink className="ml-1" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {project.technologies?.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">No projects listed.</p>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Right Column: Candidate Profile Snapshot */}
        <div className="space-y-6">
          {/* Contact & Education */}
          <Card>
            <Card.Header>
              <h3 className="font-semibold text-gray-900">Candidate Details</h3>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Contact</p>
                <a
                  href={`mailto:${student.userId?.email}`}
                  className="flex items-center text-gray-900 hover:text-primary-600"
                >
                  <FaEnvelope className="mr-2 text-gray-400" />{" "}
                  {student.userId?.email || "Email Hidden"}
                </a>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-1">Education</p>
                <div className="flex items-start">
                  <FaUniversity className="mr-2 mt-1 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {student.collegeId?.name || "Unknown College"}
                    </p>
                    <p className="text-sm text-gray-600">{student.branch}</p>
                    <p className="text-xs text-gray-500">
                      Year {student.yearOfStudy}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Social Profiles</p>
                <div className="flex gap-3">
                  {student.socialLinks?.linkedin && (
                    <a
                      href={student.socialLinks.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-700 bg-blue-50 p-2 rounded-lg"
                    >
                      <FaLinkedin size={20} />
                    </a>
                  )}
                  {student.socialLinks?.github && (
                    <a
                      href={student.socialLinks.github}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-800 hover:text-black bg-gray-100 p-2 rounded-lg"
                    >
                      <FaGithub size={20} />
                    </a>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Skills */}
          <Card>
            <Card.Header>
              <h3 className="font-semibold text-gray-900">Skills</h3>
            </Card.Header>
            <Card.Body>
              <div className="flex flex-wrap gap-2">
                {student.skills?.map((skill) => (
                  <span
                    key={skill._id}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {skill.name}
                  </span>
                ))}
                {(!student.skills || student.skills.length === 0) && (
                  <p className="text-gray-400 italic text-sm">
                    No skills added.
                  </p>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
