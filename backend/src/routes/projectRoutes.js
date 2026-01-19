import express from "express";
import * as projectController from "../controllers/projectController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/roleAuth.js";
import { checkOwnership } from "../middleware/roleAuth.js";
import { validate } from "../utils/validators.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../utils/validators.js";
import Project from "../models/Project.js";
import { USER_ROLES } from "../utils/constants.js";

const router = express.Router();

// Public routes
router.get("/", projectController.getAllProjects);
router.get("/student/:studentId", projectController.getStudentProjects);
router.get("/:id", projectController.getProjectById);

// Student routes
router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.STUDENT),
  validate(createProjectSchema),
  projectController.createProject,
);
router.put(
  "/:id",
  authenticate,
  authorize(USER_ROLES.STUDENT),
  checkOwnership(Project, "studentId"),
  validate(updateProjectSchema),
  projectController.updateProject,
);
router.delete(
  "/:id",
  authenticate,
  authorize(USER_ROLES.STUDENT),
  checkOwnership(Project, "studentId"),
  projectController.deleteProject,
);

// College routes
// ✅ FIX: Changed .post to .patch to match frontend service
router.patch(
  "/:id/verify",
  authenticate,
  authorize(USER_ROLES.COLLEGE),
  projectController.verifyProject,
);

export default router;
