import {
  asyncHandler,
  formatResponse,
  paginate,
  formatPaginationResponse,
} from "../utils/helpers.js";
import College from "../models/College.js";
import Student from "../models/Student.js";
import Achievement from "../models/Achievement.js";
import Project from "../models/Project.js";
import { ACHIEVEMENT_STATUS } from "../utils/constants.js";

// ... [Keep existing functions: getAllColleges, getCollegeById, updateOwnProfile, getDashboardStats, getCollegeStudents, getPendingVerifications, verifyStudentEnrollment] ...

export const getAllColleges = asyncHandler(async (req, res) => {
  const { page, limit } = paginate(req.query.page, req.query.limit);
  const query = {};
  if (req.query.verified === "true") query.verified = true;
  if (req.query.search) query.$text = { $search: req.query.search };

  const total = await College.countDocuments(query);
  const colleges = await College.find(query)
    .select("-students -achievements")
    .sort(req.query.search ? { score: { $meta: "textScore" } } : { name: 1 })
    .skip(page.skip)
    .limit(page.limit);

  res
    .status(200)
    .json(
      formatResponse(
        true,
        formatPaginationResponse(colleges, total, page.page, page.limit),
        "Colleges retrieved successfully",
      ),
    );
});

export const getCollegeById = asyncHandler(async (req, res) => {
  const college = await College.findById(req.params.id).select(
    "-students -achievements",
  );
  if (!college)
    return res
      .status(404)
      .json(
        formatResponse(false, null, "College not found", { code: "NOT_FOUND" }),
      );
  res
    .status(200)
    .json(formatResponse(true, college, "College retrieved successfully"));
});

export const updateOwnProfile = asyncHandler(async (req, res) => {
  const college = await College.findOne({ userId: req.user._id });
  if (!college)
    return res.status(404).json(
      formatResponse(false, null, "College profile not found", {
        code: "NOT_FOUND",
      }),
    );

  delete req.body.verified;
  delete req.body.code;
  Object.assign(college, req.body);
  await college.save();
  res
    .status(200)
    .json(formatResponse(true, college, "Profile updated successfully"));
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const college = await College.findOne({ userId: req.user._id });
  if (!college)
    return res.status(404).json(
      formatResponse(false, null, "College profile not found", {
        code: "NOT_FOUND",
      }),
    );

  const students = await Student.find({ collegeId: college._id }).select("_id");
  const studentIds = students.map((s) => s._id);

  const [
    totalStudents,
    verifiedStudents,
    pendingAchievements,
    pendingProjects,
    verifiedAchievements,
  ] = await Promise.all([
    Student.countDocuments({ collegeId: college._id }),
    Student.countDocuments({
      collegeId: college._id,
      isVerifiedByCollege: true,
    }),
    Achievement.countDocuments({
      studentId: { $in: studentIds },
      verificationStatus: ACHIEVEMENT_STATUS.PENDING,
    }),
    Project.countDocuments({
      studentId: { $in: studentIds },
      verifiedBy: { $exists: false },
    }),
    Achievement.countDocuments({
      verifiedBy: college._id,
      verificationStatus: "verified",
    }),
  ]);

  res.status(200).json(
    formatResponse(
      true,
      {
        totalStudents,
        verifiedStudents,
        pendingVerifications: pendingAchievements + pendingProjects,
        verifiedAchievements,
      },
      "Dashboard stats retrieved successfully",
    ),
  );
});

export const getCollegeStudents = asyncHandler(async (req, res) => {
  const college = await College.findOne({ userId: req.user._id });
  if (!college)
    return res.status(404).json(
      formatResponse(false, null, "College profile not found", {
        code: "NOT_FOUND",
      }),
    );

  const { page, limit } = paginate(req.query.page, req.query.limit);
  const query = { collegeId: college._id };
  const total = await Student.countDocuments(query);
  const students = await Student.find(query)
    .select("-projects -achievements -applications")
    .populate("skills")
    .sort({ enrollmentNumber: 1 })
    .skip(page.skip)
    .limit(page.limit);

  res
    .status(200)
    .json(
      formatResponse(
        true,
        formatPaginationResponse(students, total, page.page, page.limit),
        "Students retrieved successfully",
      ),
    );
});

