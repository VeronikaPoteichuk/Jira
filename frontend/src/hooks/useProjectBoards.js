import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import { useParams } from "react-router-dom";

export const useProjectBoards = () => {
  const { projectId } = useParams();
  const cleanProjectId = projectId?.match(/^project-(\d+)$/)?.[1] || "";

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectBoards = async () => {
      if (!cleanProjectId) {
        console.error("Invalid project ID");
        return;
      }

      try {
        const boardsRes = await axiosInstance.get(`/api/projects/${cleanProjectId}/boards/`);
        setBoards(boardsRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load project boards.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectBoards();
  }, [cleanProjectId]);

  return {
    boards,
    loading,
    error,
    cleanProjectId,
  };
};
