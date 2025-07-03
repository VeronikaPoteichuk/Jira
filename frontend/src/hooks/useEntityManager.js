import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

export function useEntityManager(endpoint) {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const fetchEntities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(endpoint);
      setEntities(res.data);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, [endpoint]);

  const createEntity = async data => {
    try {
      setCreating(true);
      await axiosInstance.post(endpoint, data);
      await fetchEntities();
    } catch (err) {
      console.error(err);
      alert("Create failed");
    } finally {
      setCreating(false);
    }
  };

  const renameEntity = async (id, newName) => {
    try {
      await axiosInstance.patch(`${endpoint}${id}/`, { name: newName });
      await fetchEntities();
    } catch (err) {
      console.error(err);
      alert("Rename failed");
    }
  };

  const deleteEntity = async id => {
    try {
      await axiosInstance.delete(`${endpoint}${id}/`);
      await fetchEntities();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return {
    entities,
    loading,
    creating,
    error,
    createEntity,
    renameEntity,
    deleteEntity,
    refetch: fetchEntities,
  };
}
