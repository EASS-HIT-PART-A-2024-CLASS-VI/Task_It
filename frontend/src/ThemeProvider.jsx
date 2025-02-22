import React, { useState, useEffect, createContext, useContext } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

const ThemeContext = createContext();

export const ThemeProviderWrapper = ({ children }) => {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("darkMode") === "true"
    );

    useEffect(() => {
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    const theme = createTheme({
        palette: {
            mode: darkMode ? "dark" : "light",
            primary: { main: "#1976d2" }, // Blue
            secondary: { main: "#ff9800" }, // Orange
            background: {
                default: darkMode ? "#121212" : "#f5f5f5",
                paper: darkMode ? "#1e1e1e" : "#fff",
            },
            text: {
                primary: darkMode ? "#ffffff" : "#000000",
            },
        },
    });

    return (
        <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline /> {/* ✅ Applies global theme changes */}
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
