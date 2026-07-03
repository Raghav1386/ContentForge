import axios from "axios";

import { JSDOM } from "jsdom";

import { Readability }
from "@mozilla/readability";

import {
  YoutubeTranscript
}
from "youtube-transcript";

export const extractYoutube = async (
  url
) => {

  const transcript =
    await YoutubeTranscript.fetchTranscript(
      url
    );

  return transcript
    .map(item => item.text)
    .join(" ");
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