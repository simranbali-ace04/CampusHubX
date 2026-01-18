import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const studentRegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  collegeId: z.string().min(1, "College is required"),
  enrollmentNumber: z.string().min(1, "Enrollment number is required"),
  // 🔥 FIXED: Automatically convert string input to number, handling empty values
  yearOfStudy: z.preprocess(
    (val) =>
      val === "" || val === undefined || val === null ? undefined : Number(val),
    z
      .number({ invalid_type_error: "Must be a number" })
      .int()
      .min(1, "Year must be between 1 and 5")
      .max(5, "Year must be between 1 and 5")
      .optional(),
  ),
  branch: z.string().optional(),
});

export const collegeRegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "College name is required"),
  code: z.string().min(1, "College code is required"),
  phone: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

export const recruiterRegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().min(2, "Company name is required"),
  phone: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  technologies: z.array(z.string()).optional(),
  githubUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  liveUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const achievementSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum([
    "certification",
    "award",
    "competition",
    "publication",
    "other",
  ]),
  issuer: z.string().min(1, "Issuer is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  certificateUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const opportunitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["full-time", "internship", "contract", "freelance"]),
  location: z.object({
    type: z.enum(["remote", "onsite", "hybrid"]),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }),
  salaryRange: z.object({
    // 🔥 FIXED: Added coercion here too for future safety
    min: z.coerce.number().min(0, "Minimum salary must be 0 or more"),
    max: z.coerce.number().min(0, "Maximum salary must be 0 or more"),
    currency: z.string().default("INR"),
  }),
  requiredSkills: z.array(z.string()).min(1, "At least one skill is required"),
  // 🔥 FIXED: Added coercion here too
  requiredExperience: z.preprocess(
    (val) =>
      val === "" || val === undefined || val === null ? undefined : Number(val),
    z.number().min(0).optional(),
  ),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  applicationDeadline: z.string().optional(),
});

export const applicationSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity is required"),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});
