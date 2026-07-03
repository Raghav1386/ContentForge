import { useState, useEffect } from "react";

const TABS = [
  { id: "insights", label: "Insights", icon: "💡" },
  { id: "hooks", label: "Hooks", icon: "🪝" },
  { id: "tweets", label: "Tweets", icon: "🐦" },
  { id: "threads", label: "Threads", icon: "🧵" },
  { id: "linkedin", label: "LinkedIn", icon: "💼" },
  { id: "newsletter", label: "Newsletter", icon: "✉️" },
  { id: "blog", label: "Blog", icon: "📝" },
];

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const formatValForCopy = (val) => {
  if (typeof val === "string") {
    return val;
  }
  if (Array.isArray(val)) {
    if (val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
      return val.map((item) => {
        const title = item.title || item.heading || item.section || "";
        const content = item.content || item.body || item.text || JSON.stringify(item);
        return title ? `${title}\n${content}` : content;
      }).join("\n\n");
    }
    return val.map(item => typeof item === "object" ? JSON.stringify(item) : `- ${item}`).join("\n");
  }
  if (typeof val === "object" && val !== null) {
    return Object.entries(val)
      .map(([subKey, subVal]) => `${subKey.toUpperCase()}: ${formatValForCopy(subVal)}`)
      .join("\n");
  }
  return String(val);
};

