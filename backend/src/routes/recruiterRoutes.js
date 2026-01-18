import express from "express";
import * as recruiterController from "../controllers/recruiterController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/roleAuth.js";
import { USER_ROLES } from "../utils/constants.js";

const router = express.Router();

// =================================================================
// 1. SPECIFIC ROUTES (MUST BE DEFINED FIRST)
// =================================================================

// Dashboard
router.get(
  "/dashboard",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  recruiterController.getDashboard,
);

// Analytics
router.get(
  "/analytics",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  recruiterController.getAnalytics,
);

// My Opportunities (The one that was failing)
router.get(
  "/opportunities",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  recruiterController.getMyOpportunities,
);

// Profile Management
router.get(
  "/profile",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  recruiterController.getOwnProfile,
); // <--- ADD THIS
router.put(
  "/profile",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  recruiterController.updateOwnProfile,
);

// =================================================================
// 2. GENERIC ROUTES (MUST BE LAST)
// =================================================================

router.get("/", recruiterController.getAllRecruiters);

// The "Catch-All" Route - This MUST be at the very bottom
router.get("/:id", recruiterController.getRecruiterById);

export default router;
