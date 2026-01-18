import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { z } from "zod"; // <--- 1. Import z to create the override
import { opportunitiesApi } from "../../services/api/opportunities";
import { opportunitySchema } from "../../utils/validators";
import { ROUTES } from "../../utils/constants";
import Input from "../../components/common/Input/Input";
import Button from "../../components/common/Button/Button";
import Select from "../../components/common/Select/Select";
import Textarea from "../../components/common/Textarea/Textarea";
import Card from "../../components/common/Card/Card";

// <--- 2. Create a specific schema for this form
// This overrides the 'requiredSkills' rule to accept a String (from the input) instead of an Array
const formSchema = opportunitySchema.extend({
  requiredSkills: z.string().min(1, "At least one skill is required"),
});

const CreateOpportunity = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema), // <--- 3. Use the new formSchema here
    defaultValues: {
      salaryRange: { currency: "INR" },
      location: { type: "onsite" },
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // <--- 4. Conversion Logic: String -> Array
      // We split the string by commas to create the array the Backend expects
      const formattedData = {
        ...data,
        requiredSkills: data.requiredSkills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
      };

      const response = await opportunitiesApi.create(formattedData);
      if (response.success) {
        toast.success("Opportunity posted successfully!");
        navigate(ROUTES.RECRUITER_DASHBOARD);
      }
    } catch (error) {
      console.error("Error creating opportunity:", error);
      toast.error(
        error.response?.data?.message || "Failed to post opportunity",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Post New Opportunity
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a job listing for students
        </p>
      </div>

      <Card>
        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Job Title"
              placeholder="e.g. Frontend Developer"
              name="title"
              register={register}
              error={errors.title?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Job Type"
                name="type"
                options={[
                  { value: "full-time", label: "Full Time" },
                  { value: "internship", label: "Internship" },
                  { value: "contract", label: "Contract" },
                  { value: "freelance", label: "Freelance" },
                ]}
                register={register}
                error={errors.type?.message}
              />
              <Select
                label="Location Type"
                name="location.type"
                options={[
                  { value: "onsite", label: "On-site" },
                  { value: "remote", label: "Remote" },
                  { value: "hybrid", label: "Hybrid" },
                ]}
                register={register}
                error={errors.location?.type?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="City"
                placeholder="e.g. Bangalore"
                name="location.city"
                register={register}
                error={errors.location?.city?.message}
              />
              <Input
                label="State"
                placeholder="e.g. Karnataka"
                name="location.state"
                register={register}
                error={errors.location?.state?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Min Salary"
                type="number"
                name="salaryRange.min"
                register={register}
                error={errors.salaryRange?.min?.message}
                valueAsNumber // This works now thanks to your Input.jsx fix
              />
              <Input
                label="Max Salary"
                type="number"
                name="salaryRange.max"
                register={register}
                error={errors.salaryRange?.max?.message}
                valueAsNumber
              />
            </div>

            <Textarea
              label="Description"
              placeholder="Detailed job description..."
              name="description"
              register={register}
              error={errors.description?.message}
              rows={5}
            />

            {/* This field now accepts a String because of the formSchema override */}
            <Input
              label="Required Skills (Comma separated)"
              placeholder="React, Node.js, MongoDB"
              name="requiredSkills"
              register={register}
              error={errors.requiredSkills?.message}
            />

            <Input
              label="Required Experience (Years)"
              type="number"
              name="requiredExperience"
              register={register}
              error={errors.requiredExperience?.message}
              valueAsNumber
            />

            <Input
              label="Application Deadline"
              type="date"
              name="applicationDeadline"
              register={register}
              error={errors.applicationDeadline?.message}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.RECRUITER_DASHBOARD)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Post Opportunity
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateOpportunity;
