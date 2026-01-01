//Vercel은 이 폴더 안에 있는 파일들을 자동으로 서버 주소로 만들어줍니다.
//앱 화면에 뿌려줄 글(내용, 순서, 타입)을 가져오는 코드입니다.

// api/manifesto.js
const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const response = await notion.databases.query({
      database_id: process.env.MANIFESTO_DB_ID,
      sorts: [
        {
          property: '순서',
          direction: 'ascending',
        },
      ],
    });

    const data = response.results.map((item) => {
      return {
        id: item.id,
        // 혹시 노션 컬럼명이 다를 경우를 대비해 안전하게 처리
        text: item.properties['내용']?.title?.[0]?.plain_text || "",
        type: item.properties['구분']?.select?.name || "본문",
        order: item.properties['순서']?.number || 99,
      };
    });

    res.status(200).json(data);

  } catch (error) {
    console.error("에러 발생:", error);
    res.status(500).json({ error: '데이터 로딩 실패', details: error.message });
  }
};