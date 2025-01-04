import React from "react";
import { useParams } from "react-router-dom";

function Board({ boards }) {
    const { boardId } = useParams();

    // Convert boardId to a number since it’s passed as a string
    const board = boards.find((b) => b.id === Number(boardId));

    if (!board) {
        return <div>Board not found</div>;
    }

    return (
        <div>
            <h1>{board.name}</h1>
            <p>Board ID: {board.id}</p>
            {/* Add more board-specific details here */}
        </div>
    );
}

export default Board;
