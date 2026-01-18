import {
  asyncHandler,
  formatResponse,
  paginate,
  formatPaginationResponse,
} from "../utils/helpers.js";
import Opportunity from "../models/Opportunity.js";
import Recruiter from "../models/Recruiter.js";
import Skill from "../models/Skill.js"; // <--- 1. ADD THIS IMPORT
/**
 * List opportunities
 */
export const getAllOpportunities = asyncHandler(async (req, res) => {
  const { page, limit } = paginate(req.query.page, req.query.limit);

  const query = { isActive: true };

  if (req.query.type) {
    query.type = req.query.type;
  }
  if (req.query.locationType) {
    query["location.type"] = req.query.locationType;
  }
  if (req.query.recruiterId) {
    query.recruiterId = req.query.recruiterId;
  }
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }
  if (req.query.skills) {
    const skillIds = Array.isArray(req.query.skills)
      ? req.query.skills
      : [req.query.skills];
    query.requiredSkills = { $in: skillIds };
  }

  const total = await Opportunity.countDocuments(query);
  const opportunities = await Opportunity.find(query)
    .populate("recruiterId", "companyName logo verified")
    .populate("requiredSkills")
    .sort(
      req.query.search ? { score: { $meta: "textScore" } } : { createdAt: -1 },
    )
    .skip(page.skip)
    .limit(page.limit);

  res
    .status(200)
    .json(
      formatResponse(
        true,
        formatPaginationResponse(opportunities, total, page.page, page.limit),
        "Opportunities retrieved successfully",
      ),
    );
});

/**
 * Get opportunity by ID
 */