const renderFieldContent = (val) => {
  if (typeof val === "string") {
    return <p style={{ whiteSpace: "pre-wrap" }}>{val}</p>;
  }

  if (Array.isArray(val)) {
    // Check if it's an array of objects representing sections (e.g., { title: "...", content: "..." })
    if (val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
      return val.map((item, index) => {
        const title = item.title || item.heading || item.section || `Section ${index + 1}`;
        const content = item.content || item.body || item.text || JSON.stringify(item);
        return (
          <div key={index} style={{ marginBottom: "16px" }}>
            <h5 style={{ fontSize: "1.05rem", fontWeight: "600", marginBottom: "4px", color: "inherit" }}>{title}</h5>
            <p style={{ whiteSpace: "pre-wrap", opacity: 0.9 }}>{content}</p>
          </div>
        );
      });
    }

    // If it's an array of strings (e.g., list of examples or actionable advice)
    return (
      <ul style={{ listStyleType: "disc", paddingLeft: "20px", margin: "8px 0" }}>
        {val.map((item, index) => (
          <li key={index} style={{ marginBottom: "6px", opacity: 0.9 }}>
            {typeof item === "object" ? JSON.stringify(item) : item}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof val === "object" && val !== null) {
    // If it's a key-value object
    return Object.entries(val).map(([subKey, subVal]) => (
      <div key={subKey} style={{ marginBottom: "12px", paddingLeft: "12px", borderLeft: "2px solid rgba(255, 255, 255, 0.2)" }}>
        <span style={{ fontWeight: "600", textTransform: "capitalize" }}>{subKey.replace(/_/g, " ")}: </span>
        {renderFieldContent(subVal)}
      </div>
    ));
  }

  return String(val);
};

export default function OutputPanel({ data }) {
  if (!data) return null;

  const [activeTab, setActiveTab] = useState("insights");
  const [copiedId, setCopiedId] = useState(null);

  const getTabCount = (tabId) => {
    switch (tabId) {
      case "insights":
        return data.insights?.length || 0;
      case "hooks":
        return data.hooks?.length || 0;
      case "tweets":
        return data.tweets?.length || 0;
      case "threads":
        return data.threads?.length || 0;
      case "linkedin":
        return data.linkedin?.length || 0;
      case "newsletter":
        return data.newsletter ? 1 : 0;
      case "blog":
        return data.blog ? 1 : 0;
      default:
        return 0;
    }
  };

  // Switch to first tab with data when data updates
  useEffect(() => {
    if (data) {
      const activeCount = getTabCount(activeTab);
      if (activeCount === 0) {
        const firstAvailable = TABS.find((tab) => getTabCount(tab.id) > 0);
        if (firstAvailable) {
          setActiveTab(firstAvailable.id);
        }
      }
    }
  }, [data]);

  const handleCopy = (content, id) => {
    if (!content) return;
    let textToCopy = "";
    if (typeof content === "string") {
      textToCopy = content;
    } else if (typeof content === "object" && content !== null) {
      if (Array.isArray(content)) {
        textToCopy = content.map(item => formatValForCopy(item)).join("\n\n");
      } else {
        textToCopy = Object.entries(content)
          .map(([key, val]) => `${key.toUpperCase()}:\n${formatValForCopy(val)}`)
          .join("\n\n");
      }
    } else {
      textToCopy = String(content);
    }
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const renderInsights = () => {
    if (!data.insights || data.insights.length === 0) return <p>No insights generated.</p>;
    return (
      <div className="tab-content">
        <div className="dashboard-header">
          <h3>💡 Generated Insights</h3>
          <button
            className={`btn-with-feedback ${copiedId === "insights-all" ? "success" : ""}`}
            onClick={() => handleCopy(data.insights.join("\n"), "insights-all")}
          >
            {copiedId === "insights-all" ? <CheckIcon /> : <CopyIcon />}
            {copiedId === "insights-all" ? "Copied All!" : "Copy All"}
          </button>
        </div>
        <div className="insights-grid">
          {data.insights.map((insight, index) => (
            <div key={index} className="insight-card">
              <span className="insight-icon">✨</span>
              <div className="insight-text">{insight}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHooks = () => {
    if (!data.hooks || data.hooks.length === 0) return <p>No hooks generated.</p>;
    return (
      <div className="tab-content">
        <div className="dashboard-header">
          <h3>🪝 Social Hooks</h3>
          <button
            className={`btn-with-feedback ${copiedId === "hooks-all" ? "success" : ""}`}
            onClick={() => handleCopy(data.hooks.join("\n"), "hooks-all")}
          >
            {copiedId === "hooks-all" ? <CheckIcon /> : <CopyIcon />}
            {copiedId === "hooks-all" ? "Copied All!" : "Copy All"}
          </button>
        </div>
        <div className="hooks-list">
          {data.hooks.map((hook, index) => {
            const id = `hook-${index}`;
            const isCopied = copiedId === id;
            return (
              <div key={index} className="hook-card">
                <div className="hook-text">{hook}</div>
                <button
                  className={`copy-icon-btn ${isCopied ? "copied" : ""}`}
                  onClick={() => handleCopy(hook, id)}
                  title="Copy Hook"
                >
                  {isCopied ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTweets = () => {
    if (!data.tweets || data.tweets.length === 0) return <p>No tweets generated.</p>;
    return (
      <div className="tab-content">
        <div className="dashboard-header">
          <h3>🐦 Individual Tweets</h3>
          <button
            className={`btn-with-feedback ${copiedId === "tweets-all" ? "success" : ""}`}
            onClick={() => handleCopy(data.tweets.join("\n\n---\n\n"), "tweets-all")}
          >
            {copiedId === "tweets-all" ? <CheckIcon /> : <CopyIcon />}
            {copiedId === "tweets-all" ? "Copied All!" : "Copy All"}
          </button>
        </div>
        <div className="tweets-container">
          {data.tweets.map((tweet, index) => {
            const id = `tweet-${index}`;
            const isCopied = copiedId === id;
            return (
              <div key={index} className="tweet-card">
                <div className="tweet-header">
                  <div className="tweet-avatar">CF</div>
                  <div className="tweet-user-info">
                    <span className="tweet-display-name">ContentForge Creator</span>
                    <span className="tweet-handle">@creator</span>
                  </div>
                </div>
                <div className="tweet-body">{tweet}</div>
                <div className="tweet-footer">
                  <span className="tweet-metrics">
                    {tweet.length} / 280 chars
                  </span>
                  <div className="tweet-actions">
                    <button
                      className={`btn-with-feedback ${isCopied ? "success" : ""}`}
                      onClick={() => handleCopy(tweet, id)}
                    >
                      {isCopied ? <CheckIcon /> : <CopyIcon />}
                      {isCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderThreads = () => {
    if (!data.threads || data.threads.length === 0) return <p>No threads generated.</p>;
    return (
      <div className="tab-content">
        <div className="dashboard-header">
          <h3>🧵 Twitter Threads</h3>
        </div>
        <div className="threads-container">
          {data.threads.map((thread, threadIndex) => {
            const threadText = thread.join("\n\n---\n\n");
            const threadCopyId = `thread-${threadIndex}`;
            const isThreadCopied = copiedId === threadCopyId;
            return (
              <div key={threadIndex} className="thread-wrapper">
                <div className="thread-title-bar">
                  <span className="badge">Thread #{threadIndex + 1} ({thread.length} Tweets)</span>
                  <button
                    className={`btn-with-feedback ${isThreadCopied ? "success" : ""}`}
                    onClick={() => handleCopy(threadText, threadCopyId)}
                  >
                    {isThreadCopied ? <CheckIcon /> : <CopyIcon />}
                    {isThreadCopied ? "Copied Thread!" : "Copy Thread"}
                  </button>
                </div>

                <div className="thread-flow">
                  {thread.map((tweet, tweetIndex) => {
                    const tweetId = `thread-${threadIndex}-tweet-${tweetIndex}`;
                    const isTweetCopied = copiedId === tweetId;
                    return (
                      <div key={tweetIndex} className="thread-item">
                        <div className="thread-tweet-card">
                          <div className="tweet-header">
                            <div className="tweet-avatar">CF</div>
                            <div className="tweet-user-info">
                              <span className="tweet-display-name">ContentForge Creator</span>
                              <span className="tweet-handle">@creator • {tweetIndex + 1}/{thread.length}</span>
                            </div>
                          </div>
                          <div className="tweet-body">{tweet}</div>
                          <div className="tweet-footer">
                            <span className="tweet-metrics">
                              {tweet.length} / 280 chars
                            </span>
                            <button
                              className={`copy-icon-btn ${isTweetCopied ? "copied" : ""}`}
                              onClick={() => handleCopy(tweet, tweetId)}
                              title="Copy Tweet"
                            >
                              {isTweetCopied ? <CheckIcon /> : <CopyIcon />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLinkedIn = () => {
    if (!data.linkedin || data.linkedin.length === 0) return <p>No LinkedIn posts generated.</p>;
    return (
      <div className="tab-content">
        <div className="dashboard-header">
          <h3>💼 LinkedIn Posts</h3>
          <button
            className={`btn-with-feedback ${copiedId === "linkedin-all" ? "success" : ""}`}
            onClick={() => handleCopy(data.linkedin.join("\n\n---\n\n"), "linkedin-all")}
          >
            {copiedId === "linkedin-all" ? <CheckIcon /> : <CopyIcon />}
            {copiedId === "linkedin-all" ? "Copied All!" : "Copy All"}
          </button>
        </div>
        <div className="linkedin-container">
          {data.linkedin.map((post, index) => {
            const id = `linkedin-${index}`;
            const isCopied = copiedId === id;
            return (
              <div key={index} className="linkedin-card">
                <div className="linkedin-header">
                  <div className="linkedin-avatar">CF</div>
                  <div className="linkedin-user-info">
                    <span className="linkedin-name">ContentForge Professional</span>
                    <span className="linkedin-headline">AI Content Strategist</span>
                    <span className="linkedin-time">Just now • 🌐</span>
                  </div>
                </div>
                <div className="linkedin-body">{post}</div>
                <div className="linkedin-footer">
                  <span className="tweet-metrics">
                    {post.length} characters
                  </span>
                  <button
                    className={`btn-with-feedback ${isCopied ? "success" : ""}`}
                    onClick={() => handleCopy(post, id)}
                  >
                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                    {isCopied ? "Copied Post!" : "Copy Post"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderNewsletterBody = (newsletter) => {
    if (typeof newsletter === "string") {
      return <p style={{ whiteSpace: "pre-wrap" }}>{newsletter}</p>;
    }
    if (typeof newsletter === "object" && newsletter !== null) {
      if (Array.isArray(newsletter)) {
        return <p style={{ whiteSpace: "pre-wrap" }}>{newsletter.join("\n\n")}</p>;
      }
      return Object.entries(newsletter).map(([key, val]) => {
        if (["subject", "subject line", "subject_line"].includes(key.toLowerCase())) {
          return null;
        }
        return (
          <div key={key} style={{ marginBottom: "16px" }}>
            <h4 style={{ fontWeight: "bold", textTransform: "capitalize", marginBottom: "4px" }}>
              {key.replace(/_/g, " ")}
            </h4>
            <div className="newsletter-section-content" style={{ marginTop: "4px" }}>
              {renderFieldContent(val)}
            </div>
          </div>
        );
      });
    }
    return <p style={{ whiteSpace: "pre-wrap" }}>{String(newsletter)}</p>;
  };

  const renderBlogBody = (blog) => {
    if (typeof blog === "string") {
      return <p style={{ whiteSpace: "pre-wrap" }}>{blog}</p>;
    }
    if (typeof blog === "object" && blog !== null) {
      if (Array.isArray(blog)) {
        return <p style={{ whiteSpace: "pre-wrap" }}>{blog.join("\n\n")}</p>;
      }
      return Object.entries(blog).map(([key, val]) => {
        if (key.toLowerCase() === "title") {
          return null;
        }
        return (
          <div key={key} style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", textTransform: "capitalize", marginBottom: "8px" }}>
              {key.replace(/_/g, " ")}
            </h4>
            <div className="blog-section-content" style={{ marginTop: "6px" }}>
              {renderFieldContent(val)}
            </div>
          </div>
        );
      });
    }
    return <p style={{ whiteSpace: "pre-wrap" }}>{String(blog)}</p>;
  };

  const renderNewsletter = () => {
    if (!data.newsletter) return <p>No newsletter generated.</p>;
    const isCopied = copiedId === "newsletter";
    let subject = "💡 ContentForge Newsletter Draft";
    if (data.newsletter && typeof data.newsletter === "object" && !Array.isArray(data.newsletter)) {
      const subjectKey = Object.keys(data.newsletter).find(k => k.toLowerCase() === "subject" || k.toLowerCase() === "subject line" || k.toLowerCase() === "subject_line");
      if (subjectKey) {
        subject = data.newsletter[subjectKey];
      }
    }
    return (
      <div className="tab-content">
        <div className="dashboard-header">
          <h3>✉️ Email Newsletter</h3>
        </div>
        <div className="newsletter-card">
          <div className="newsletter-header-mock">
            <div className="newsletter-header-field">
              <span className="newsletter-header-label">To:</span>
              <span className="newsletter-header-value">Your Subscribers</span>
            </div>
            <div className="newsletter-header-field">
              <span className="newsletter-header-label">Subject:</span>
              <span className="newsletter-subject-value">{subject}</span>
            </div>
          </div>
          <div className="newsletter-body-container">
            {renderNewsletterBody(data.newsletter)}
          </div>
          <div className="newsletter-actions">
            <button
              className={`btn-with-feedback ${isCopied ? "success" : ""}`}
              onClick={() => handleCopy(data.newsletter, "newsletter")}
            >
              {isCopied ? <CheckIcon /> : <CopyIcon />}
              {isCopied ? "Copied Newsletter!" : "Copy Newsletter"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderBlog = () => {
    if (!data.blog) return <p>No blog post generated.</p>;
    const isCopied = copiedId === "blog";
    let title = "PUBLISHED DRAFT";
    if (data.blog && typeof data.blog === "object" && !Array.isArray(data.blog)) {
      const titleKey = Object.keys(data.blog).find(k => k.toLowerCase() === "title");
      if (titleKey) {
        title = data.blog[titleKey];
      }
    }
    return (
      <div className="tab-content">
        <div className="dashboard-header">
          <h3>📝 Blog Article</h3>
        </div>
        <div className="blog-card">
          <div className="blog-hero-image">
            <span className="blog-hero-title">{title}</span>
          </div>
          <div className="blog-content-container">
            {renderBlogBody(data.blog)}
          </div>
          <div className="blog-actions">
            <button
              className={`btn-with-feedback ${isCopied ? "success" : ""}`}
              onClick={() => handleCopy(data.blog, "blog")}
            >
              {isCopied ? <CheckIcon /> : <CopyIcon />}
              {isCopied ? "Copied Article!" : "Copy Article"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "insights":
        return renderInsights();
      case "hooks":
        return renderHooks();
      case "tweets":
        return renderTweets();
      case "threads":
        return renderThreads();
      case "linkedin":
        return renderLinkedIn();
      case "newsletter":
        return renderNewsletter();
      case "blog":
        return renderBlog();
      default:
        return null;
    }
  };

  return (
    <div className="card" style={{ padding: "24px", marginTop: "20px" }}>
      <h2 style={{ textAlign: "left", marginBottom: "16px" }}>✨ Content Dashboard</h2>

      <div className="tabs-container">
        {TABS.map((tab) => {
          const count = getTabCount(tab.id);
          if (count === 0) return null;

          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="tab-badge">{count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "24px" }}>
        {renderTabContent()}
      </div>
    </div>
  );
}