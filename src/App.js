
import axios from "axios";
import "./App.css";
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
function App() {

  const [timeLeft, setTimeLeft] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [difficulty, setDifficulty] = useState("Medium");
  const [scores, setScores] = useState([]);
  const [questionNumber, setQuestionNumber] = useState(1);
const [maxQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timerActive, setTimerActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [weakAreas, setWeakAreas] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const startInterview = async () => {

  setLoading(true);

  try {

    const response = await axios.get(
  `http://localhost:8080/question?role=${role}&difficulty=${difficulty}`
);

    setQuestion(response.data);
    setTimeLeft(120);
    setTimerActive(true);

  } catch (error) {

    console.error(error);

  }

  setLoading(false);
};
const nextQuestion = async () => {

  setSubmitted(false);
  if (questionNumber >= maxQuestions) {
    alert("Interview Completed!");
    return;
  }

  setQuestionNumber(questionNumber + 1);

  setTimeLeft(120);
  setTimerActive(true);
  setAnswer("");
  setFeedback("");
  

  await startInterview();
};

  const submitAnswer = async () => {
    if (submitted) return;

setSubmitted(true);
  setTimerActive(false);
  setLoading(true);

  try {

    const response = await axios.post(
      "http://localhost:8080/evaluate",
      answer,
      {
        headers: {
          "Content-Type": "text/plain"
        }
      }
    );

    setFeedback(response.data);
    const match = response.data.match(/Score:\s*(\d+)\/10/i);

if (match) {
  const score = parseInt(match[1]);
  setScores(prev => [...prev, score]);
  if (score < 5) {
    setWeakAreas(prev => [...prev, question]);
  }
  if(score < 5){
  setRecommendations(prev => [
  ...prev,
  question
]);
}
}

  } catch (error) {

    console.error(error);

  }

  setLoading(false);
  
};
const averageScore =
  scores.length > 0
    ? (
        scores.reduce((a, b) => a + b, 0)
        / scores.length
      ).toFixed(1)
    : 0;

  const readQuestion = () => {

  const speech = new SpeechSynthesisUtterance(question);

  speech.lang = "en-US";
  speech.rate = 1;

  window.speechSynthesis.speak(speech);
};
  const startRecording = () => {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  setIsRecording(true);

  recognition.start();

  recognition.onresult = (event) => {

    const transcript =
      event.results[0][0].transcript;

    setAnswer(prev => prev + " " + transcript);
  };

  recognition.onend = () => {
    setIsRecording(false);
  };

  recognition.onerror = () => {
    setIsRecording(false);
  };
};
useEffect(() => {

  if (timeLeft <= 0 || !question || !timerActive) {
    return;
  }

  const timer = setInterval(() => {

    setTimeLeft(prev => prev - 1);

  }, 1000);

  return () => clearInterval(timer);

}, [timeLeft]);
useEffect(() => {

  if (timeLeft === 0 && answer.trim()) {

    submitAnswer();

  }

}, [timeLeft]);
const chartData = scores.map((score, index) => ({
  question: `Q${index + 1}`,
  score: score
}));
  return (
    
  <div
  className="container"
    style={{
      maxWidth: "900px",
      margin: "40px auto",
      padding: "30px",
      fontFamily: "Arial",
      border: "1px solid #ddd",
      borderRadius: "10px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}
  >
    <h1 className="main-title">
  🤖 AI Interview Simulator
</h1>
<p className="subtitle">
  Practice • Improve • Get Hired
</p>
<div className="selection-row">
  <h3>Select Role</h3>

    <select
    className="select-box"
      value={role}
      onChange={(e) => setRole(e.target.value)}
      style={{
        padding: "10px",
        width: "250px"
      }}
    >
      <option value="">Select Role</option>
<option value="Java Developer">Java Developer</option>
<option value="Frontend Developer">Frontend Developer</option>
<option value="Backend Developer">Backend Developer</option>
<option value="Full Stack Developer">Full Stack Developer</option>
    </select>

    <br /><br />
    <h3>🎯 Difficulty</h3>

<select
  className="select-box"
  value={difficulty}
  onChange={(e) => setDifficulty(e.target.value)}
>
  <option value="Easy">Easy</option>
  <option value="Medium">Medium</option>
  <option value="Hard">Hard</option>
</select>
</div>
    

<br /><br />
    <button
  className="button"
  onClick={startInterview}
  disabled={loading}
>
  Start Interview
</button>
    {loading && (
  <div className="loading">
    🤖 AI is thinking...
  </div>
)}
{question && (
  <h3 className="timer-badge">
    ⏱ Time Left:
    {Math.floor(timeLeft / 60)}:
    {(timeLeft % 60).toString().padStart(2, "0")}
  </h3>
)}
{question && timeLeft === 0 && (
  <h2 style={{ color: "red" }} className="time-up">
    ⏰ Time's Up!
  </h2>
)}
<h3>
Question {questionNumber} / {maxQuestions}
</h3>

<div className="progress-bar">
   <div
      className="progress-fill"
      style={{
         width: `${(questionNumber/maxQuestions)*100}%`
      }}
   />
</div>
    {question && (
      <>
        <hr />

        <h2 className="question-title">
📝 Question {questionNumber} / {maxQuestions}
</h2>

        <div
          style={{
            background: "#f4f4f4",
            padding: "15px",
            borderRadius: "8px"
          }}
        >
        
          <div className="question-box">
  {question}
</div>
        </div>

        <br />
        <button
  className="button"
  onClick={readQuestion}
>
  🔊 Read Question
</button>
        <button
  onClick={startRecording}
  className="button"
>
  {isRecording
    ? "🎙 Recording..."
    : "🎤 Start Recording"}
</button>

<br /><br />
        <textarea
        className="text-area"
          rows="8"
          style={{
            width: "100%",
            padding: "10px"
          }}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
        />

        <br /><br />

        <button
        className="button"
          onClick={submitAnswer}
          style={{
            padding: "10px 20px",
            cursor: "pointer"
          }}
        >
          Submit Answer
        </button>
      </>
    )}
    {feedback && (
  <>
    <h3>📊 AI Feedback</h3>

    <div className="feedback-box">
      <pre>{feedback}</pre>
    </div>

    <br />
  </>
)}
    {feedback && questionNumber < maxQuestions && (
  <button
    className="button"
    onClick={nextQuestion}
  >
    Next Question
  </button>
)}
{questionNumber === maxQuestions && feedback && (
  <div className="feedback-box">

    <h2>🎉 Interview Completed</h2>

    <h3>🏆 Interview Summary</h3>

    {scores.map((score, index) => (
      <p key={index}>
        Question {index + 1}: {score}/10
      </p>
    ))}
    <div className="dashboard-grid">

  <div className="dashboard-card">
    <h3>Average Score</h3>
    <h1>{averageScore}/10</h1>
  </div>

  <div className="dashboard-card">
    <h3>Questions</h3>
    <h1>{scores.length}</h1>
  </div>

</div>
    
    
<h3>📈 Score Trend</h3>

<div
  style={{
    width: "100%",
    height: 300,
    background: "white",
    padding: "10px",
    borderRadius: "10px"
  }}
>
  <ResponsiveContainer>
    <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="question" />

      <YAxis domain={[0, 10]} />

      <Tooltip />

      <Line
        type="monotone"
        dataKey="score"
        stroke="#2196f3"
        strokeWidth={3}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
  </div>
)}
  </div>
);
}

export default App;