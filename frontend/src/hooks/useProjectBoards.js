import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axios";
import { useParams } from "react-router-dom";

export const useProjectBoards = () => {
  const { projectId } = useParams();
  const cleanProjectId = projectId?.match(/^project-(\d+)$/)?.[1] || "";

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjectBoards = useCallback(async () => {
    if (!cleanProjectId) {
      console.error("Invalid project ID");
      return;
    }

    try {
      setLoading(true);
      const boardsRes = await axiosInstance.get(`/api/projects/${cleanProjectId}/boards/`);
      setBoards(boardsRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load project boards.");
    } finally {
      setLoading(false);
    }
  }, [cleanProjectId]);

  useEffect(() => {
    fetchProjectBoards();
  }, [fetchProjectBoards]);

  return {
    boards,
    loading,
    error,
    cleanProjectId,
    refetch: fetchProjectBoards,
  };
};
