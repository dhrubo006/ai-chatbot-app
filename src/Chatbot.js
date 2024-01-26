import React, { useState } from "react";
import axios from "axios";
import "./Chatbot.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faMicrophoneSlash,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  // Function to send user input to the backend and get AI response
  /*const chatWithGPTJ = async (userInput, audio = false) => {
    try {
      const payload = audio ? userInput : { text: userInput };
      //const headers = audio ? { "Content-Type": "multipart/form-data" } : {};
      const response = await axios.post(
        "http://127.0.0.1:5000/generate",
        payload,
        { headers }
      );
      console.log("Message sent:", response.data);
      return response.data.response;
    } catch (error) {
      console.error("Error communicating with the backend:", error);
      return "";
    }
  };*/
  // Function to send user input to the backend and get AI response
  const chatWithGPTJ = async (userInput, audio = false) => {
    try {
      let payload;
      let headers = {};

      if (audio) {
        payload = userInput;
      } else {
        payload = JSON.stringify({ text: userInput });
        headers = { "Content-Type": "application/json" };
      }

      const response = await axios.post(
        "http://127.0.0.1:5000/generate",
        payload,
        { headers }
      );
      console.log("Message sent:", response.data);
      return response.data.response;
    } catch (error) {
      console.error("Error communicating with the backend:", error);
      return "";
    }
  };

  // Function to start recording audio
  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream);
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);

        // Collect the audio data chunks
        const chunks = [];
        recorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        // When recording stops, compile the chunks into a single audio Blob
        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: "audio/mpeg" });
          const audioUrl = URL.createObjectURL(audioBlob);
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: "audio", content: audioUrl, user: true },
          ]);
          const formData = new FormData();
          formData.append("audio", audioBlob);

          // Send the audio file to the server and process the response
          const aiResponse = await chatWithGPTJ(formData, true);
          if (aiResponse) {
            const aiMessage = {
              type: "text",
              content: aiResponse,
              user: false,
            };
            setMessages((prevMessages) => [...prevMessages, aiMessage]);
            speak(aiResponse); // Read the AI response aloud
          }
        };
      })
      .catch((error) => {
        console.error("Error accessing the microphone:", error);
      });
  };

  // Function to stop recording audio
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Handle form submission for text messages
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { type: "text", content: input, user: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const aiResponse = await chatWithGPTJ(input);
    if (aiResponse) {
      const aiMessage = { type: "text", content: aiResponse, user: false };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
      speak(aiResponse); // Read the AI response aloud
      console.log('speak function called')
    }
    setInput("");
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-name">AI Chatbot</div>
      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.user ? "user" : "bot"}`}
          >
            {message.type === "text" ? (
              message.content
            ) : (
              <audio controls src={message.content}>
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chatbot-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="text-input"
          placeholder="Type your message here..."
        />
        <button type="submit" className="send-button">
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className="record-button"
        >
          <FontAwesomeIcon
            icon={isRecording ? faMicrophoneSlash : faMicrophone}
          />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
