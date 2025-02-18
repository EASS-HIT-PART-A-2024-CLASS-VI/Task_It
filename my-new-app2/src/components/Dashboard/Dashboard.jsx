import React, { useState, useEffect } from 'react';
import './Dashboard.css';
const Dashboard = () => {
    const [boards, setBoards] = useState([]);

    useEffect(() => {
        // Fetch the boards from an API or a local source
        const fetchBoards = async () => {
            // Replace with your data fetching logic
            const response = await fetch('/api/boards');
            const data = await response.json();
            setBoards(data);
        };

        fetchBoards();
    }, []);

    return (
        <div>
            <h1>My Dashboard</h1>
            <div>
                {boards.length > 0 ? (
                    boards.map((board) => (
                        <div key={board.id} className="board">
                            <h2>{board.name}</h2>
                            <p>{board.description}</p>
                        </div>
                    ))
                ) : (
                    <p>No boards registered.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;