import axios from "axios";

import { JSDOM } from "jsdom";

import { Readability }
from "@mozilla/readability";

import {
  YoutubeTranscript
}
from "youtube-transcript";

const extractVideoId = (url) => {
  if (typeof url !== "string") return null;
  if (url.length === 11) return url;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

const fetchFallbackTranscript = async (videoId) => {
  const response = await fetch(`https://youtube-transcript.ai/transcript/${videoId}.txt`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transcript from fallback service (Status ${response.status})`);
  }
  const text = await response.text();
  const marker = "## Transcript";
  const markerIndex = text.indexOf(marker);
  let transcriptText = text;
  if (markerIndex !== -1) {
    transcriptText = text.substring(markerIndex + marker.length);
  }
  return transcriptText
    .replace(/\[\d{1,2}:\d{2}(?::\d{2})?\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const extractYoutube = async (
  url
) => {
  try {
    const transcript =
      await YoutubeTranscript.fetchTranscript(
        url
      );

    return transcript
      .map(item => item.text)
      .join(" ");
  } catch (error) {
    console.warn("Primary YouTube transcript fetch failed, attempting fallback service...", error.message);
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error("Invalid YouTube URL: Unable to extract video ID");
    }
    try {
      return await fetchFallbackTranscript(videoId);
    } catch (fallbackError) {
      console.error("Fallback YouTube transcript fetch failed:", fallbackError.message);
      throw new Error(
        "YouTube transcript retrieval failed. Please verify that the video has transcripts/captions enabled."
      );
    }
  }
};

export const extractBlog = async (
  url
) => {

  const response =
    await axios.get(url);

  const dom = new JSDOM(
    response.data,
    {
      url
    }
  );

  const reader =
    new Readability(
      dom.window.document
    );

  const article =
    reader.parse();

  return article?.textContent || "";
};

export const extractRaw = (
  content
) => {

  return content;
};