import { insertData } from "./data-base";
import {
  fetchRssData,
  getSavedData,
  noticeFeishuRobot,
  uniqFeedMessage,
} from "./feed";
import { feishuFormatData } from "./robots/feishu-robot";
import { FormatDataType } from "./types/global";
(async () => {
  const { preUrlsSet, originData } = await getSavedData();
  const feedItems = (await fetchRssData()) || [];
  const currentFeedData = feedItems.filter(e => (e.pubDate === 'Invalid Date') || !!e.pubDate )
  console.log('currentFeedData', currentFeedData)
  const [mergedData, feishuPostMessage] = await uniqFeedMessage<FormatDataType[]>({
    currentFeedData,
    originData,
    preUrlsSet,
    formatDataFn: feishuFormatData
  });

  insertData(mergedData);

  await noticeFeishuRobot(feishuPostMessage)
})();