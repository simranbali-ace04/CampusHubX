import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  HiArrowLeft,
  HiAcademicCap,
  HiBriefcase,
  HiCheckCircle,
  HiCode,
  HiUser,
  HiOfficeBuilding,
  HiCalendar,
  HiExternalLink,
} from "react-icons/hi";

import axios from "../../services/api/client";
import Spinner from "../../components/common/Spinner/Spinner";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";
import Avatar from "../../components/common/Avatar/Avatar";
import { formatDate } from "../../utils/helpers";

export default function StudentProfileForCollege() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);

  const fetchEverything = async () => {
    try {
      setLoading(true);
      // Parallel fetch for speed
      const [studentRes, pendingRes] = await Promise.all([
        axios.get(`/api/students/${id}`),
        axios.get(`/api/achievements/pending`),
      ]);

      const studentData = studentRes.data?.data;
      const studentAchievements = Array.isArray(studentData?.achievements)
        ? studentData.achievements
        : [];

      const allPending = Array.isArray(pendingRes.data?.data?.data)
        ? pendingRes.data.data.data
        : [];

      // Filter pending only for THIS student
      const myPending = allPending.filter((a) => a.studentId?._id === id);

      // Merge avoiding duplicates
      const merged = [
        ...studentAchievements,
        ...myPending.filter(
          (p) => !studentAchievements.some((a) => a._id === p._id),
        ),
      ];

      setStudent(studentData);
      setAchievements(merged);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load student profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEverything();
  }, [id]);

  const verifyAchievement = async (achievementId) => {
    setVerifyingId(achievementId);
    try {
      await axios.post(`/api/achievements/${achievementId}/verify`, {
        status: "verified",
        comments: "Verified by college",
      });

      toast.success("Achievement verified successfully");

      // Optimistic update
      setAchievements((prev) =>
        prev.map((a) =>
          a._id === achievementId
            ? { ...a, verificationStatus: "verified" }
            : a,
        ),
      );
    } catch (e) {
      console.error("Verify error:", e.response?.data || e);
      toast.error("Verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Student not found
        </h2>
        <Button onClick={() => navigate("/college/students")}>
          Go Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 h-16 flex items-center shadow-sm">
        <Button
          variant="ghost"
          onClick={() => navigate("/college/students")}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <HiArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-lg font-semibold text-gray-800">Student Profile</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Header Block */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden relative">
          {/* Cover Banner */}
          <div className="h-40 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="relative flex flex-col sm:flex-row items-start">
              {/* Avatar - Absolutely positioned to overlap header and body */}
              <div className="-mt-16 mb-4 sm:mb-0 relative z-10">
                <div className="rounded-full p-1 bg-white shadow-md">
                  <Avatar
                    src={student.profilePicture}
                    alt={student.firstName}
                    size="xl" // Ensure this maps to w-32 h-32 in your Avatar component
                    className="w-32 h-32 object-cover rounded-full border-4 border-white"
                  />
                </div>
              </div>

              {/* Header Info */}
              <div className="sm:ml-6 mt-4 sm:mt-2 flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                      {student.firstName} {student.lastName}
                      {student.isVerifiedByCollege && (
                        <HiCheckCircle
                          className="w-6 h-6 text-blue-500"
                          title="Verified Student"
                        />
                      )}
                    </h1>
                    <p className="text-gray-500 font-medium flex items-center mt-1">
                      <HiCode className="w-4 h-4 mr-1" />
                      {student.enrollmentNumber}
                    </p>
                  </div>

                  {student.isVerifiedByCollege ? (
                    <Badge
                      variant="success"
                      size="lg"
                      className="self-start sm:self-center"
                    >
                      <HiCheckCircle className="w-4 h-4 mr-2" />
                      Enrollment Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="warning"
                      size="lg"
                      className="self-start sm:self-center"
                    >
                      Verification Pending
                    </Badge>
                  )}
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center text-gray-700">
                    <div className="p-2 bg-blue-50 rounded-lg mr-3 text-blue-600">
                      <HiAcademicCap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Branch
                      </p>
                      <p className="font-medium">
                        {student.branch || "Not Specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="p-2 bg-purple-50 rounded-lg mr-3 text-purple-600">
                      <HiCalendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Year
                      </p>
                      <p className="font-medium">
                        {student.yearOfStudy
                          ? `${student.yearOfStudy} Year`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="p-2 bg-orange-50 rounded-lg mr-3 text-orange-600">
                      <HiOfficeBuilding className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        College
                      </p>
                      <p
                        className="font-medium truncate max-w-[150px]"
                        title={student.collegeName}
                      >
                        {student.collegeName || "CampusHub"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Skills & Projects */}
          <div className="space-y-8">
            <Card>
              <Card.Header className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <HiCode className="w-5 h-5 mr-2 text-indigo-500" />
                  Skills
                </h3>
              </Card.Header>
              <Card.Body className="pt-4">
                {student.skills?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((s, i) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1">
                        {typeof s === "object" ? s.name : s}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">No skills added</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card>
              <Card.Header className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <HiBriefcase className="w-5 h-5 mr-2 text-indigo-500" />
                  Projects
                </h3>
              </Card.Header>
              <Card.Body className="pt-4 space-y-4">
                {student.projects?.length ? (
                  student.projects.map((p) => (
                    <div
                      key={p._id}
                      className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-semibold text-gray-900 pr-6">
                        {p.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {p.description}
                      </p>
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute top-4 right-4 text-gray-400 hover:text-blue-600"
                        >
                          <HiExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">No projects added</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>

          {/* Right Column: Achievements & Verification */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Achievements & Certifications
              </h2>
              <Badge variant="info">{achievements.length} Total</Badge>
            </div>

            {achievements.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <HiAcademicCap className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No Achievements Yet
                </h3>
                <p className="text-gray-500 mt-1">
                  This student hasn't uploaded any achievements or
                  certifications.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {achievements.map((a) => {
                  const isVerified = a.verificationStatus === "verified";

                  return (
                    <div
                      key={a._id}
                      className={`relative bg-white rounded-xl p-5 border transition-all duration-200 ${
                        isVerified
                          ? "border-green-200 shadow-sm"
                          : "border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      {/* Status Stripe */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${isVerified ? "bg-green-500" : "bg-yellow-400"}`}
                      ></div>

                      <div className="pl-4 flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {a.title}
                            </h4>
                            {isVerified ? (
                              <Badge
                                variant="success"
                                size="sm"
                                className="sm:hidden"
                              >
                                Verified
                              </Badge>
                            ) : (
                              <Badge
                                variant="warning"
                                size="sm"
                                className="sm:hidden"
                              >
                                Pending
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mt-2 mb-3">
                            {a.description}
                          </p>

                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              <span className="font-semibold text-gray-700">
                                Type:
                              </span>{" "}
                              {a.type}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              <span className="font-semibold text-gray-700">
                                Issuer:
                              </span>{" "}
                              {a.issuer}
                            </span>
                            {a.issueDate && (
                              <span className="bg-gray-100 px-2 py-1 rounded">
                                <span className="font-semibold text-gray-700">
                                  Date:
                                </span>{" "}
                                {formatDate(a.issueDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Section */}
                        <div className="flex items-center sm:w-40 justify-end flex-shrink-0">
                          {isVerified ? (
                            <div className="hidden sm:flex flex-col items-end text-green-600">
                              <div className="flex items-center font-medium bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                <HiCheckCircle className="w-4 h-4 mr-1.5" />
                                Verified
                              </div>
                              <span className="text-xs text-green-700/60 mt-1 mr-2">
                                by College
                              </span>
                            </div>
                          ) : (
                            <Button
                              onClick={() => verifyAchievement(a._id)}
                              disabled={verifyingId === a._id}
                              isLoading={verifyingId === a._id}
                              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                              size="sm"
                            >
                              Verify Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
