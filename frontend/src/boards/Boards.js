import React, { useEffect, useState } from "react";
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
import "./style.css";

const Board = () => {
  const [columns, setColumns] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState(null);


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    axiosInstance.get("/api/boards/1/").then((res) => {
      setColumns(res.data.columns);
    });
  }, []);

  const handleDragStart = (event) => {
    const { active } = event;
    const [type, columnId, taskId] = active.id.toString().split(":");

    if (type === "column") {
      const column = columns.find((col) => col.id === parseInt(columnId));
      setActiveColumn(column);
    } else {
      const sourceColumn = columns.find((col) => col.id === parseInt(columnId));
      const task = sourceColumn.tasks.find((t) => t.id === parseInt(taskId));
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const [activeType, activeColumnId, activeTaskId] = active.id.toString().split(":");
    const [overType, overColumnId, overTaskId] = over.id.toString().split(":");

    if (activeType === "column" && overType === "column") {
      const oldIndex = columns.findIndex((col) => col.id === parseInt(activeColumnId));
      const newIndex = columns.findIndex((col) => col.id === parseInt(overColumnId));

      if (oldIndex !== newIndex) {
        const newColumns = arrayMove(columns, oldIndex, newIndex);
        setColumns(newColumns);

        await axiosInstance.post("/api/columns/reorder/", {
          columns: newColumns.map((col, index) => ({
            id: col.id,
            order: index,
          })),
        });
      }
      setActiveColumn(null);
      return;
    }

    const newColumns = [...columns];
    const sourceColumn = newColumns.find((col) => col.id === parseInt(activeColumnId));
    const targetColumn = newColumns.find((col) => col.id === parseInt(overColumnId));

    if (!sourceColumn || !targetColumn) return;

    const taskIndex = sourceColumn.tasks.findIndex((task) => task.id === parseInt(activeTaskId));
    if (taskIndex === -1) return;

    const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);
    movedTask.column = targetColumn.id;

    if (overTaskId === "placeholder") {
      targetColumn.tasks.push(movedTask);
    } else {
      const targetIndex = targetColumn.tasks.findIndex((task) => task.id === parseInt(overTaskId));
      if (targetIndex === -1) {
        targetColumn.tasks.push(movedTask);
      } else {
        targetColumn.tasks.splice(targetIndex, 0, movedTask);
      }
    }

    setColumns(newColumns);
    setActiveTask(null);

    await axiosInstance.post("/api/tasks/reorder/", {
      tasks: newColumns.flatMap((col) =>
        col.tasks.map((task, index) => ({
          id: task.id,
          order: index,
          column: col.id,
        }))
      ),
    });
  };

  const handleUpdateColumnName = async (columnId, newName) => {
    try {
      await axiosInstance.patch(`/api/columns/${columnId}/`, { name: newName });
      setColumns(columns.map(col => col.id === columnId ? { ...col, name: newName } : col));
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
        board: 1,
        order: columns.length,
      });

      setColumns((prev) => [
        ...prev,
        {
          ...res.data,
          tasks: [],
          isNew: true,
        },
      ]);
    } catch (error) {
      console.error("Ошибка при добавлении колонки:", error.response?.data || error.message);
    }
  };
  const handleDeleteColumn = async (columnId) => {
    try {
      await axiosInstance.delete(`/api/columns/${columnId}/`);
      setColumns(columns.filter((col) => col.id !== columnId));
    } catch (error) {
      console.error("Ошибка при удалении колонки:", error);
    }
  };


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
    <div className="board" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
      <SortableContext
        items={columns.map(col => `column:${col.id}`)}
        strategy={horizontalListSortingStrategy}
      >
        {columns.map((column) => (
          <div className="background-columns" key={column.id} style={{ minWidth: 300 }}>
            <Column
              column={column}
              onUpdateName={handleUpdateColumnName}
              onDelete={handleDeleteColumn}


            />
            <SortableContext
              items={column.tasks.map((task) => `task:${column.id}:${task.id}`)}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                {column.tasks.map((task) => (
                  <TaskCard key={task.id} task={{ ...task, column: column.id }} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </SortableContext>

      <button
        onClick={handleAddColumn}
        className="add-column-btn"
        style={{
          minWidth: 300,
          padding: "1rem",
          border: "2px dashed #ccc",
          borderRadius: "8px",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        + Добавить колонку
      </button>
    </div>

      <DragOverlay>
        {activeColumn ? (
          <Column column={activeColumn} onUpdateName={handleUpdateColumnName} isDragging />
        ) : activeTask ? (
          <TaskCard task={activeTask} />
        ) : null}
      </DragOverlay>

    </DndContext>
  );
};

export default Board;
