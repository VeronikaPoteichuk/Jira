// import React, { useState } from 'react';
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragOverlay
// } from '@dnd-kit/core';
// import {
//   SortableContext,
//   useSortable,
//   arrayMove,
//   verticalListSortingStrategy,
//   horizontalListSortingStrategy
// } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import './style.css';

// const initialData = {
//   columns: [
//     {
//       id: 'todo',
//       title: 'To Do',
//       tasks: [
//         { id: 'task-1', content: 'Create login UI' },
//         { id: 'task-2', content: 'Write unit tests' },
//       ],
//     },
//     {
//       id: 'in-progress',
//       title: 'In Progress',
//       tasks: [
//         { id: 'task-3', content: 'Connect API endpoints' },
//       ],
//     },
//     {
//       id: 'done',
//       title: 'Done',
//       tasks: [
//         { id: 'task-4', content: 'Deploy to production' },
//       ],
//     },
//   ],
// };

// function TaskBoard() {
//   const [columns, setColumns] = useState(initialData.columns);
//   const [activeTask, setActiveTask] = useState(null);
//   const [activeColumn, setActiveColumn] = useState(null);

//   const sensors = useSensors(useSensor(PointerSensor));

//   const handleDragStart = (event) => {
//     const { active } = event;
//     const task = findTask(active.id);
//     const column = columns.find(col => col.id === active.id);

//     if (task) setActiveTask(task);
//     else if (column) setActiveColumn(column);
//   };

//   const handleDragEnd = (event) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) {
//       resetDrag();
//       return;
//     }

//     // Перемещение колонок
//     if (columns.some(col => col.id === active.id)) {
//       const oldIndex = columns.findIndex(col => col.id === active.id);
//       const newIndex = columns.findIndex(col => col.id === over.id);
//       setColumns(arrayMove(columns, oldIndex, newIndex));
//       resetDrag();
//       return;
//     }

//     // Перемещение задач
//     const fromColumn = columns.find(col =>
//       col.tasks.some(task => task.id === active.id)
//     );
//     const toColumn = columns.find(col =>
//       col.id === over.id ||
//       col.tasks.some(task => task.id === over.id)
//     );

//     if (!fromColumn || !toColumn) {
//       resetDrag();
//       return;
//     }

//     const task = fromColumn.tasks.find(t => t.id === active.id);

//     if (fromColumn.id === toColumn.id) {
//       const oldIdx = fromColumn.tasks.findIndex(t => t.id === active.id);
//       const newIdx = toColumn.tasks.findIndex(t => t.id === over.id);
//       const updatedTasks = arrayMove(fromColumn.tasks, oldIdx, newIdx);
//       updateColumnTasks(fromColumn.id, updatedTasks);
//     } else {
//       const newFrom = fromColumn.tasks.filter(t => t.id !== active.id);
//       const insertIndex = toColumn.tasks.findIndex(t => t.id === over.id);
//       const newTo = [...toColumn.tasks];
//       if (insertIndex === -1) newTo.push(task);
//       else newTo.splice(insertIndex, 0, task);

//       updateColumnTasks(fromColumn.id, newFrom);
//       updateColumnTasks(toColumn.id, newTo);
//     }

//     resetDrag();
//   };

//   const updateColumnTasks = (columnId, newTasks) => {
//     setColumns(prev =>
//       prev.map(col =>
//         col.id === columnId ? { ...col, tasks: newTasks } : col
//       )
//     );
//   };

//   const resetDrag = () => {
//     setActiveTask(null);
//     setActiveColumn(null);
//   };

//   const findTask = (taskId) => {
//     for (let col of columns) {
//       const found = col.tasks.find(t => t.id === taskId);
//       if (found) return found;
//     }
//     return null;
//   };

//   return (
//     <DndContext
//       sensors={sensors}
//       collisionDetection={closestCenter}
//       onDragStart={handleDragStart}
//       onDragEnd={handleDragEnd}
//     >
//       <div className="taskboard">
//         <SortableContext
//           items={columns.map(col => col.id)}
//           strategy={horizontalListSortingStrategy}
//         >
//           {columns.map(col => (
//             <Column key={col.id} column={col} />
//           ))}
//         </SortableContext>

//         <DragOverlay>
//           {activeTask ? <TaskCard task={activeTask} isDragging /> :
//            activeColumn ? <Column column={activeColumn} isDragging /> : null}
//         </DragOverlay>
//       </div>
//     </DndContext>
//   );
// }

// function Column({ column, isDragging }) {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
//     id: column.id,
//   });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <div
//       className={`column-wrapper ${isDragging ? 'dragging' : ''}`}
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       {...listeners}
//     >
//       <div className="column">
//         <h2 className="column-title">{column.title}</h2>
//         <SortableContext
//           items={column.tasks.map(t => t.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <div className="task-list">
//             {column.tasks.map(task => (
//               <SortableTaskCard key={task.id} task={task} />
//             ))}
//           </div>
//         </SortableContext>
//       </div>
//     </div>
//   );
// }

// function SortableTaskCard({ task }) {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
//     id: task.id,
//   });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
//       <TaskCard task={task} />
//     </div>
//   );
// }

// function TaskCard({ task, isDragging }) {
//   return (
//     <div className={`task-card ${isDragging ? 'dragging' : ''}`}>
//       {task.content}
//     </div>
//   );
// }

// export default TaskBoard;


import React, { useEffect, useState } from "react";
import axiosInstance from '../api/axios';
import "./style.css";

const TaskBoard = ({ boardId }) => {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`/api/boards/1/`)
      .then((response) => {
        setBoard(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Ошибка загрузки доски:", error);
        setLoading(false);
      });
  }, [boardId]);

  if (loading) return <div className="text-center mt-10">Загрузка...</div>;
  if (!board) return <div className="text-center mt-10 text-red-500">Ошибка загрузки доски</div>;

  return (
  <div className="board-container">
    <h2 className="board-title">{board.name}</h2>
    <div className="columns-wrapper">
      {board.columns.map((column) => (
        <div key={column.id} className="column">
          <h3 className="column-title">
            {column.name}
            <span
              className={`task-count ${
                column.tasks.length > 10
                  ? "count-high"
                  : column.tasks.length >= 5
                  ? "count-medium"
                  : "count-low"
              }`}
            >
              {column.tasks.length}
            </span>

          </h3>
          <div>
            {column.tasks.map((task) => (
              <div key={task.id} className="task">
                <div className="task-title">{task.title}</div>
                {task.description && (
                  <div className="task-description">{task.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};

export default TaskBoard;
