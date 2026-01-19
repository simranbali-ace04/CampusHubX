import express from "express";
import * as analyticsController from "../controllers/analyticsController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/roleAuth.js";
import { USER_ROLES } from "../utils/constants.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin routes
router.get(
  "/overview",
  authorize(USER_ROLES.ADMIN),
  analyticsController.getOverview,
);
router.get(
  "/students",
  authorize(USER_ROLES.ADMIN, USER_ROLES.COLLEGE),
  analyticsController.getStudentAnalytics,
);

// ✅ ADD THIS ROUTE
router.get(
  "/college/stats",
  authorize(USER_ROLES.COLLEGE),
  analyticsController.getCollegeStats,
);

router.get(
  "/opportunities",
  authorize(USER_ROLES.ADMIN, USER_ROLES.RECRUITER),
  analyticsController.getOpportunityAnalytics,
);
router.get(
  "/matches",
  authorize(USER_ROLES.ADMIN),
  analyticsController.getMatchingAnalytics,
);
router.get(
  "/trends",
  authorize(USER_ROLES.ADMIN),
  analyticsController.getTrends,
);

export default router;
