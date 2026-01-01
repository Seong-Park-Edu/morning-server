// api/manifesto.js

export default async function handler(req, res) {
  // 1. [방탄 조끼] 무조건 출입증(CORS)부터 붙이고 시작함
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. 브라우저/앱의 "노크(OPTIONS)"에 바로 문 열어줌
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 3. 환경변수 검사 (여기서 없으면 바로 에러 냄)
    const NOTION_API_KEY = process.env.NOTION_API_KEY;
    const DATABASE_ID = process.env.MANIFESTO_DB_ID;

    if (!NOTION_API_KEY || !DATABASE_ID) {
      throw new Error("환경변수(API Key 또는 DB ID)가 Vercel에 설정되지 않았습니다.");
    }

    // 4. 노션 데이터 가져오기 (Fetch 사용)
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

    // 노션이 거절했을 경우
    if (!response.ok) {
      const notionError = await response.json();
      throw new Error(`노션 에러: ${notionError.message || JSON.stringify(notionError)}`);
    }

    const notionData = await response.json();

    // 데이터 가공
    const cleanData = notionData.results.map((item) => {
      return {
        id: item.id,
        text: item.properties['내용']?.title?.[0]?.plain_text || "",
        type: item.properties['구분']?.select?.name || "본문",
        order: item.properties['순서']?.number || 99,
      };
    });

    // 성공 응답
    res.status(200).json(cleanData);

  } catch (error) {
    // ★ 여기가 핵심 ★ 
    // 에러가 나도 CORS 헤더(출입증)를 갖고 나가게 함
    console.error("Server Error:", error);
    res.status(500).json({ 
      error: '서버 내부 오류 발생', 
      details: error.message 
    });
  }
}