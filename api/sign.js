// api/sign.js
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { date, message } = req.body; // 앱에서 보낸 날짜와 메시지

  try {
    await notion.pages.create({
      parent: { database_id: process.env.LOG_DB_ID },
      properties: {
        '다짐': { // 노션 제목 컬럼
          title: [
            {
              text: {
                content: message || "아침 루틴 완료",
              },
            },
          ],
        },
        '날짜': { // 노션 날짜 컬럼
          date: {
            start: date, // "2026-01-01"
          },
        },
      },
    });

    res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '저장 실패' });
  }
}