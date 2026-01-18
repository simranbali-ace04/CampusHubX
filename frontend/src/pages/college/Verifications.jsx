import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  HiSearch,
  HiCheckCircle,
  HiShieldCheck,
  HiOutlineEmojiSad,
  HiEye,
} from "react-icons/hi";

import axios from "../../services/api/client"; // Keeping direct axios for the verify call not in service yet
import { collegesApi } from "../../services/api/colleges";
import { useAuth } from "../../hooks/useAuth";

import Spinner from "../../components/common/Spinner/Spinner";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";
import Avatar from "../../components/common/Avatar/Avatar";

export default function Verifications() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [verifyingId, setVerifyingId] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchStudents = async () => {
      const collegeId = user?.profile?._id;
      if (!collegeId) return;

      try {
        setLoading(true);
        // Reuse the existing service method
        const res = await collegesApi.getStudents(collegeId, { limit: 1000 });

        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];

        setStudents(list);
      } catch (error) {
        console.error("Failed to fetch students", error);
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  const handleApprove = async (studentId) => {
    setVerifyingId(studentId);
    try {
      await axios.post(`/api/colleges/verify-student/${studentId}`);

      toast.success("Student verified successfully!");

      // Update local state instantly
      setStudents((prev) =>
        prev.map((s) =>
          s._id === studentId ? { ...s, isVerifiedByCollege: true } : s,
        ),
      );
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        s.firstName?.toLowerCase().includes(searchLower) ||
        s.lastName?.toLowerCase().includes(searchLower) ||
        s.enrollmentNumber?.toLowerCase().includes(searchLower) ||
        s.branch?.toLowerCase().includes(searchLower)
      );
    });
  }, [students, searchTerm]);

  // Sort: Pending first, then Verified
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      if (a.isVerifiedByCollege === b.isVerifiedByCollege) return 0;
      return a.isVerifiedByCollege ? 1 : -1;
    });
  }, [filteredStudents]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <HiShieldCheck className="w-8 h-8 mr-3 text-indigo-600" />
            Verify Students
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Confirm enrollment for registered students.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search student..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {students.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
            <HiShieldCheck className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No students found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            No students have registered with your college yet.
          </p>
        </div>
      ) : sortedStudents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <HiOutlineEmojiSad className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No matches found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your search terms.
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium text-sm"
          >
            Clear search
          </button>
        </div>
      ) : (
        <Card className="overflow-hidden border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Student Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Branch & Year
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Enrollment No
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStudents.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <Avatar
                            src={s.profilePicture}
                            alt={s.firstName}
                            size="md"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {s.firstName} {s.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {s.branch || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {s.yearOfStudy ? `${s.yearOfStudy} Year` : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.enrollmentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {s.isVerifiedByCollege ? (
                        <Badge
                          variant="success"
                          size="sm"
                          className="inline-flex items-center"
                        >
                          <HiCheckCircle className="mr-1 w-3 h-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/college/students/${s._id}`)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <HiEye className="w-4 h-4 mr-1" />
                          Profile
                        </Button>

                        {s.isVerifiedByCollege ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="bg-green-50 text-green-700 border-green-200 cursor-default opacity-100"
                          >
                            <HiCheckCircle className="w-4 h-4 mr-1" />
                            Approved
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(s._id)}
                            isLoading={verifyingId === s._id}
                            disabled={verifyingId !== null}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                          >
                            Verify Student
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-medium">{sortedStudents.length}</span>{" "}
              students
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
