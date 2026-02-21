if (req.method === "GET") {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("서버 정상 작동중");
  return;
}

const http = require("http");

let players = [];
let gameStarted = false;

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      let message = "";
      let responseText = "";

      try {
        const data = JSON.parse(body);
        message = data.userRequest.utterance;
        const user = data.userRequest.user.id;

        if (message === "/입장") {
          if (!players.includes(user)) {
            players.push(user);
            responseText = "참가 완료";
          } else {
            responseText = "이미 참가함";
          }
        }
        else if (message === "/시작") {
          if (players.length < 1) {
            responseText = "참가자 없음";
          } else {
            gameStarted = true;
            responseText = "끝말잇기 시작!";
          }
        }
        else {
          responseText = "명령어: /입장 /시작";
        }

      } catch (e) {
        responseText = "오류 발생";
      }

      res.writeHead(200, {"Content-Type": "application/json"});
      res.end(JSON.stringify({
        version: "2.0",
        template: {
          outputs: [{
            simpleText: {
              text: responseText
            }
          }]
        }
      }));
    });
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("서버 실행됨 on port " + PORT);
});
