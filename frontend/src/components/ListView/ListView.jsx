import React from "react";
import "./ListView.css";

function ListView({ tasks }) {
    return (
        <div className="list-container">
            <table>
                <thead>
                    <tr>
                        <th>Task Name</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => (
                        <tr key={task.id}>
                            <td>{task.name}</td>
                            <td>{task.status}</td>
                            <td>{task.priority}</td>
                            <td>{task.dueDate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ListView;
