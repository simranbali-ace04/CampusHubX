import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { recruitersApi } from "../../services/api/recruiters";
import { opportunitiesApi } from "../../services/api/opportunities";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Spinner from "../../components/common/Spinner/Spinner";
import Badge from "../../components/common/Badge/Badge";
import { ROUTES } from "../../utils/constants";
import { toast } from "react-hot-toast";
import { HiPlus, HiPencil, HiTrash, HiEye } from "react-icons/hi";

const Opportunities = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await recruitersApi.getMyOpportunities();
      if (response.success) {
        setOpportunities(response.data);
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await opportunitiesApi.toggleStatus(id, !currentStatus);
      toast.success(
        `Opportunity ${!currentStatus ? "activated" : "deactivated"}`,
      );
      fetchOpportunities(); // Refresh list
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this opportunity?"))
      return;
    try {
      await opportunitiesApi.delete(id);
      toast.success("Opportunity deleted");
      setOpportunities((prev) => prev.filter((op) => op._id !== id));
    } catch (error) {
      toast.error("Failed to delete opportunity");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Opportunities</h1>
          <p className="text-gray-600">Manage your job postings</p>
        </div>
        <Button
          onClick={() => navigate(`${ROUTES.RECRUITER_OPPORTUNITIES}/create`)}
        >
          <HiPlus className="w-5 h-5 mr-2" />
          Post New
        </Button>
      </div>

      {opportunities.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-10">
            <p className="text-gray-500 mb-4">
              You haven't posted any opportunities yet.
            </p>
            <Button
              variant="outline"
              onClick={() =>
                navigate(`${ROUTES.RECRUITER_OPPORTUNITIES}/create`)
              }
            >
              Create your first post
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="grid gap-4">
          {opportunities.map((job) => (
            <Card key={job._id}>
              <Card.Body>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <div className="flex gap-2 mt-2">
                      <Badge
                        className={
                          job.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {job.isActive ? "Active" : "Closed"}
                      </Badge>
                      <Badge className="bg-blue-50 text-blue-700">
                        {job.type}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-700">
                        {job.location?.city || "Remote"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Posted: {new Date(job.createdAt).toLocaleDateString()} •
                      Applications: {job.applications?.length || 0}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(job._id, job.isActive)}
                    >
                      {job.isActive ? "Close" : "Reopen"}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(job._id)}
                    >
                      <HiTrash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Opportunities;
