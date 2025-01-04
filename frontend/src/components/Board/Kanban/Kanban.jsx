import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

function Kanban() {
    const { boardname } = useParams();

    useEffect(() => {
        // Fetch board data by board name
        fetch(`/api/boards/${boardname}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                // Handle board data here
            })
            .catch((error) => console.error("Error fetching board data:", error));
    }, [boardname]);

    return (
        <div>
            <h1>{boardname} - Kanban</h1>
            {/* Kanban view implementation */}
        </div>
    );
}

export default Kanban;
