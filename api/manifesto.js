//Vercel은 이 폴더 안에 있는 파일들을 자동으로 서버 주소로 만들어줍니다.
//앱 화면에 뿌려줄 글(내용, 순서, 타입)을 가져오는 코드입니다.
//
// api/manifesto.js

export default async function handler(req, res) {
  // GET 요청만 받음
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const DATABASE_ID = process.env.MANIFESTO_DB_ID;

  try {
    // 라이브러리 대신 'fetch'로 직접 노션 서버 주소를 두드립니다.
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28', // 노션 API 버전 명시
      },
      body: JSON.stringify({
        sorts: [
          {
            property: '순서',
            direction: 'ascending',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const notionData = await response.json();

    // 데이터 가공 (구조는 동일)
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
    console.error("Direct Fetch Error:", error);
    res.status(500).json({ 
      error: '데이터 로딩 실패 (Direct Fetch)', 
      details: error.message 
    });
  }
}