export const getPendingVerifications = asyncHandler(async (req, res) => {
  const college = await College.findOne({ userId: req.user._id });

  if (!college) {
    return res.status(404).json(
      formatResponse(false, null, "College profile not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  const { page, limit } = paginate(req.query.page, req.query.limit);

  // Get students from this college
  const students = await Student.find({ collegeId: college._id }).select("_id");
  const studentIds = students.map((s) => s._id);

  // Get pending achievements
  const achievementsQuery = {
    studentId: { $in: studentIds },
    verificationStatus: ACHIEVEMENT_STATUS.PENDING,
  };

  // ✅ FIX: More robust query for pending projects
  // Checks if status is explicitly 'pending' OR if the field is missing/null
  const projectsQuery = {
    studentId: { $in: studentIds },
    $or: [
      { verificationStatus: "pending" },
      { verificationStatus: { $exists: false } },
      { verificationStatus: null },
    ],
  };

  const [achievementsTotal, projectsTotal] = await Promise.all([
    Achievement.countDocuments(achievementsQuery),
    Project.countDocuments(projectsQuery),
  ]);

  const [achievements, projects] = await Promise.all([
    Achievement.find(achievementsQuery)
      .populate("studentId", "firstName lastName enrollmentNumber")
      .populate("skills")
      .sort({ createdAt: -1 })
      .skip(page.skip)
      .limit(page.limit),
    Project.find(projectsQuery)
      .populate("studentId", "firstName lastName enrollmentNumber")
      .populate("skills")
      .sort({ createdAt: -1 })
      .limit(page.limit),
  ]);

  res.status(200).json(
    formatResponse(
      true,
      {
        achievements: {
          data: achievements,
          total: achievementsTotal,
        },
        projects: {
          data: projects,
          total: projectsTotal,
        },
      },
      "Pending verifications retrieved successfully",
    ),
  );
});

// ... [Keep verifyStudentEnrollment and other functions] ...

export const verifyStudentEnrollment = asyncHandler(async (req, res) => {
  const college = await College.findOne({ userId: req.user._id });
  if (!college)
    return res.status(404).json(
      formatResponse(false, null, "College profile not found", {
        code: "NOT_FOUND",
      }),
    );

  const student = await Student.findById(req.params.studentId);
  if (!student)
    return res
      .status(404)
      .json(
        formatResponse(false, null, "Student not found", { code: "NOT_FOUND" }),
      );

  if (
    student.collegeId &&
    student.collegeId.toString() !== college._id.toString()
  ) {
    return res.status(403).json(
      formatResponse(false, null, "Student does not belong to your college", {
        code: "FORBIDDEN",
      }),
    );
  }

  student.isVerifiedByCollege = true;
  if (!student.collegeId) student.collegeId = college._id;
  await student.save();

  res
    .status(200)
    .json(
      formatResponse(
        true,
        { _id: student._id, isVerifiedByCollege: student.isVerifiedByCollege },
        "Student verified successfully",
      ),
    );
});

// ✅ ADDED THIS FUNCTION
export const getStudentProfileForCollege = asyncHandler(async (req, res) => {
  const college = await College.findOne({ userId: req.user._id });
  if (!college)
    return res
      .status(404)
      .json(formatResponse(false, null, "College profile not found"));

  const student = await Student.findById(req.params.studentId).populate(
    "skills",
  );
  if (!student)
    return res
      .status(404)
      .json(formatResponse(false, null, "Student not found"));

  if (
    student.collegeId &&
    student.collegeId.toString() !== college._id.toString()
  ) {
    return res.status(403).json(formatResponse(false, null, "Access denied"));
  }

  const [projects, achievements] = await Promise.all([
    Project.find({ studentId: student._id }).sort({ createdAt: -1 }),
    Achievement.find({ studentId: student._id }).sort({ createdAt: -1 }),
  ]);

  const fullProfile = {
    ...student.toObject(),
    projects,
    achievements,
  };

  res
    .status(200)
    .json(
      formatResponse(
        true,
        fullProfile,
        "Student profile retrieved successfully",
      ),
    );
});
// // Ensure all functions are exported properly
// export {
//   getAllColleges,
//   getCollegeById,
//   updateOwnProfile,
//   getDashboardStats,
//   getCollegeStudents,
//   verifyStudentEnrollment,
// };
