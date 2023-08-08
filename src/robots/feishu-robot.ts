import axios from "axios";
import { FEISHU_ROBOT_CALLBACK_URL } from "../constance";
import { FeedResType, Message } from "../types/global";

const instance = axios.create({ baseURL: FEISHU_ROBOT_CALLBACK_URL });

instance.interceptors.response.use(
  (response) => {
    if (response.status !== 200 || response.data.StatusCode !== 0) {
      console.log(response);
      throw new Error("send message error");
    }
    return response.data;
  },
  (err) => {
    console.log(err?.message);
  }
);

export async function sendTextMessage(message: string): Promise<void> {
  await instance({
    method: "POST",
    data: {
      msg_type: "text",
      content: {
        text: message,
      },
    },
  });
}

export async function sendPostMessage(message: any): Promise<any> {
  await instance({
    method: "POST",
    data: {
      msg_type: "post",
      content: {
        post: {
          zh_cn: {
            title: "每日 feed 更新",
            content: message,
          },
        },
      },
    },
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function convertToMarkdown(inputText) {
  const listItems = inputText.replace(/<text>(.*?)：(.*?)<\/text>/g, '- **$1**：$2\n');
  const withLineBreaks = listItems.replace(/<br>/g, '\n');
  return withLineBreaks;
}

export async function sendMessage(message: Message): Promise<any> {
  const { title, content, link } = message;
  try {
    await instance({
      method: "POST",
      data: {
        msg_type: "interactive",
        card: {
          elements: [
            {
              tag: "div",
              text: {
                content: convertToMarkdown(content),
                tag: "lark_md",
              },
            },
            {
              actions: [
                {
                  tag: "button",
                  text: {
                    content: "查看详情",
                    tag: "lark_md",
                  },
                  url: link,
                  type: "primary",
                  value: {},
                },
              ],
              tag: "action",
            },
          ],
          header: {
            title: {
              content: title,
              tag: "plain_text",
            },
          },
        },
      },
    });
  } catch (error) {}
}

export async function sendCardMessage(messages: Message[]): Promise<any> {
  for (const message of messages) {
    await sendMessage(message);
    await delay(10000); // 等待10秒钟再发送下一条消息
  }
}

export const feishuFormatData = (data: FeedResType[]) => {
  return data.map((item, index) => ({
    title: item.title,
    content: item.content,
    link: item.link,
    pubDate: item.pubDate,
  }));
};
