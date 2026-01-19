import {
  asyncHandler,
  formatResponse,
  paginate,
  formatPaginationResponse,
} from "../utils/helpers.js";
import Project from "../models/Project.js";
import Student from "../models/Student.js";
import College from "../models/College.js";

// ... [Keep getAllProjects, getProjectById, createProject, updateProject, deleteProject AS IS] ...

export const getAllProjects = asyncHandler(async (req, res) => {
  const { page, limit } = paginate(req.query.page, req.query.limit);

  const query = { isActive: true };

  if (req.query.studentId) {
    query.studentId = req.query.studentId;
  }
  if (req.query.verified === "true") {
    query.verifiedBy = { $exists: true, $ne: null };
  }
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  const total = await Project.countDocuments(query);
  const projects = await Project.find(query)
    .populate("studentId", "firstName lastName profilePicture")
    .populate("skills")
    .populate("verifiedBy", "name")
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
        formatPaginationResponse(projects, total, page.page, page.limit),
        "Projects retrieved successfully",
      ),
    );
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("studentId", "firstName lastName profilePicture collegeId")
    .populate("skills")
    .populate("verifiedBy", "name logo");

  if (!project) {
    return res
      .status(404)
      .json(
        formatResponse(false, null, "Project not found", { code: "NOT_FOUND" }),
      );
  }

  res
    .status(200)
    .json(formatResponse(true, project, "Project retrieved successfully"));
});

export const createProject = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });

  if (!student) {
    return res.status(404).json(
      formatResponse(false, null, "Student profile not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  const project = await Project.create({
    ...req.body,
    studentId: student._id,
  });

  student.projects.push(project._id);
  await student.save();

  const populated = await Project.findById(project._id).populate("skills");

  res
    .status(201)
    .json(formatResponse(true, populated, "Project created successfully"));
});

export const updateProject = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });

  if (!student) {
    return res.status(404).json(
      formatResponse(false, null, "Student profile not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    return res
      .status(404)
      .json(
        formatResponse(false, null, "Project not found", { code: "NOT_FOUND" }),
      );
  }

  if (project.studentId.toString() !== student._id.toString()) {
    return res
      .status(403)
      .json(
        formatResponse(
          false,
          null,
          "You do not have permission to update this project",
          { code: "FORBIDDEN" },
        ),
      );
  }

  Object.assign(project, req.body);
  await project.save();

  const updated = await Project.findById(project._id)
    .populate("skills")
    .populate("verifiedBy", "name");

  res
    .status(200)
    .json(formatResponse(true, updated, "Project updated successfully"));
});

export const deleteProject = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });

  if (!student) {
    return res.status(404).json(
      formatResponse(false, null, "Student profile not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    return res
      .status(404)
      .json(
        formatResponse(false, null, "Project not found", { code: "NOT_FOUND" }),
      );
  }

  if (project.studentId.toString() !== student._id.toString()) {
    return res
      .status(403)
      .json(
        formatResponse(
          false,
          null,
          "You do not have permission to delete this project",
          { code: "FORBIDDEN" },
        ),
      );
  }

  student.projects = student.projects.filter(
    (p) => p.toString() !== project._id.toString(),
  );
  await student.save();

  await project.deleteOne();

  res
    .status(200)
    .json(formatResponse(true, null, "Project deleted successfully"));
});

/**
 * Verify project (College)
 */
export const verifyProject = asyncHandler(async (req, res) => {
  const college = await College.findOne({ userId: req.user._id });

  if (!college) {
    return res.status(404).json(
      formatResponse(false, null, "College profile not found", {
        code: "NOT_FOUND",
      }),
    );
  }

  const project = await Project.findById(req.params.id).populate("studentId");

  if (!project) {
    return res
      .status(404)
      .json(
        formatResponse(false, null, "Project not found", { code: "NOT_FOUND" }),
      );
  }

  // Check if student belongs to this college
  if (
    project.studentId.collegeId &&
    project.studentId.collegeId.toString() !== college._id.toString()
  ) {
    return res
      .status(403)
      .json(
        formatResponse(
          false,
          null,
          "You can only verify projects from students in your college",
          { code: "FORBIDDEN" },
        ),
      );
  }

  // ✅ FIX: Use the status from the request body (default to 'verified' if missing)
  const status = req.body.status || "verified";

  project.verificationStatus = status;
  project.verifiedBy = college._id;
  project.verifiedAt = new Date();

  await project.save();

  const updated = await Project.findById(project._id)
    .populate("studentId", "firstName lastName")
    .populate("verifiedBy", "name logo");

  res
    .status(200)
    .json(formatResponse(true, updated, `Project ${status} successfully`));
});

export const getStudentProjects = asyncHandler(async (req, res) => {
  const { page, limit } = paginate(req.query.page, req.query.limit);

  const query = { studentId: req.params.studentId };
  if (req.query.active !== undefined) {
    query.isActive = req.query.active === "true";
  }

  const total = await Project.countDocuments(query);
  const projects = await Project.find(query)
    .populate("skills")
    .populate("verifiedBy", "name logo")
    .sort({ createdAt: -1 })
    .skip(page.skip)
    .limit(page.limit);

  res
    .status(200)
    .json(
      formatResponse(
        true,
        formatPaginationResponse(projects, total, page.page, page.limit),
        "Projects retrieved successfully",
      ),
    );
});
