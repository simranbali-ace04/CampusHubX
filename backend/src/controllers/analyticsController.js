import { asyncHandler, formatResponse } from "../utils/helpers.js";
import Student from "../models/Student.js";
import College from "../models/College.js";
import Recruiter from "../models/Recruiter.js";
import Opportunity from "../models/Opportunity.js";
import Application from "../models/Application.js";
import Match from "../models/Match.js";
import Analytics from "../models/Analytics.js";
// ✅ ADD THESE IMPORTS
import Achievement from "../models/Achievement.js";
import Project from "../models/Project.js";

/**
 * Get overview analytics (Admin)
 */
export const getOverview = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    totalColleges,
    totalRecruiters,
    totalOpportunities,
    activeOpportunities,
    totalApplications,
    totalMatches,
  ] = await Promise.all([
    Student.countDocuments(),
    College.countDocuments(),
    Recruiter.countDocuments(),
    Opportunity.countDocuments(),
    Opportunity.countDocuments({ isActive: true }),
    Application.countDocuments(),
    Match.countDocuments(),
  ]);

  // Recent registrations (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    recentStudents,
    recentColleges,
    recentRecruiters,
    recentOpportunities,
  ] = await Promise.all([
    Student.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    College.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Recruiter.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Opportunity.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
  ]);

  res.status(200).json(
    formatResponse(
      true,
      {
        totals: {
          students: totalStudents,
          colleges: totalColleges,
          recruiters: totalRecruiters,
          opportunities: totalOpportunities,
          activeOpportunities,
          applications: totalApplications,
          matches: totalMatches,
        },
        recent: {
          students: recentStudents,
          colleges: recentColleges,
          recruiters: recentRecruiters,
          opportunities: recentOpportunities,
        },
      },
      "Overview analytics retrieved successfully",
    ),
  );
});

/**
 * Get student analytics
 */
export const getStudentAnalytics = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.collegeId) {
    query.collegeId = req.query.collegeId;
  }

  const [
    totalStudents,
    studentsWithProjects,
    studentsWithAchievements,
    studentsWithApplications,
  ] = await Promise.all([
    Student.countDocuments(query),
    Student.countDocuments({ ...query, projects: { $exists: true, $ne: [] } }),
    Student.countDocuments({
      ...query,
      achievements: { $exists: true, $ne: [] },
    }),
    Student.countDocuments({
      ...query,
      applications: { $exists: true, $ne: [] },
    }),
  ]);

  // Top skills
  const topSkills = await Student.aggregate([
    { $match: query },
    { $unwind: "$skills" },
    { $group: { _id: "$skills", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "skills",
        localField: "_id",
        foreignField: "_id",
        as: "skill",
      },
    },
    { $unwind: "$skill" },
    { $project: { name: "$skill.name", count: 1 } },
  ]);

  res.status(200).json(
    formatResponse(
      true,
      {
        totals: {
          total: totalStudents,
          withProjects: studentsWithProjects,
          withAchievements: studentsWithAchievements,
          withApplications: studentsWithApplications,
        },
        topSkills,
      },
      "Student analytics retrieved successfully",
    ),
  );
});

/**
 * ✅ ADD THIS FUNCTION: Get College Specific Stats
 */
export const getCollegeStats = asyncHandler(async (req, res) => {
  // 1. Find the College Profile associated with the logged-in User
  const college = await College.findOne({ userId: req.user._id });

  if (!college) {
    return res
      .status(404)
      .json(formatResponse(false, null, "College profile not found"));
  }

  const collegeId = college._id;

  // 2. Get Student IDs linked to this college
  const students = await Student.find({ collegeId }).select("_id");
  const studentIds = students.map((s) => s._id);

  // 3. Run counts in parallel
  const [
    totalStudents,
    verifiedStudents,
    pendingAchievements,
    pendingProjects,
    verifiedAchievements,
  ] = await Promise.all([
    Student.countDocuments({ collegeId }),
    Student.countDocuments({ collegeId, isVerified: true }),
    Achievement.countDocuments({
      studentId: { $in: studentIds },
      verificationStatus: "pending",
    }),
    Project.countDocuments({
      studentId: { $in: studentIds },
      verificationStatus: "pending",
    }),
    Achievement.countDocuments({
      studentId: { $in: studentIds },
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
      "College stats retrieved successfully",
    ),
  );
});

/**
 * Get opportunity analytics
 */
export const getOpportunityAnalytics = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.recruiterId) {
    query.recruiterId = req.query.recruiterId;
  }

  const [
    totalOpportunities,
    activeOpportunities,
    totalApplications,
    avgApplicationsPerOpportunity,
  ] = await Promise.all([
    Opportunity.countDocuments(query),
    Opportunity.countDocuments({ ...query, isActive: true }),
    Application.countDocuments({
      opportunityId: { $in: await Opportunity.find(query).select("_id") },
    }),
    Application.aggregate([
      {
        $match: {
          opportunityId: {
            $in: await Opportunity.find(query).select("_id").lean(),
          },
        },
      },
      { $group: { _id: "$opportunityId", count: { $sum: 1 } } },
      { $group: { _id: null, avg: { $avg: "$count" } } },
    ]),
  ]);

  // Opportunities by type
  const byType = await Opportunity.aggregate([
    { $match: query },
    { $group: { _id: "$type", count: { $sum: 1 } } },
  ]);

  res.status(200).json(
    formatResponse(
      true,
      {
        totals: {
          total: totalOpportunities,
          active: activeOpportunities,
          applications: totalApplications,
          avgApplications: avgApplicationsPerOpportunity[0]?.avg || 0,
        },
        byType,
      },
      "Opportunity analytics retrieved successfully",
    ),
  );
});

/**
 * Get matching analytics
 */
export const getMatchingAnalytics = asyncHandler(async (req, res) => {
  const [totalMatches, avgMatchScore, highMatches, mediumMatches, lowMatches] =
    await Promise.all([
      Match.countDocuments(),
      Match.aggregate([{ $group: { _id: null, avg: { $avg: "$score" } } }]),
      Match.countDocuments({ score: { $gte: 80 } }),
      Match.countDocuments({ score: { $gte: 60, $lt: 80 } }),
      Match.countDocuments({ score: { $lt: 60 } }),
    ]);

  // Match distribution
  const distribution = await Match.aggregate([
    {
      $bucket: {
        groupBy: "$score",
        boundaries: [0, 20, 40, 60, 80, 100],
        default: "other",
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  res.status(200).json(
    formatResponse(
      true,
      {
        totals: {
          total: totalMatches,
          averageScore: avgMatchScore[0]?.avg || 0,
          high: highMatches,
          medium: mediumMatches,
          low: lowMatches,
        },
        distribution,
      },
      "Matching analytics retrieved successfully",
    ),
  );
});

/**
 * Get trend data
 */
export const getTrends = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Student registrations over time
  const studentTrends = await Student.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Opportunity creation over time
  const opportunityTrends = await Opportunity.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Application trends
  const applicationTrends = await Application.aggregate([
    { $match: { appliedAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$appliedAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json(
    formatResponse(
      true,
      {
        students: studentTrends,
        opportunities: opportunityTrends,
        applications: applicationTrends,
      },
      "Trend data retrieved successfully",
    ),
  );
});
