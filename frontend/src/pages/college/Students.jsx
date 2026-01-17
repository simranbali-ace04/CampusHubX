import { useEffect, useState } from "react";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setError("No logged-in college found.");
      setLoading(false);
      return;
    }

    const college = JSON.parse(storedUser);
    const collegeId = college._id || college.id;

    if (!collegeId) {
      setError("College ID not found in localStorage.");
      setLoading(false);
      return;
    }

    const token = college.token || localStorage.getItem("token");

    fetch(`http://localhost:5000/api/colleges/${collegeId}/students`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to fetch students");
        }
        return res.json();
      })
      .then((data) => {
        // 🔥 IMPORTANT FIX: normalize response safely
        const list = Array.isArray(data?.data?.data)
    ? data.data.data
    : [];

        setStudents(list);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h2 style={{ padding: "20px" }}>Loading students...</h2>;
  }

  if (error) {
    return <h2 style={{ padding: "20px", color: "red" }}>{error}</h2>;
  }

  if (students.length === 0) {
    return <h2 style={{ padding: "20px" }}>No students registered yet.</h2>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
  <h1 style={{ marginBottom: "16px" }}>Registered Students</h1>

  <div style={{ overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <thead>
        <tr style={{ background: "#f3f4f6" }}>
          <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
            Name
          </th>
          <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
            Branch
          </th>
          <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
            Year
          </th>
          <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
            Skills
          </th>
        </tr>
      </thead>

      <tbody>
        {students.map((s) => (
          <tr key={s._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
            <td style={{ padding: "12px" }}>
              {s.firstName} {s.lastName}
            </td>
            <td style={{ padding: "12px" }}>{s.branch || "N/A"}</td>
            <td style={{ padding: "12px" }}>{s.yearOfStudy || "N/A"}</td>
            <td style={{ padding: "12px" }}>
              {Array.isArray(s.skills) && s.skills.length > 0
                ? s.skills.map(sk => sk.name || sk).join(", ")
                : "No skills listed"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
  );
}
