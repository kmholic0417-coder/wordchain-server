const http = require("http");

let players = [];
let gameStarted = false;

function send(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(body);
}

const server = http.createServer((req, res) => {
  // Railway 헬스체크/브라우저 접속은 보통 GET /
  if (req.method === "GET") {
    return send(res, 200, "OK - server is running");
  }

  // 카카오/봇 요청은 POST가 일반적
  if (req.method !== "POST") {
    return send(res, 405, "Method Not Allowed");
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    // 너무 큰 요청 방지(옵션)
    if (body.length > 1_000_000) {
      req.destroy();
    }
  });

  req.on("end", () => {
    let message = "";
    let user = "";

    try {
      const data = JSON.parse(body);

      // 카카오 i / 오픈빌더 형태가 다를 수 있어서 안전하게 꺼냄
      message =
        data?.userRequest?.utterance ??
        data?.utterance ??
        "";

      user =
        data?.userRequest?.user?.id ??
        data?.userRequest?.user?.uuid ??
        data?.user?.id ??
        "anonymous";
    } catch (e) {
      // JSON 아니면 에러 응답
      return send(res, 400, "Bad Request - invalid JSON");
    }

    let responseText = "";

    if (message === "/입장") {
      if (!players.includes(user)) {
        players.push(user);
        responseText = "참가 완료";
      } else {
        responseText = "이미 참가함";
      }
    } else if (message === "/시작") {
      if (players.length < 1) {
        responseText = "참가자 없음";
      } else {
        gameStarted = true;
        responseText = "끝말잇기 시작!";
      }
    } else {
      responseText = "명령어: /입장 /시작";
    }

    const payload = {
      version: "2.0",
      template: {
        outputs: [
          { simpleText: { text: responseText } }
        ]
      }
    };

    return send(res, 200, JSON.stringify(payload), "application/json; charset=utf-8");
  });
});

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("listening on", PORT);
});
