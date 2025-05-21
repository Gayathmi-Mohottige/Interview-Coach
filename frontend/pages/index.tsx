import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [category, setCategory] = useState("java");
  const [sessionId] = useState("mysession123");
  const [question, setQuestion] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [triesLeft, setTriesLeft] = useState(3);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [modelAnswer, setModelAnswer] = useState('');
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: "👋 Welcome to AI Interview Coach! Select a category and click 'Start New Question' to begin.",
      },
    ]);
  }, []);

  const getQuestion = async () => {
    const res = await axios.post(`http://localhost:8080/interview/ask?category=${category}&sessionId=${sessionId}`);
    setQuestion(res.data);
    setMessages([{ sender: 'ai', text: `🧠 ${res.data}` }]);
    setTriesLeft(3);
    setShowModelAnswer(false);
    setModelAnswer('');
  };

  const sendAnswer = async () => {
  if (triesLeft === 0 || showModelAnswer) return;

  const userMsg = { sender: 'user', text: input };
  setMessages(prev => [...prev, userMsg]);
  setLoading(true);

  try {
    const res = await axios.post("http://localhost:8080/interview/answer", {
      sessionId,
      question,
      answer: input
    });

    const aiFeedback = { sender: 'ai', text: res.data.feedback };

    if (res.data.correct) {
      const correctMsg = {
        sender: 'ai',
        text: "✅ Great! That's the correct answer. Click 'Start New Question' to continue."
      };
      setMessages(prev => [...prev, aiFeedback, correctMsg]);
      setShowModelAnswer(true);
    } else {
      const newTries = triesLeft - 1;
      setTriesLeft(newTries);

      if (newTries === 0) {
        const correctAnswer = res.data.modelAnswer;
        setModelAnswer(correctAnswer);

        const outOfTriesMessages = [
          aiFeedback,
          { sender: 'ai', text: "❌ No more tries left. Here's the correct answer:" },
          { sender: 'ai', text: correctAnswer },
          { sender: 'ai', text: "Click 'Start New Question' to continue." }
        ];
        setMessages(prev => [...prev, ...outOfTriesMessages]);
        setShowModelAnswer(true);
      } else {
        setMessages(prev => [...prev, aiFeedback]);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }

  setLoading(false);
  setInput('');
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0933] via-[#2d0b52] to-[#1a0933] text-white font-sans">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-[#1f1b2e] shadow-2xl rounded-2xl p-6 space-y-6">
          <h1 className="text-4xl font-bold text-center text-purple-300 drop-shadow">
            🎓 AI Interview Coach
          </h1>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#2c2541] text-purple-200 border border-purple-600 rounded px-4 py-2 focus:outline-none shadow-md"
            >
              <option value="java">Java</option>
              <option value="dsa">DSA</option>
              <option value="sql">SQL</option>
              <option value="mixed">Mixed</option>
            </select>

            <button
              onClick={getQuestion}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300"
            >
              Start New Question
            </button>
          </div>

          <div className="text-right text-sm text-purple-300">
            Tries left: <span className="font-bold">{triesLeft}</span>
          </div>

          <div className="h-96 overflow-y-auto bg-[#292042] border border-purple-800 rounded-xl p-4 space-y-4 shadow-inner">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "ai" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-xl shadow ${
                    msg.sender === "ai"
                      ? "bg-purple-900 text-purple-100"
                      : "bg-purple-600 text-white"
                  } flex gap-2 text-sm sm:text-base`}
                >
                  <span>{msg.sender === "ai" ? "🤖" : "👤"}</span>
                  <span>{msg.text}</span>
                </div>
              </div>
            ))}

            {/* SPINNER */}
            {loading && (
              <div className="flex items-center text-purple-300 animate-pulse text-sm gap-2">
                <svg className="w-5 h-5 animate-spin text-purple-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  />
                </svg>
                <span>Generating feedback...</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer..."
              className="flex-1 bg-[#2f2844] text-white border border-purple-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md"
            />
            <button
              onClick={sendAnswer}
              disabled={triesLeft === 0 || showModelAnswer}
              className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
                triesLeft === 0 || showModelAnswer
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-purple-700 hover:bg-purple-800 text-white"
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

