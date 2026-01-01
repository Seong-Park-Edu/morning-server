// api/sign.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { date, message } = req.body;
  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const DATABASE_ID = process.env.LOG_DB_ID;

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("Direct Fetch Error:", error);
    res.status(500).json({ 
      error: '저장 실패 (Direct Fetch)', 
      details: error.message 
    });
  }
}