// api/sign.js
const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { date, message } = req.body;

  try {
    await notion.pages.create({
      parent: { database_id: process.env.LOG_DB_ID },
      properties: {
        '다짐': {
          title: [
            {
              text: {
                content: message || "아침 루틴 완료",
              },
            },
          ],
        },
        '날짜': {
          date: {
            start: date,
          },
        },
      },
    });

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("에러 발생:", error);
    res.status(500).json({ error: '저장 실패', details: error.message });
  }
};