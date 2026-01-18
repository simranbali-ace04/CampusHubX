import {
  asyncHandler,
  formatResponse,
  paginate,
  formatPaginationResponse,
} from "../utils/helpers.js";
import Recruiter from "../models/Recruiter.js";
import Opportunity from "../models/Opportunity.js";
import Application from "../models/Application.js";
import Match from "../models/Match.js";

/**
 * List recruiters
 */
export const getAllRecruiters = asyncHandler(async (req, res) => {
  const { page, limit } = paginate(req.query.page, req.query.limit);

  const query = {};
  if (req.query.verified === "true") {
    query.verified = true;
  }
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  const total = await Recruiter.countDocuments(query);
  const recruiters = await Recruiter.find(query)
    .select("-opportunities -applications")
    .sort(
      req.query.search ? { score: { $meta: "textScore" } } : { companyName: 1 },
    )
    .skip(page.skip)
    .limit(page.limit);

  res
    .status(200)
    .json(
      formatResponse(
        true,
        formatPaginationResponse(recruiters, total, page.page, page.limit),
        "Recruiters retrieved successfully",
      ),
    );
});

/**
 * Get recruiter by ID
 */
export const getRecruiterById = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findById(req.params.id).select(
    "-opportunities -applications",
  );

  if (!recruiter) {
    return res.status(404).json(
      formatResponse(false, null, "Recruiter not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  res
    .status(200)
    .json(formatResponse(true, recruiter, "Recruiter retrieved successfully"));
});

/**
 * Update own profile
 */
export const updateOwnProfile = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ userId: req.user._id });

  if (!recruiter) {
    return res.status(404).json(
      formatResponse(false, null, "Recruiter profile not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  // Don't allow updating verified status
  delete req.body.verified;

  Object.assign(recruiter, req.body);
  await recruiter.save();

  res
    .status(200)
    .json(formatResponse(true, recruiter, "Profile updated successfully"));
});

/**
 * Get own profile
 */
export const getOwnProfile = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ userId: req.user._id });

  if (!recruiter) {
    return res.status(404).json(
      formatResponse(false, null, "Recruiter profile not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  res
    .status(200)
    .json(formatResponse(true, recruiter, "Profile retrieved successfully"));
});

/**
 * Get recruiter dashboard
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ userId: req.user._id });

  if (!recruiter) {
    return res.status(404).json(
      formatResponse(false, null, "Recruiter profile not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  const opportunities = await Opportunity.find({
    recruiterId: recruiter._id,
  }).select("_id");
  const opportunityIds = opportunities.map((o) => o._id);

  const [
    activeOpportunities,
    totalApplications,
    pendingApplications,
    shortlistedApplications,
    acceptedApplications,
  ] = await Promise.all([
    Opportunity.countDocuments({ recruiterId: recruiter._id, isActive: true }),
    Application.countDocuments({ opportunityId: { $in: opportunityIds } }),
    Application.countDocuments({
      opportunityId: { $in: opportunityIds },
      status: "pending",
    }),
    Application.countDocuments({
      opportunityId: { $in: opportunityIds },
      status: "shortlisted",
    }),
    Application.countDocuments({
      opportunityId: { $in: opportunityIds },
      status: "accepted",
    }),
  ]);

  // Match Calculation Logic
  const matches = await Match.find({
    opportunityId: { $in: opportunityIds },
  }).select("score");

  const totalScore = matches.reduce((sum, match) => sum + match.score, 0);
  const averageMatchScore =
    matches.length > 0 ? Math.round(totalScore / matches.length) : 0;

  const recentApplications = await Application.find({
    opportunityId: { $in: opportunityIds },
  })
    .populate("studentId", "firstName lastName profilePicture")
    .populate("opportunityId", "title")
    .sort({ appliedAt: -1 })
    .limit(5);

  res.status(200).json(
    formatResponse(
      true,
      {
        stats: {
          activeOpportunities,
          totalApplications,
          pendingApplications,
          shortlistedApplications,
          acceptedApplications,
          averageMatchScore,
        },
        recentApplications,
      },
      "Dashboard data retrieved successfully",
    ),
  );
});

/**
 * Get logged-in recruiter's opportunities
 */
export const getMyOpportunities = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ userId: req.user._id });

  if (!recruiter) {
    return res.status(404).json(
      formatResponse(false, null, "Recruiter profile not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  const opportunities = await Opportunity.find({ recruiterId: recruiter._id })
    .sort({ createdAt: -1 })
    .populate("applications");

  res
    .status(200)
    .json(
      formatResponse(
        true,
        opportunities,
        "Opportunities retrieved successfully",
      ),
    );
});

/**
 * Get recruiter analytics
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ userId: req.user._id });

  if (!recruiter) {
    return res.status(404).json(
      formatResponse(false, null, "Recruiter profile not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  const opportunities = await Opportunity.find({
    recruiterId: recruiter._id,
  }).select("_id");
  const opportunityIds = opportunities.map((o) => o._id);

  // Application status breakdown
  const statusBreakdown = await Application.aggregate([
    { $match: { opportunityId: { $in: opportunityIds } } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Applications over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const applicationsOverTime = await Application.aggregate([
    {
      $match: {
        opportunityId: { $in: opportunityIds },
        appliedAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$appliedAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Top opportunities by applications
  const topOpportunities = await Application.aggregate([
    { $match: { opportunityId: { $in: opportunityIds } } },
    {
      $group: {
        _id: "$opportunityId",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  res.status(200).json(
    formatResponse(
      true,
      {
        statusBreakdown,
        applicationsOverTime,
        topOpportunities,
      },
      "Analytics retrieved successfully",
    ),
  );
});
