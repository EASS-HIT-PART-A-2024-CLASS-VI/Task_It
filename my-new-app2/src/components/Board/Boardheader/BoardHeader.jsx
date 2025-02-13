import React, { useState } from "react";
import { Box, Typography, IconButton, TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

const BoardHeader = ({ boardName, onUpdateBoardName }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newBoardName, setNewBoardName] = useState(boardName);

    const handleSave = () => {
        if (newBoardName.trim() !== "") {
            onUpdateBoardName(newBoardName);
            setIsEditing(false);
        }
    };

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, padding: 2 }}>
            {isEditing ? (
                <TextField
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    onBlur={handleSave}
                    autoFocus
                />
            ) : (
                <Typography variant="h5">{boardName}</Typography>
            )}
            <IconButton onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <SaveIcon /> : <EditIcon />}
            </IconButton>
        </Box>
    );
};

export default BoardHeader;
