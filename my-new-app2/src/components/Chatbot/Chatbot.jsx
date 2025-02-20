import { useState, useEffect } from "react";
import axios from "axios";

export default function Chatbot() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [tasks, setTasks] = useState([]);
    const API_URL = "http://localhost:8000/api/chatbot";

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const response = await axios.post(API_URL, { message: "summarize all tasks" }, {
            headers: { Authorization: `Bearer ${token}` }});
            setTasks(response.data.reply.split("\n"));
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage = { sender: "You", text: input };
        setMessages([...messages, userMessage]);

        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const response = await axios.post(API_URL, { message: input }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const botMessage = { sender: "Bot", text: response.data.reply };
            setMessages([...messages, userMessage, botMessage]);

            if (input.toLowerCase().includes("create") || input.toLowerCase().includes("assign")) {
                fetchTasks();
            }
        } catch (error) {
            console.error("Error:", error);
        }

        setInput("");
    };

    return (
        <div className="p-4 border rounded-lg w-96 bg-white shadow-lg">
            <h2 className="text-xl font-bold mb-2">AI Chatbot</h2>
            <div className="h-48 overflow-y-auto mb-4 border p-2">
                {messages.map((msg, index) => (
                    <div key={index} className={`p-2 rounded ${msg.sender === "You" ? "bg-blue-200" : "bg-gray-200"}`}>
                        <strong>{msg.sender}:</strong> {msg.text}
                    </div>
                ))}
            </div>
            <input
                className="w-full p-2 border rounded"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
            />
            <button className="w-full mt-2 bg-blue-500 text-white p-2 rounded" onClick={sendMessage}>
                Send
            </button>
            <h3 className="text-lg font-bold mt-4">Tasks</h3>
            <ul className="mt-2">
                {tasks.map((task, index) => (
                    <li key={index} className="p-2 bg-gray-100 rounded mb-1">{task}</li>
                ))}
            </ul>
        </div>
    );
}
