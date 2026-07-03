import { useState } from "react";

export default function InputPanel({
    onGenerate,
    loading,
}) {
    const [type, setType] = useState("youtube");
    const [content, setContent] = useState("");

    const handleSubmit = () => {
        if (!content.trim()) {
            alert("Please enter content");
            return;
        }

        onGenerate({
            type,
            content,
        });
    };

    return (
        <div className="card">
            <h2>Generate Content</h2>

            <select
                value={type}
                onChange={(e) =>
                    setType(e.target.value)
                }
            >
                <option value="youtube">
                    YouTube
                </option>

                <option value="blog">
                    Blog
                </option>

                <option value="raw">
                    Raw Text
                </option>

                <option value="transcript">
                    Transcript
                </option>
            </select>

            <textarea
                rows="8"
                placeholder="Paste YouTube URL or text..."
                value={content}
                onChange={(e) =>
                    setContent(e.target.value)
                }
            />

            <button
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading
                    ? "Generating..."
                    : "Generate"}
            </button>
        </div>
    );
}