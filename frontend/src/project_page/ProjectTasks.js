import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import axiosInstance from "../api/axios";
import { Search, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import EditTaskModal from "../boards/EditTaskModal";
import AddTaskToggle from "../boards/AddTaskToggle";
import "./style.css";

const ITEMS_PER_PAGE = 10;

const ProjectTasks = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("pagination");
  const loader = useRef(null);
  const [columns, setColumns] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/tasks/?project=${projectId}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  }, [projectId]);

  useEffect(() => {
    axiosInstance.get("/api/boards/1/").then(res => {
      setColumns(res.data.columns);
    });
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTitleClick = task => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const handleTitleChange = e => {
    setEditingTitle(e.target.value);
  };

  const handleTitleBlur = async taskId => {
    try {
      await axiosInstance.patch(`/api/tasks/${taskId}/`, {
        title: editingTitle,
      });
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, title: editingTitle } : t)));
    } catch (error) {
      console.error("Error updating title:", error);
    }
    setEditingTaskId(null);
    setEditingTitle("");
  };

  const sortedFilteredTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

    filtered.sort((a, b) => {
      const { key, direction } = sortConfig;

      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = (aVal ?? "").toString();
      const bStr = (bVal ?? "").toString();

      return direction === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    return filtered;
  }, [tasks, searchQuery, sortConfig]);

  const paginatedTasks = useMemo(() => {
    if (viewMode === "pagination") {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return sortedFilteredTasks.slice(start, start + ITEMS_PER_PAGE);
    } else {
      return sortedFilteredTasks.slice(0, currentPage * ITEMS_PER_PAGE);
    }
  }, [sortedFilteredTasks, currentPage, viewMode]);

  const totalPages = Math.ceil(sortedFilteredTasks.length / ITEMS_PER_PAGE);

  const requestSort = key => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  useEffect(() => {
    if (viewMode !== "infinite") return;

    const observer = new IntersectionObserver(
      entries => {
        if (
          entries[0].isIntersecting &&
          currentPage * ITEMS_PER_PAGE < sortedFilteredTasks.length
        ) {
          setCurrentPage(prev => prev + 1);
        }
      },
      {
        root: document.querySelector(".tasks-scroll-wrapper"),
        rootMargin: "0px",
        threshold: 1.0,
      },
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current);
      }
    };
  }, [currentPage, sortedFilteredTasks.length, viewMode]);

  const handleViewModeChange = e => {
    setViewMode(e.target.value);
    setCurrentPage(1);
  };

  const openTaskModal = task => {
    setSelectedTask(task);
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
  };

  const handleAddTask = async (columnId, title) => {
    try {
      const column = columns.find(col => col.id === columnId);
      const order = column.tasks.length;

      const response = await axiosInstance.post("/api/tasks/", {
        title,
        column: columnId,
        order,
      });

      const newTask = response.data;
      if (!columnId) {
        console.error("No columnId provided to AddTaskToggle");
        return;
      }
      setColumns(columns =>
        columns.map(col =>
          col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col,
        ),
      );

      setTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error("Error adding task:", error.response?.data || error.message);
    }
  };

  const handleTaskSave = updatedTask => {
    setColumns(prevColumns =>
      prevColumns.map(col => {
        if (col.id !== updatedTask.column) return col;

        const tasks = col.tasks.map(task => (task.id === updatedTask.id ? updatedTask : task));

        return { ...col, tasks };
      }),
    );

    setTasks(prev => prev.map(task => (task.id === updatedTask.id ? updatedTask : task)));
  };

  const SortIndicator = ({ columnKey, sortConfig }) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === "asc" ? (
        <ArrowUp size={14} style={{ marginLeft: 4 }} />
      ) : (
        <ArrowDown size={14} style={{ marginLeft: 4 }} />
      );
    }

    return <ArrowUpDown size={14} style={{ marginLeft: 4, opacity: 0.4 }} />;
  };

  return (
    <div className="project-tasks">
      <h2 className="tasks-heading">Tasks of project</h2>
      <div className="controls">
        <div className="search-task-container">
          <Search className="search-task-icon" size={16} />

          <input
            type="text"
            placeholder="Search task..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="task-search-input"
          />
          {searchQuery && (
            <button
              className="clear-search-button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <select value={viewMode} onChange={handleViewModeChange}>
          <option value="infinite">Scroll</option>
          <option value="pagination">Pagination</option>
        </select>
      </div>
      <div className={`tasks-scroll-wrapper ${viewMode}`}>
        <div className="table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th onClick={() => requestSort("id")}>
                  Key
                  <SortIndicator columnKey="id" sortConfig={sortConfig} />
                </th>
                <th onClick={() => requestSort("title")}>
                  Topic
                  <SortIndicator columnKey="title" sortConfig={sortConfig} />
                </th>
                <th>Status</th>
                <th onClick={() => requestSort("created_at")}>
                  Created by
                  <SortIndicator columnKey="created_at" sortConfig={sortConfig} />
                </th>
                <th onClick={() => requestSort("updated_at")}>
                  Date of update
                  <SortIndicator columnKey="updated_at" sortConfig={sortConfig} />
                </th>
                <th onClick={() => requestSort("author_username")}>
                  Author
                  <SortIndicator columnKey="author_username" sortConfig={sortConfig} />
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedTasks.map(task => (
                <tr key={task.id}>
                  <td>
                    <button className="task-key-button" onClick={() => openTaskModal(task)}>
                      {task.project_name && task.id ? `${task.project_name}-${task.id}` : ""}
                    </button>
                  </td>
                  <td onClick={() => handleTitleClick(task)} className="clickable-cell">
                    {editingTaskId === task.id ? (
                      <input
                        type="text"
                        className="edit-task-title-input"
                        value={editingTitle}
                        onChange={handleTitleChange}
                        onBlur={() => handleTitleBlur(task.id)}
                        autoFocus
                      />
                    ) : (
                      task.title
                    )}
                  </td>
                  <td>{task.column?.name || "—"}</td>
                  <td>{new Date(task.created_at).toLocaleDateString()}</td>
                  <td>{new Date(task.updated_at).toLocaleDateString()}</td>
                  <td>{task.author_username || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {viewMode === "infinite" && <div ref={loader} />}
      </div>

      {viewMode === "infinite" && (
        <footer className="tasks-footer">
          <AddTaskToggle columnId={columns[0]?.id} onAddTask={handleAddTask} />
        </footer>
      )}

      {viewMode === "pagination" && (
        <div className="pagination">
          <button
            className="pagination-button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Back
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
      {selectedTask && (
        <EditTaskModal task={selectedTask} onClose={closeTaskModal} onSave={handleTaskSave} />
      )}
    </div>
  );
};

export default ProjectTasks;
