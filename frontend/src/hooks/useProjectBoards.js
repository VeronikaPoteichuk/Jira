import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axios";

export const useProjectBoards = () => {
  const { projectId } = useParams();
  const cleanProjectId = projectId?.match(/^project-(\d+)$/)?.[1] || "";

  const [boards, setBoards] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjectBoards = useCallback(async () => {
    if (!cleanProjectId) return;

    try {
      setLoading(true);
      const [projectRes, boardsRes] = await Promise.all([
        axiosInstance.get(`/api/projects/${cleanProjectId}/`),
        axiosInstance.get(`/api/projects/${cleanProjectId}/boards/`),
      ]);

      setProject(projectRes.data);
      setBoards(boardsRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load project data.");
    } finally {
      setLoading(false);
    }
  }, [cleanProjectId]);

  useEffect(() => {
    fetchProjectBoards();
  }, [fetchProjectBoards]);

  return {
    boards,
    project,
    loading,
    error,
    cleanProjectId,
    refetch: fetchProjectBoards,
  };
};
