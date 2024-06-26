import fs from "fs-extra";
import path from "path";
import { ORIGIN_FEED_DATA_PATH_NAME } from "./constance";
import { flatten, isEmpty, uniqBy } from "lodash";
import Parser from "rss-parser";
import { sendCardMessage, sendPostMessage } from "./robots/feishu-robot";
import { DetailFeedType, FeedDataType, FeedResType } from "./types/global";
import { getRssData } from "./data-base";
import { Message } from "./types/global";
const parser = new Parser();

/**
 * @description 获取之前保存的数据,为了推送的时候去重
 */
export const getSavedData = async () => {
  const preData = await getRssData()
  const preUrlsSet = new Set<string>(preData.map(({ link }) => link));
  return { preUrlsSet, originData: preData }
};

/**
 *
 * @description 获取本次的数据
 */
export const fetchRssData = async () => {
  const rssPath = path.join(__dirname, `./${ORIGIN_FEED_DATA_PATH_NAME}`);

  if (!fs.existsSync(rssPath)) {
    return null;
  }

  const rssData = JSON.parse(
    fs.readFileSync(rssPath, "utf8") || "[]",
  ) as FeedDataType[];
  if (isEmpty(rssData)) {
    return null;
  }

  const feedData = await Promise.all(
    rssData.map(async (feedItem) => {
      try {
        const feed = await parser.parseURL(feedItem.url);        
        return feed.items;
      } catch (error) {
        //
      } finally {
        return []
      }
    }),
  );

  return flatten(feedData) as DetailFeedType[];
};

interface uniqFeedMessageParams<T> {
  currentFeedData: FeedResType[];
  originData: any[];
  preUrlsSet: Set<string>;
  formatDataFn?: (data: FeedResType[]) => T
}

export const uniqFeedMessage = async <T>({
  currentFeedData,
  originData,
  preUrlsSet,
  formatDataFn
}: uniqFeedMessageParams<T>) => {
  const currentNoticeData = currentFeedData.filter(
    (item) => !preUrlsSet.has(item.link),
  );

  if (formatDataFn) {
    const postMessage = formatDataFn(currentNoticeData)
    return [currentNoticeData, postMessage] as const
  }
  const postMessage = currentNoticeData
    .map((item, index) => ({
      title: item.title,
      content: item.content,
      link: item.link,
    }))

  return [currentNoticeData, postMessage] as const;
};

export const noticeFeishuRobot = async (
  message: Message[],
) => {
  if (isEmpty(message)) return
  await sendCardMessage(message);
};


