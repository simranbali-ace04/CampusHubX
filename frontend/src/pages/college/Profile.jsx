import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { collegesApi } from "../../services/api/colleges";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Input from "../../components/common/Input/Input";
import Spinner from "../../components/common/Spinner/Spinner";
import {
  HiAcademicCap,
  HiGlobeAlt,
  HiLocationMarker,
  HiPhone,
  HiIdentification,
} from "react-icons/hi";

const CollegeProfile = () => {
  const { user, checkAuth } = useAuth();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Populate form with existing data from Auth Context
  useEffect(() => {
    if (user?.profile) {
      const { name, code, phone, website, address, email } = user.profile;

      setValue("name", name);
      setValue("code", code);
      setValue("email", email || user.email);
      setValue("phone", phone);
      setValue("website", website);

      // Address fields
      if (address) {
        setValue("address.street", address.street);
        setValue("address.city", address.city);
        setValue("address.state", address.state);
        setValue("address.country", address.country);
        setValue("address.pincode", address.pincode);
      }
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const response = await collegesApi.updateProfile(data);
      if (response.success) {
        toast.success("Profile updated successfully");
        await checkAuth(); // Refresh global user state with new data
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user?.profile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">College Profile</h1>
        <p className="text-gray-600">
          Manage your institution's details and contact information.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Institution Details */}
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <HiAcademicCap className="text-primary-600 w-5 h-5" />
              <h2 className="text-lg font-semibold">Institution Details</h2>
            </div>
          </Card.Header>
          <Card.Body className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="College Name"
                name="name"
                register={register}
                rules={{ required: "College name is required" }}
                error={errors.name?.message}
                placeholder="e.g. Indian Institute of Technology"
              />
              <Input
                label="College Code"
                name="code"
                register={register}
                rules={{ required: "College code is required" }}
                error={errors.code?.message}
                icon={HiIdentification}
                placeholder="e.g. IITB-001"
                hint="Unique identifier for your institution"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Official Email"
                name="email"
                type="email"
                register={register}
                rules={{ required: "Email is required" }}
                error={errors.email?.message}
                disabled // Usually email shouldn't be changed easily
                className="bg-gray-50 text-gray-500"
              />
              <Input
                label="Phone Number"
                name="phone"
                register={register}
                icon={HiPhone}
                placeholder="+91 98765 43210"
              />
            </div>

            <Input
              label="Website"
              name="website"
              register={register}
              icon={HiGlobeAlt}
              placeholder="https://www.college.edu"
            />
          </Card.Body>
        </Card>

        {/* Address Details */}
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <HiLocationMarker className="text-primary-600 w-5 h-5" />
              <h2 className="text-lg font-semibold">Location & Address</h2>
            </div>
          </Card.Header>
          <Card.Body className="space-y-6">
            <Input
              label="Street Address"
              name="address.street"
              register={register}
              placeholder="123 Education Lane"
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
                defaultValue="India"
              />
              <Input
                label="Pincode"
                name="address.pincode"
                register={register}
                rules={{
                  required: "Pincode is required",
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "Please enter a valid 6-digit pincode",
                  },
                }}
                error={errors.address?.pincode?.message}
              />
            </div>
          </Card.Body>
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            loading={saving}
            size="lg"
            className="w-full sm:w-auto"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CollegeProfile;
