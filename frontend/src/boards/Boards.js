import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Column from "./Column";
import TaskCard from "./TaskCard";
import "./style.css";

const Board = () => {
  const [columns, setColumns] = useState([]);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    axiosInstance.get("/api/boards/1/").then((res) => {
      setColumns(res.data.columns);
    });
  }, []);

  const handleDragStart = (event) => {
    const { active } = event;
    const [sourceColumnId, taskId] = active.id.split(":");
    const sourceColumn = columns.find((col) => col.id === parseInt(sourceColumnId));
    const task = sourceColumn.tasks.find((t) => t.id === parseInt(taskId));
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const [sourceColumnId, taskId] = active.id.split(":");
    const [targetColumnId, targetTaskId] = over.id.split(":");

    if (!taskId) return;

    const newColumns = [...columns];
    const sourceColumn = newColumns.find((col) => col.id === parseInt(sourceColumnId));
    const targetColumn = newColumns.find((col) => col.id === parseInt(targetColumnId));

    const taskIndex = sourceColumn.tasks.findIndex((task) => task.id === parseInt(taskId));
    const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);
    movedTask.column = targetColumn.id;

    if (targetTaskId === "placeholder") {
      targetColumn.tasks.push(movedTask);
    } else if (sourceColumnId === targetColumnId) {
      const targetIndex = targetColumn.tasks.findIndex((task) => task.id === parseInt(targetTaskId));
      targetColumn.tasks.splice(targetIndex, 0, movedTask);
    } else {
      const targetIndex = targetColumn.tasks.findIndex((task) => task.id === parseInt(targetTaskId));
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="board" style={{ display: "flex", gap: "1rem" }}>
        {columns.map((column) => (
          <SortableContext
            key={column.id}
            items={column.tasks.map((task) => `${column.id}:${task.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <Column column={column} />
          </SortableContext>
        ))}
      </div>
      <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
    </DndContext>

  );
};

export default Board;
