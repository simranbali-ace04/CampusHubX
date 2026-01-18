import express from "express";
import * as collegeController from "../controllers/collegeController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/roleAuth.js";
import { USER_ROLES } from "../utils/constants.js";

const router = express.Router();

// Public routes
router.get("/", collegeController.getAllColleges);

// College routes (Protected)
// 👉 1. Add this NEW route for stats
router.get(
  "/stats",
  authenticate,
  authorize(USER_ROLES.COLLEGE),
  collegeController.getDashboardStats,
);

router.put(
  "/profile",
  authenticate,
  authorize(USER_ROLES.COLLEGE),
  collegeController.updateOwnProfile,
);
router.get(
  "/verifications/pending",
  authenticate,
  authorize(USER_ROLES.COLLEGE),
  collegeController.getPendingVerifications,
);
router.post(
  "/verify-student/:studentId",
  authenticate,
  authorize(USER_ROLES.COLLEGE),
  collegeController.verifyStudentEnrollment,
);

// Parameterized routes (MUST come last)
router.get("/:id", collegeController.getCollegeById);
router.get(
  "/:id/students",
  authenticate,
  authorize(USER_ROLES.COLLEGE),
  collegeController.getCollegeStudents,
);

export default router;