export const getOpportunityById = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id)
    .populate("recruiterId", "companyName logo description website verified")
    .populate("requiredSkills");

  if (!opportunity) {
    return res.status(404).json(
      formatResponse(false, null, "Opportunity not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  res
    .status(200)
    .json(
      formatResponse(true, opportunity, "Opportunity retrieved successfully"),
    );
});

/**
 * Create opportunity
 */
export const createOpportunity = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ userId: req.user._id });

  if (!recruiter) {
    return res.status(404).json(
      formatResponse(false, null, "Recruiter profile not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  // <--- 2. ADD THIS LOGIC TO CONVERT SKILL NAMES TO IDs --->
  let skillIds = [];
  if (req.body.requiredSkills && Array.isArray(req.body.requiredSkills)) {
    // If frontend sent strings (names), find their IDs
    if (
      req.body.requiredSkills.length > 0 &&
      typeof req.body.requiredSkills[0] === "string"
    ) {
      const skillNames = req.body.requiredSkills.map((s) => s.trim());

      // Find skills with case-insensitive matching
      const foundSkills = await Skill.find({
        name: { $in: skillNames.map((name) => new RegExp(`^${name}$`, "i")) },
      }).select("_id");

      skillIds = foundSkills.map((s) => s._id);

      // Optional: Check if any skills were not found
      if (skillIds.length === 0 && skillNames.length > 0) {
        // You might want to throw an error here, or just proceed with empty skills.
        // For now, let's proceed but warn in console
        console.warn(
          "Warning: None of the provided skills were found in the database.",
        );
      }
    } else {
      // If frontend already sent IDs (unlikely in your current setup, but good for safety)
      skillIds = req.body.requiredSkills;
    }
  }

  const opportunity = await Opportunity.create({
    ...req.body,
    requiredSkills: skillIds, // Use the converted IDs
    recruiterId: recruiter._id,
  });

  // Add opportunity to recruiter's opportunities array
  recruiter.opportunities.push(opportunity._id);
  await recruiter.save();

  const populated = await Opportunity.findById(opportunity._id)
    .populate("requiredSkills")
    .populate("recruiterId", "companyName logo");

  res
    .status(201)
    .json(formatResponse(true, populated, "Opportunity created successfully"));
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
    .sort({ createdAt: -1 }) // Newest first
    .populate("applications"); // Optional: to show app count

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
 * Update opportunity
 */
/**
 * Update opportunity
 */
export const updateOpportunity = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ userId: req.user._id });

  if (!recruiter) {
    return res.status(404).json(
      formatResponse(false, null, "Recruiter profile not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    return res.status(404).json(
      formatResponse(false, null, "Opportunity not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  if (opportunity.recruiterId.toString() !== recruiter._id.toString()) {
    return res
      .status(403)
      .json(
        formatResponse(
          false,
          null,
          "You do not have permission to update this opportunity",
          { code: "FORBIDDEN" },
        ),
      );
  }

  // --- NEW: Handle Skills during Update ---
  if (req.body.requiredSkills && Array.isArray(req.body.requiredSkills)) {
    // If strings are sent, convert them to IDs
    if (
      req.body.requiredSkills.length > 0 &&
      typeof req.body.requiredSkills[0] === "string"
    ) {
      const skillNames = req.body.requiredSkills.map((s) => s.trim());
      const foundSkills = await Skill.find({
        name: { $in: skillNames.map((name) => new RegExp(`^${name}$`, "i")) },
      }).select("_id");

      req.body.requiredSkills = foundSkills.map((s) => s._id);
    }
  }
  // ----------------------------------------

  Object.assign(opportunity, req.body);
  await opportunity.save();

  const updated = await Opportunity.findById(opportunity._id)
    .populate("requiredSkills")
    .populate("recruiterId", "companyName logo");

  res
    .status(200)
    .json(formatResponse(true, updated, "Opportunity updated successfully"));
});

/**
 * Delete opportunity
 */
export const deleteOpportunity = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ userId: req.user._id });

  if (!recruiter) {
    return res.status(404).json(
      formatResponse(false, null, "Recruiter profile not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    return res.status(404).json(
      formatResponse(false, null, "Opportunity not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  if (opportunity.recruiterId.toString() !== recruiter._id.toString()) {
    return res
      .status(403)
      .json(
        formatResponse(
          false,
          null,
          "You do not have permission to delete this opportunity",
          { code: "FORBIDDEN" },
        ),
      );
  }

  // Remove from recruiter's opportunities array
  recruiter.opportunities = recruiter.opportunities.filter(
    (o) => o.toString() !== opportunity._id.toString(),
  );
  await recruiter.save();

  await opportunity.deleteOne();

  res
    .status(200)
    .json(formatResponse(true, null, "Opportunity deleted successfully"));
});

/**
 * Toggle opportunity status
 */
export const toggleOpportunityStatus = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ userId: req.user._id });

  if (!recruiter) {
    return res.status(404).json(
      formatResponse(false, null, "Recruiter profile not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    return res.status(404).json(
      formatResponse(false, null, "Opportunity not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  if (opportunity.recruiterId.toString() !== recruiter._id.toString()) {
    return res
      .status(403)
      .json(
        formatResponse(
          false,
          null,
          "You do not have permission to update this opportunity",
          { code: "FORBIDDEN" },
        ),
      );
  }

  opportunity.isActive = !opportunity.isActive;
  await opportunity.save();

  res
    .status(200)
    .json(
      formatResponse(
        true,
        opportunity,
        `Opportunity ${opportunity.isActive ? "activated" : "deactivated"} successfully`,
      ),
    );
});

/**
 * Get recruiter's opportunities
 */
export const getRecruiterOpportunities = asyncHandler(async (req, res) => {
  const { page, limit } = paginate(req.query.page, req.query.limit);

  const query = { recruiterId: req.params.recruiterId };
  if (req.query.active !== undefined) {
    query.isActive = req.query.active === "true";
  }

  const total = await Opportunity.countDocuments(query);
  const opportunities = await Opportunity.find(query)
    .populate("requiredSkills")
    .sort({ createdAt: -1 })
    .skip(page.skip)
    .limit(page.limit);

  res
    .status(200)
    .json(
      formatResponse(
        true,
        formatPaginationResponse(opportunities, total, page.page, page.limit),
        "Opportunities retrieved successfully",
      ),
    );
});
