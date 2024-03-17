import { isEmpty } from "lodash";
import { createClient, sql } from "@vercel/postgres";
import "dotenv/config";

const client = createClient();

export const insertData = async (data: any[]) => {
  try {
    console.log("data", data);
    if (isEmpty(data)) return;

    await client.connect(); // 建立数据库连接

    const values = data.map((cur) => {
      const { title, link, pubDate, content } = cur;
      return `('${title.replace(
        /["']/g,
        ""
      )}', '${link}', '${pubDate}', '${content}', '', '')`;
    });

    const insertSql = `
      INSERT INTO rss (title, link, pubDate, content, summary, isoDate)
      VALUES ${values.join(", ")};
    `;

    await client.query(insertSql);
  } catch (error) {
    console.error("插入数据时出错:", error);
  } finally {
    await client.end(); // 关闭数据库连接
  }
};

export const getRssData = async () => {
  const { rows } = await sql`select * from rss ORDER BY id DESC LIMIT 30`;
  return rows;
};
