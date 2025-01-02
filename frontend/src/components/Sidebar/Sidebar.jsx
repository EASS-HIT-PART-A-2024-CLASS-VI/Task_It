import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ groups = [] }) {
    const [expandedGroup, setExpandedGroup] = useState(null);

    const toggleGroup = (groupId) => {
        setExpandedGroup(expandedGroup === groupId ? null : groupId);
    };

    return (
        <div className="sidebar">
            <h2>Planner</h2>
            <div className="menu">
                <NavLink to="/dashboard" className="menu-item">
                    🏠 Dashboard
                </NavLink>
                <NavLink to="/tasks" className="menu-item">
                    ✅ My Tasks
                </NavLink>
                <NavLink to="/programs" className="menu-item">
                    📅 My Programs
                </NavLink>
            </div>
            <hr />
            <h3>Your Groups</h3>
            <ul className="group-list">
                {groups.length > 0 ? (
                    groups.map((group) => (
                        <li key={group.id} className="group-item">
                            <div
                                className="group-name"
                                onClick={() => toggleGroup(group.id)}
                            >
                                {group.name}
                            </div>
                            {expandedGroup === group.id && (
                                <ul className="sub-menu">
                                    <NavLink to={`/kanban/${group.id}`} className="sub-menu-item">
                                        🗂 Kanban
                                    </NavLink>
                                    <NavLink to={`/schedule/${group.id}`} className="sub-menu-item">
                                        📅 Schedule
                                    </NavLink>
                                    <NavLink to={`/list/${group.id}`} className="sub-menu-item">
                                        📋 List View
                                    </NavLink>
                                </ul>
                            )}
                        </li>
                    ))
                ) : (
                    <p>No groups available</p>
                )}
            </ul>
            <button className="new-group-button">➕ New Group</button>
        </div>
    );
}

export default Sidebar;
