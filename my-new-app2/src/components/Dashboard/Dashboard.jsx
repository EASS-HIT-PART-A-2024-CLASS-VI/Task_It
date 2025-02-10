import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import "./Dashboard.css";

function Dashboard({ groups }) {
    return (
        <div className="dashboard-container">
            <Sidebar groups={groups} />
            <div className="dashboard-content">
                <h1>Dashboard</h1>
                <div className="widgets">
                    <div className="widget">Calendar Widget</div>
                    <div className="widget">Task Widget</div>
                    <div className="widget">Tracking Widget</div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;