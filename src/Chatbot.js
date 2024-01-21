import React, { useState } from "react";
import axios from "axios";
import "./Chatbot.css";

// Chatbot component for interacting with a GPT model via a backend service
const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  // Function to send user input to the backend and get AI response
  const chatWithGPTJ = async (userInput) => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/generate", {
        text: userInput,
      });
      console.error('message sent');
      return response.data.response;
    } catch (error) {
      console.error("Error communicating with the backend:", error.message);
      return "";
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { text: input, user: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const aiMessage = { text: "...", user: false };
    setMessages((prevMessages) => [...prevMessages, aiMessage]);
    const response = await chatWithGPTJ(input);
    const newAiMessage = { text: response, user: false };
    setMessages((prevMessages) => [...prevMessages.slice(0, -1), newAiMessage]);
    setInput("");
  };
  // Render the chatbot interface
  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.user ? "user-message" : "ai-message"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <form className="chatbot-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
export default Chatbot;
