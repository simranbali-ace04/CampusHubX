import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { recruitersApi } from "../../services/api/recruiters";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Input from "../../components/common/Input/Input";
import Textarea from "../../components/common/Textarea/Textarea";
import Spinner from "../../components/common/Spinner/Spinner";
import { HiOfficeBuilding, HiGlobeAlt, HiLocationMarker } from "react-icons/hi";

const RecruiterProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await recruitersApi.getProfile();
      if (response.success) {
        const data = response.data;
        // Populate form fields
        setValue("companyName", data.companyName);
        setValue("website", data.website);
        setValue("phone", data.phone);
        setValue("description", data.description);
        setValue("address.street", data.address?.street);
        setValue("address.city", data.address?.city);
        setValue("address.state", data.address?.state);
        setValue("address.country", data.address?.country);
        setValue("address.pincode", data.address?.pincode);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const response = await recruitersApi.updateProfile(data);
      if (response.success) {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-gray-600">
          Manage your company information and branding
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Details */}
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <HiOfficeBuilding className="text-primary-600 w-5 h-5" />
              <h2 className="text-lg font-semibold">Company Information</h2>
            </div>
          </Card.Header>
          <Card.Body className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Company Name"
                name="companyName"
                register={register}
                error={errors.companyName?.message}
                rules={{ required: "Company name is required" }}
              />
              <Input
                label="Phone Number"
                name="phone"
                register={register}
                error={errors.phone?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Website"
                name="website"
                placeholder="https://example.com"
                register={register}
                error={errors.website?.message}
                icon={HiGlobeAlt}
              />
              {/* If you implement file upload later, add Logo input here */}
            </div>

            <Textarea
              label="About Company"
              name="description"
              rows={4}
              register={register}
              placeholder="Tell us about your company..."
            />
          </Card.Body>
        </Card>

        {/* Address */}
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <HiLocationMarker className="text-primary-600 w-5 h-5" />
              <h2 className="text-lg font-semibold">Location</h2>
            </div>
          </Card.Header>
          <Card.Body className="space-y-6">
            <Input
              label="Street Address"
              name="address.street"
              register={register}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="City"
                name="address.city"
                register={register}
                rules={{ required: "City is required" }}
                error={errors.address?.city?.message}
              />
              <Input
                label="State"
                name="address.state"
                register={register}
                rules={{ required: "State is required" }}
                error={errors.address?.state?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Country"
                name="address.country"
                register={register}
              />
              <Input
                label="Pincode"
                name="address.pincode"
                register={register}
              />
            </div>
          </Card.Body>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} size="lg">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RecruiterProfile;
