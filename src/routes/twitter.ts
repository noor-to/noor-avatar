import axios from "axios";
import * as cheerio from "cheerio";
import { chromium, firefox, webkit } from "playwright";
import uniqueRandomArray from "unique-random-array";

const randomCrawlerAgent = uniqueRandomArray(
  require("top-crawler-agents").filter((agent: any) =>
    agent.startsWith("Slackbot")
  )
);

export const twitter = async ({ params: { username } }) => {
  try {
    if (!username) {
      return "";
    }
    // check cache
    const file = Bun.file(`./twitter/${username}.jpeg`);
    if (await file.exists()) {
      return new Response(file);
    }

    const browser = await chromium.launch({
      // headless: false,
    });

    const page = await browser.newPage({
      javaScriptEnabled: true,
      userAgent: randomCrawlerAgent() as string,
    });

    try {
      const url = `https://twitter.com/${username}`;
      await page.goto(url);

      const html = await page.content();

      const $ = cheerio.load(html);
      const avatar = avatarUrl(
        $('meta[property="og:image"]').attr("content") || ""
      );

      await page.close();
      await browser.close();

      console.log(avatar);

      const avatarRes = await fetch(avatar);

      await Bun.write(`./twitter/${username}.jpeg`, avatarRes);

      return new Response(avatarRes.body);
    } catch (error) {
      await page.close();
      await browser.close();
      return "";
    }
  } catch (error) {
    return "";
  }
};

const REGEX_IMG_MODIFIERS = /_(bigger|mini|normal|x\d+|\\d+x\\d+)\./;
const ORIGINAL_IMG_SIZE = "_400x400";

const avatarUrl = (str: string) =>
  str
    ?.replace(REGEX_IMG_MODIFIERS, `${ORIGINAL_IMG_SIZE}.`)
    .replace(`200x200`, "400x400");
