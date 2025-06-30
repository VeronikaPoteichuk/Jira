import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axios";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import Column from "./Column";
import TaskCard from "./TaskCard";
import AddTaskToggle from "./AddTaskToggle";
import EditTaskModal from "./EditTaskModal";
import "./style.css";
import { Search, X } from "lucide-react";

const Board = () => {
  const [columns, setColumns] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { boardId } = useParams();
  const cleanBoardId = boardId.replace(/^board-/, "");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (!boardId) return;
    axiosInstance.get(`/api/boards/${cleanBoardId}/`).then(res => {
      setColumns(res.data.columns);
    });
  }, [boardId]);

  const handleDragStart = event => {
    const { active } = event;
    const [type, columnId, taskId] = active.id.toString().split(":");

    if (type === "column") {
      const column = columns.find(col => col.id === parseInt(columnId));
      setActiveColumn(column);
    } else {
      const sourceColumn = columns.find(col => col.id === parseInt(columnId));
      const task = sourceColumn.tasks.find(t => t.id === parseInt(taskId));
      setActiveTask(task);
    }
  };

  const moveItem = (array, fromIndex, toIndex) => {
    const newArray = [...array];
    const [item] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, item);
    return newArray;
  };

  const reorderColumns = async (activeId, overId) => {
    const oldIndex = columns.findIndex(col => col.id === parseInt(activeId));
    const newIndex = columns.findIndex(col => col.id === parseInt(overId));

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reordered = moveItem(columns, oldIndex, newIndex);
    setColumns(reordered);

    await axiosInstance.post("/api/columns/reorder/", {
      columns: reordered.map((col, index) => ({
        id: col.id,
        order: index,
      })),
    });
  };

  const reorderTasks = async (active, over) => {
    const newColumns = [...columns];

    const sourceCol = newColumns.find(col => col.id === parseInt(active.columnId));
    const targetCol = newColumns.find(col => col.id === parseInt(over.columnId));
    if (!sourceCol || !targetCol) return;

    const fromIndex = sourceCol.tasks.findIndex(t => t.id === parseInt(active.taskId));
    if (fromIndex === -1) return;

    const [movedTask] = sourceCol.tasks.splice(fromIndex, 1);
    movedTask.column = targetCol.id;

    if (over.taskId === "placeholder") {
      targetCol.tasks.push(movedTask);
    } else {
      const toIndex = targetCol.tasks.findIndex(t => t.id === parseInt(over.taskId));
      const insertIndex = toIndex === -1 ? targetCol.tasks.length : toIndex;
      targetCol.tasks.splice(insertIndex, 0, movedTask);
    }

    setColumns(newColumns);
    setActiveTask(null);

    await axiosInstance.post("/api/tasks/reorder/", {
      tasks: newColumns.flatMap(col =>
        col.tasks.map((task, index) => ({
          id: task.id,
          order: index,
          column: col.id,
        })),
      ),
    });
  };

  const handleDragEnd = async event => {
    const { active, over } = event;
    if (!over) return;

    const [activeType, activeColId, activeTaskId] = active.id.toString().split(":");
    const [overType, overColId, overTaskId] = over.id.toString().split(":");

    if (activeType === "column" && overType === "column") {
      await reorderColumns(activeColId, overColId);
      setActiveColumn(null);
      return;
    }

    await reorderTasks(
      { columnId: activeColId, taskId: activeTaskId },
      { columnId: overColId, taskId: overTaskId },
    );
  };

  const handleUpdateColumnName = async (columnId, newName) => {
    try {
      await axiosInstance.patch(`/api/columns/${columnId}/`, { name: newName });
      setColumns(columns.map(col => (col.id === columnId ? { ...col, name: newName } : col)));
      return true;
    } catch (error) {
      console.error("Failed to update column name:", error);
      return false;
    }
  };

  const handleAddColumn = async () => {
    try {
      const res = await axiosInstance.post("/api/columns/", {
        name: "New column",
        board: cleanBoardId,
        order: columns.length,
      });

      setColumns(prev => [
        ...prev,
        {
          ...res.data,
          tasks: [],
          isNew: true,
        },
      ]);
    } catch (error) {
      console.error("Error adding column:", error.response?.data || error.message);
    }
  };

  const handleDeleteColumn = async columnId => {
    try {
      await axiosInstance.delete(`/api/columns/${columnId}/`);
      setColumns(columns.filter(col => col.id !== columnId));
    } catch (error) {
      console.error("Error deleting column:", error);
    }
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

      setColumns(columns =>
        columns.map(col =>
          col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col,
        ),
      );
    } catch (error) {
      console.error("Error adding task:", error.response?.data || error.message);
    }
  };

  const handleUpdateTask = updatedTask => {
    setColumns(prevColumns =>
      prevColumns.map(column => {
        if (column.tasks.some(task => task.id === updatedTask.id)) {
          return {
            ...column,
            tasks: column.tasks.map(task =>
              task.id === updatedTask.id ? { ...task, ...updatedTask } : task,
            ),
          };
        }
        return column;
      }),
    );
  };

  const getTaskById = id => {
    for (const col of columns) {
      const task = col.tasks.find(t => t.id === id);
      if (task) return task;
    }
    return null;
  };

  const filterTasks = tasks =>
    tasks.filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDeleteTask = async (taskId, columnId) => {
    try {
      await axiosInstance.delete(`/api/tasks/${taskId}/`);
      setColumns(prev =>
        prev.map(col =>
          col.id === columnId
            ? {
                ...col,
                tasks: col.tasks.filter(task => task.id !== taskId),
              }
            : col,
        ),
      );

      if (editingTask?.id === taskId) {
        setEditingTask(null);
      }

      if (activeTask?.id === taskId) {
        setActiveTask(null);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="search-container">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search for task..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="board" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <SortableContext
            items={columns.map(col => `column:${col.id}`)}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map(column => (
              <div key={column.id} className="column-background">
                <div
                  className="background-columns"
                  style={{
                    minWidth: 300,
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "100%",
                  }}
                >
                  <Column
                    column={column}
                    onUpdateName={handleUpdateColumnName}
                    onDelete={handleDeleteColumn}
                  />

                  <SortableContext
                    items={column.tasks.map(task => `task:${column.id}:${task.id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="tasks-scroll-area">
                      {filterTasks(column.tasks).map(task => (
                        <TaskCard
                          key={task.id}
                          task={{ ...task, column: column.id }}
                          onDelete={taskId => handleDeleteTask(taskId, column.id)}
                          onClick={taskId => {
                            const freshTask = getTaskById(taskId);
                            setEditingTask(freshTask);
                          }}
                          onUpdate={handleUpdateTask}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  <div className="add-task-fixed">
                    <AddTaskToggle columnId={column.id} onAddTask={handleAddTask} />
                  </div>
                </div>
              </div>
            ))}
          </SortableContext>
          <button onClick={handleAddColumn} className="add-column-btn">
            + Add column
          </button>
        </div>

        <DragOverlay>
          {activeColumn ? (
            <Column column={activeColumn} onUpdateName={handleUpdateColumnName} isDragging />
          ) : activeTask ? (
            <TaskCard
              task={activeTask}
              onDelete={() => handleDeleteTask(activeTask.id, activeTask.column)}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleUpdateTask}
          onDelete={taskId => handleDeleteTask(taskId, editingTask.column)}
        />
      )}
    </>
  );
};

export default Board;
