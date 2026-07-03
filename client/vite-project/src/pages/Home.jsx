import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import InputPanel from "../components/InputPanel";
import OutputPanel from "../components/OutputPanel";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Home({ selectedItem, onGenerationSuccess }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (selectedItem) {
      setData(selectedItem.output);
    }
  }, [selectedItem]);

  const handleGenerate = async (payload) => {
    try {
      setLoading(true);
      setData(null);

      if (!currentUser) {
        throw new Error("You must be logged in.");
      }

      const token = await currentUser.getIdToken();

      const response = await fetch(
        `${API_URL}/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      setData(result.data);

      // Trigger sidebar reload
      if (onGenerationSuccess) {
        onGenerationSuccess();
      }

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        padding: "20px 40px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <InputPanel
        onGenerate={handleGenerate}
        loading={loading}
      />

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#94a3b8", padding: "10px 0" }}>
          <div className="spinner" style={{ width: "20px", height: "20px", margin: 0 }}></div>
          <span>Generating content...</span>
        </div>
      )}

      {data && <OutputPanel data={data} />}
    </div>
  );
}