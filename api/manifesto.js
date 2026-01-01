//Vercel은 이 폴더 안에 있는 파일들을 자동으로 서버 주소로 만들어줍니다.
//앱 화면에 뿌려줄 글(내용, 순서, 타입)을 가져오는 코드입니다.
//
// api/manifesto.js

export default async function handler(req, res) {
  // 1. ★★★ 출입증(CORS) 발급 코드 (이 부분이 추가됨) ★★★
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // 누구든 들어와도 됨
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 브라우저가 "들어가도 돼?" 하고 찔러볼 때(OPTIONS) "OK" 해주는 코드
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. 기존 로직 (그대로 유지)
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const DATABASE_ID = process.env.MANIFESTO_DB_ID;

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        sorts: [{ property: '순서', direction: 'ascending' }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const notionData = await response.json();

    const cleanData = notionData.results.map((item) => {
      return {
        id: item.id,
        text: item.properties['내용']?.title?.[0]?.plain_text || "",
        type: item.properties['구분']?.select?.name || "본문",
        order: item.properties['순서']?.number || 99,
      };
    });

    res.status(200).json(cleanData);

  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: '데이터 로딩 실패', details: error.message });
  }
}