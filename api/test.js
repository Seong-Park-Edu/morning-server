// api/test.js
export default function handler(req, res) {
  // 무조건 문을 열어주는 코드
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  // 성공 메시지 보내기
  res.status(200).json({ message: "테스트 성공! 서버와 통신 도로는 뚫려있습니다." });
}