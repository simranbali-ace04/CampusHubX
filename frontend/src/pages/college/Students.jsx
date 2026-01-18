import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  HiSearch,
  HiEye,
  HiCheckCircle,
  HiUserGroup,
  HiOutlineEmojiSad,
} from "react-icons/hi";

import { collegesApi } from "../../services/api/colleges";
import { useAuth } from "../../hooks/useAuth";

import Spinner from "../../components/common/Spinner/Spinner";
import Card from "../../components/common/Card/Card";
import Badge from "../../components/common/Badge/Badge";
import Avatar from "../../components/common/Avatar/Avatar";
import Button from "../../components/common/Button/Button";

export default function Students() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.profile?._id) return;

      try {
        setLoading(true);
        // Fetching all students. For large datasets, backend pagination should be implemented with search.
        const response = await collegesApi.getStudents(user.profile._id, {
          limit: 100,
        });

        const studentList =
          response.data?.data?.data ||
          response.data?.data ||
          response.data ||
          [];

        setStudents(studentList);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast.error("Failed to load students list");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  // Client-side filtering
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const lowerTerm = searchTerm.toLowerCase();

    return students.filter(
      (student) =>
        student.firstName?.toLowerCase().includes(lowerTerm) ||
        student.lastName?.toLowerCase().includes(lowerTerm) ||
        student.enrollmentNumber?.toLowerCase().includes(lowerTerm) ||
        student.branch?.toLowerCase().includes(lowerTerm),
    );
  }, [students, searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user?.profile?._id) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading profile configuration...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <HiUserGroup className="w-8 h-8 mr-3 text-indigo-600" />
            Registered Students
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view profiles of students enrolled in your college.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, branch..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area */}
      {students.length === 0 ? (
        // Empty State (No students at all)
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
            <HiUserGroup className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No students found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Your college hasn't verified any students yet or no students have
            registered with your college code.
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (
        // Empty State (No search results)
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <HiSearch className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No matches found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            We couldn't find any students matching "{searchTerm}".
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium text-sm"
          >
            Clear search
          </button>
        </div>
      ) : (
        // Students Table
        <Card className="overflow-hidden border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Student
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Academic Info
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                  >
                    Top Skills
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <Avatar
                            src={student.profilePicture}
                            alt={student.firstName}
                            size="md"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.enrollmentNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.branch || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.yearOfStudy
                          ? `${student.yearOfStudy} Year`
                          : ""}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {student.skills?.length > 0 ? (
                        <div className="flex gap-1 flex-wrap max-w-xs">
                          {student.skills.slice(0, 2).map((skill, index) => (
                            <Badge key={index} variant="secondary" size="sm">
                              {typeof skill === "object" ? skill.name : skill}
                            </Badge>
                          ))}
                          {student.skills.length > 2 && (
                            <span className="text-xs text-gray-500 flex items-center ml-1">
                              +{student.skills.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          No skills added
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.isVerifiedByCollege ? (
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/college/students/${student._id}`)
                        }
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <HiEye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-medium">{filteredStudents.length}</span> of{" "}
              <span className="font-medium">{students.length}</span> students
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
