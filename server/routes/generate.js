import express from "express";
import { db } from "../config/firebaseadmin.js";
import { generateContent } from "../groq.js";
import {
  extractYoutube,
  extractBlog,
  extractRaw,
} from "../extractors.js";
import { masterPrompt } from "../prompts.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

const extractTitle = (output) => {
  if (!output) return "Untitled";

  // Case 1: blog is a string
  if (typeof output.blog === "string" && output.blog.trim()) {
    const firstLine = output.blog.split("\n")[0];
    return firstLine.replace(/#/g, "").trim() || "Untitled";
  }

  // Case 2: blog is an object
  if (typeof output.blog === "object" && output.blog !== null) {
    const blogObj = output.blog;
    const titleKey = Object.keys(blogObj).find(
      (k) => k.toLowerCase() === "title" || k.toLowerCase() === "heading"
    );
    if (titleKey && typeof blogObj[titleKey] === "string" && blogObj[titleKey].trim()) {
      return blogObj[titleKey].replace(/#/g, "").trim();
    }
  }

  // Case 3: newsletter title/subject
  if (typeof output.newsletter === "object" && output.newsletter !== null) {
    const newsletterObj = output.newsletter;
    const subjectKey = Object.keys(newsletterObj).find(
      (k) => k.toLowerCase() === "subject" || k.toLowerCase() === "subject_line" || k.toLowerCase() === "subject line"
    );
    if (subjectKey && typeof newsletterObj[subjectKey] === "string" && newsletterObj[subjectKey].trim()) {
      return newsletterObj[subjectKey].trim();
    }
  }
  if (typeof output.newsletter === "string" && output.newsletter.trim()) {
    const firstLine = output.newsletter.split("\n")[0];
    return firstLine.replace(/#/g, "").trim() || "Untitled";
  }

  // Case 4: first hook
  if (Array.isArray(output.hooks) && output.hooks.length > 0 && typeof output.hooks[0] === "string") {
    return output.hooks[0];
  }

  return "Untitled";
};

// GET history endpoint
router.get("/history", requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const snapshot = await db
      .collection("users")
      .doc(uid)
      .collection("generations")
      .orderBy("createdAt", "desc")
      .get();

    const historyDocs = snapshot.docs.map((doc) => {
      const data = doc.data();

      // Convert Timestamp to simple seconds/nanoseconds to match client expectation
      if (data.createdAt && typeof data.createdAt.toDate === "function") {
        const date = data.createdAt.toDate();
        data.createdAt = {
          seconds: Math.floor(date.getTime() / 1000),
          nanoseconds: (date.getTime() % 1000) * 1000000,
        };
      }

      // Deserialize threads if needed
      if (data.output && Array.isArray(data.output.threads)) {
        data.output.threads = data.output.threads.map((thread) => {
          if (thread && typeof thread === "object" && Array.isArray(thread.tweets)) {
            return thread.tweets;
          }
          return thread;
        });
      }

      return {
        id: doc.id,
        ...data,
      };
    });

    return res.json({
      success: true,
      data: historyDocs,
    });
  } catch (error) {
    console.error("Fetch History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch history",
    });
  }
});

// POST generate endpoint
router.post("/", requireAuth, async (req, res) => {
  let result = "";
  let cleaned = "";
  try {
    const { type, content } = req.body;

    let sourceText = "";

    // -----------------------------
    // 1. Extract content
    // -----------------------------
    switch (type) {
      case "youtube":
        sourceText = await extractYoutube(content);
        break;

      case "blog":
        sourceText = await extractBlog(content);
        break;

      case "transcript":
      case "raw":
        sourceText = extractRaw(content);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid type",
        });
    }

    // -----------------------------
    // 2. Call Gemini (ONLY ONCE)
    // -----------------------------
    sourceText = sourceText.substring(0, 15000);
    result = await generateContent(
      masterPrompt(sourceText)
    );

    // -----------------------------
    // 3. Parse JSON safely
    // -----------------------------
    cleaned = result;

    // 1. Remove ```json and ``` wrappers
    cleaned = cleaned
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON Parse Error:", err);

      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON",
        raw: result,
      });
    }

    // -----------------------------
    // 4. Save to Firestore (Server-side bypasses rules)
    // -----------------------------
    try {
      const uid = req.user.uid;
      const serializedOutput = JSON.parse(JSON.stringify(parsed));

      // Transform threads (string[][]) to map structure for Firestore compatibility
      if (serializedOutput && Array.isArray(serializedOutput.threads)) {
        serializedOutput.threads = serializedOutput.threads.map((thread) => {
          if (Array.isArray(thread)) {
            return { tweets: thread };
          }
          return thread;
        });
      }

      await db
        .collection("users")
        .doc(uid)
        .collection("generations")
        .add({
          title: extractTitle(serializedOutput),
          sourceType: type,
          sourceContent: content,
          output: serializedOutput,
          createdAt: new Date(),
        });
    } catch (dbErr) {
      console.error("Failed to save generation to history:", dbErr);
    }

    // -----------------------------
    // 5. Return response
    // -----------------------------
    return res.json({
      success: true,
      data: parsed,
    });

  } catch (error) {
    console.error("Generate Error:", error);
    console.log("RAW RESPONSE:");
    console.log(cleaned || result);

    return res.status(500).json({
      success: false,
      message: error.message || "Generation failed",
      raw: cleaned || result,
    });
  }
});

export default router;