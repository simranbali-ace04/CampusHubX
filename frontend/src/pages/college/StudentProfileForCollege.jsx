import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaCertificate,
  FaCode,
  FaCheckCircle,
  FaDownload,
} from "react-icons/fa";
import { collegesApi } from "../../services/api/colleges";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";
import Spinner from "../../components/common/Spinner/Spinner";
import Avatar from "../../components/common/Avatar/Avatar";
import { formatDate } from "../../utils/helpers";

const StudentProfileForCollege = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    fetchStudentProfile();
  }, [id]);

  const fetchStudentProfile = async () => {
    setLoading(true);
    try {
      const response = await collegesApi.getStudentById(id);
      setStudent(response.data);
    } catch (error) {
      console.error("Error loading student:", error);
      toast.error("Failed to load student profile");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStudent = async () => {
    if (!student) return;
    setVerifyingId("student");
    try {
      const newStatus = student.isVerifiedByCollege ? false : true;
      await collegesApi.verifyStudent(student._id, {
        isVerifiedByCollege: newStatus,
      });
      setStudent({ ...student, isVerifiedByCollege: newStatus });
      toast.success(
        `Student ${newStatus ? "verified" : "unverified"} successfully`,
      );
    } catch (error) {
      console.error("Error verifying student:", error);
      toast.error("Failed to update verification status");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleVerifyAchievement = async (achievementId, status) => {
    setVerifyingId(achievementId);
    try {
      await collegesApi.verifyAchievement(achievementId, { status });
      const updatedAchievements = student.achievements.map((ach) =>
        ach._id === achievementId
          ? { ...ach, verificationStatus: status }
          : ach,
      );
      setStudent({ ...student, achievements: updatedAchievements });
      toast.success(
        `Achievement ${status === "verified" ? "verified" : "rejected"}`,
      );
    } catch (error) {
      console.error("Error verifying achievement:", error);
      toast.error("Failed to verify achievement");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleVerifyProject = async (projectId, status) => {
    setVerifyingId(projectId);
    try {
      // Logic relies on backend accepting { status: 'verified' | 'rejected' }
      await collegesApi.verifyProject(projectId, { status });
      const updatedProjects = student.projects.map((proj) =>
        proj._id === projectId ? { ...proj, verificationStatus: status } : proj,
      );
      setStudent({ ...student, projects: updatedProjects });
      toast.success(
        `Project ${status === "verified" ? "verified" : "rejected"}`,
      );
    } catch (error) {
      console.error("Error verifying project:", error);
      toast.error("Failed to verify project");
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-700">Student not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="flex items-center gap-2 mb-4"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft /> Back to List
      </Button>

      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="flex items-end gap-6">
              <div className="relative">
                <Avatar
                  src={student.profilePicture}
                  alt={student.firstName}
                  size="xl"
                  className="border-4 border-white shadow-md w-32 h-32 text-4xl"
                />
                {student.isVerifiedByCollege && (
                  <div
                    className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white"
                    title="Verified Student"
                  >
                    <FaCheckCircle />
                  </div>
                )}
              </div>
              <div className="mb-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {student.firstName} {student.lastName}
                </h1>
                <p className="text-gray-600 font-medium">
                  {student.enrollmentNumber} • {student.branch} (
                  {student.yearOfStudy})
                </p>
              </div>
            </div>
            <div className="flex gap-3 mb-1">
              <Button
                variant={student.isVerifiedByCollege ? "danger" : "success"}
                onClick={handleVerifyStudent}
                disabled={verifyingId === "student"}
              >
                {student.isVerifiedByCollege
                  ? "Revoke Verification"
                  : "Verify Student"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Contact Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                  <FaEnvelope className="text-gray-400" />
                  <a
                    href={`mailto:${student.email}`}
                    className="hover:text-primary-600"
                  >
                    {student.email}
                  </a>
                </div>
                {student.phoneNumber && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaPhone className="text-gray-400" />
                    <span>{student.phoneNumber}</span>
                  </div>
                )}
                {student.address && (
                  <div className="flex items-start gap-3 text-gray-600">
                    <FaMapMarkerAlt className="text-gray-400 mt-1" />
                    <span>
                      {student.address.city}, {student.address.state}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                {student.socialLinks?.linkedin && (
                  <a
                    href={student.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#0077b5] transition-colors text-2xl"
                  >
                    <FaLinkedin />
                  </a>
                )}
                {student.socialLinks?.github && (
                  <a
                    href={student.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-900 transition-colors text-2xl"
                  >
                    <FaGithub />
                  </a>
                )}
                {student.socialLinks?.portfolio && (
                  <a
                    href={student.socialLinks.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary-600 transition-colors text-2xl"
                  >
                    <FaGlobe />
                  </a>
                )}
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {student.cgpa || "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 font-medium uppercase">
                    CGPA
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {student.attendance || "0"}%
                  </div>
                  <div className="text-xs text-gray-500 font-medium uppercase">
                    Attendance
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {student.skills?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500 font-medium uppercase">
                    Skills
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 border-b pb-2 mb-3">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {student.skills && student.skills.length > 0 ? (
                    student.skills.map((skill, index) => (
                      <Badge key={index} variant="primary">
                        {typeof skill === "object" ? skill.name : skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No skills added yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaCode className="text-primary-600" /> Projects
            </h2>
          </div>

          {student.projects && student.projects.length > 0 ? (
            student.projects.map((project) => (
              <Card
                key={project._id}
                className="border-l-4 border-l-primary-500"
              >
                <Card.Body>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900">{project.title}</h3>
                    <Badge
                      variant={
                        project.verificationStatus === "verified"
                          ? "success"
                          : project.verificationStatus === "rejected"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {project.verificationStatus || "pending"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex gap-3 text-sm">
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          Repo
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          Live Demo
                        </a>
                      )}
                    </div>
                    {(!project.verificationStatus ||
                      project.verificationStatus === "pending") && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            handleVerifyProject(project._id, "rejected")
                          }
                          disabled={verifyingId === project._id}
                        >
                          Reject
                        </Button>
                        {/* ✅ CHANGED: Variant updated to "primary" for blue color */}
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            handleVerifyProject(project._id, "verified")
                          }
                          disabled={verifyingId === project._id}
                        >
                          Verify
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))
          ) : (
            <Card>
              <Card.Body className="text-center py-8 text-gray-500">
                No projects added yet.
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Achievements Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaCertificate className="text-orange-500" /> Achievements
            </h2>
          </div>

          {student.achievements && student.achievements.length > 0 ? (
            student.achievements.map((ach) => (
              <Card key={ach._id} className="border-l-4 border-l-orange-500">
                <Card.Body>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900">{ach.title}</h3>
                    <Badge
                      variant={
                        ach.verificationStatus === "verified"
                          ? "success"
                          : ach.verificationStatus === "rejected"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {ach.verificationStatus || "pending"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(ach.date)}
                  </p>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    {ach.proofUrl && (
                      <a
                        href={ach.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                      >
                        <FaDownload size={12} /> View Proof
                      </a>
                    )}
                    {(!ach.verificationStatus ||
                      ach.verificationStatus === "pending") && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            handleVerifyAchievement(ach._id, "rejected")
                          }
                          disabled={verifyingId === ach._id}
                        >
                          Reject
                        </Button>
                        {/* ✅ CHANGED: Variant updated to "primary" for blue color */}
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            handleVerifyAchievement(ach._id, "verified")
                          }
                          disabled={verifyingId === ach._id}
                        >
                          Verify
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))
          ) : (
            <Card>
              <Card.Body className="text-center py-8 text-gray-500">
                No achievements added yet.
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfileForCollege;
