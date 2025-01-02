import React from "react";
import "./Kanban.css";

function Kanban({ tasks }) {
    return (
        <div className="kanban-container">
            <div className="kanban-column">
                <h3>To Do</h3>
                <ul>
                    {tasks.toDo.map((task) => (
                        <li key={task.id}>{task.name}</li>
                    ))}
                </ul>
            </div>
            <div className="kanban-column">
                <h3>In Progress</h3>
                <ul>
                    {tasks.inProgress.map((task) => (
                        <li key={task.id}>{task.name}</li>
                    ))}
                </ul>
            </div>
            <div className="kanban-column">
                <h3>Done</h3>
                <ul>
                    {tasks.done.map((task) => (
                        <li key={task.id}>{task.name}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Kanban;
