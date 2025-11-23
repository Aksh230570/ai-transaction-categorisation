import React, { useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [correctCategory, setCorrectCategory] = useState("");

  const predict = async () => {
    if (!text.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Backend not running!");
    }
    setLoading(false);
  };

  const sendFeedback = async () => {
    if (!correctCategory) {
      alert("Please select the correct category.");
      return;
    }

    try {
      await fetch("http://localhost:8000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          predicted_category: result.category,
          correct_category: correctCategory,
        }),
      });

      alert("✅ Feedback submitted — thank you!");
      setCorrectCategory("");
    } catch (err) {
      alert("Backend not running!");
    }
  };

  return (
    <div className="container">
      <h2>AI Transaction Categorisation</h2>
      <p className="subtitle">
        Convert cryptic bank statements into meaningful spending categories.
      </p>

      <textarea
        placeholder='Example: "STARBUCKS COFFEE #1234 NY"'
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={predict} disabled={loading}>
        {loading ? "Predicting..." : "Predict Category"}
      </button>

      {result && (
        <div className="result-box">
          <h3>Result</h3>
          <p><strong>Category:</strong> {result.category}</p>
          <p>
            <strong>Confidence:</strong>{" "}
            {Math.round(result.confidence * 100)}%
          </p>

          {result.explanation.length > 0 ? (
            <p>
              <strong>Matched keywords:</strong>{" "}
              {result.explanation.join(", ")}
            </p>
          ) : (
            <p>No strong keyword match — moved to default category.</p>
          )}

          {/* ✅ FEEDBACK UI */}
          <div className="feedback-section">
            <label>Is this incorrect?</label>
            <select
              value={correctCategory}
              onChange={(e) => setCorrectCategory(e.target.value)}
            >
              <option value="">Select correct category</option>
              <option>Food & Dining</option>
              <option>Shopping</option>
              <option>Transportation</option>
              <option>Entertainment</option>
              <option>Bills & Utilities</option>
              <option>Healthcare</option>
              <option>Travel</option>
              <option>Other</option>
            </select>

            <button className="feedback-btn" onClick={sendFeedback}>
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
