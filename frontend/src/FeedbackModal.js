export default function FeedbackModal({ currentCategory, onClose }) {
    const categories = [
        "Food & Dining",
        "Shopping",
        "Bills & Utilities",
        "Transportation",
        "Entertainment",
        "Other",
    ];

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>Suggest Correct Category</h3>

                <select style={{ width: "100%", padding: "10px", marginTop: "10px" }}>
                    {categories.map((c) => (
                        <option key={c}>{c}</option>
                    ))}
                </select>

                <button
                    className="button"
                    style={{ width: "100%", marginTop: "14px" }}
                    onClick={onClose}
                >
                    Submit Feedback
                </button>
            </div>
        </div>
    );
}
