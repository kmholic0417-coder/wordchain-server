const http = require("http");

let players = [];
let gameStarted = false;

const server = http.createServer((req, res) => {
    if (req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            let data = JSON.parse(body);
            let msg = data.userRequest.utterance;
            let reply = "";

            if (msg === "/잇기참가") {
                if (!players.includes(data.userRequest.user.id)) {
                    players.push(data.userRequest.user.id);
                    reply = "참가 완료. 현재 인원: " + players.length;
                } else {
                    reply = "이미 참가했습니다.";
                }
            } 
            else if (msg === "/잇기시작") {
                if (players.length < 1) {
                    reply = "참가자가 없습니다.";
                } else {
                    gameStarted = true;
                    reply = "끝말잇기 시작! 참가자 수: " + players.length;
                }
            }
            else {
                reply = "명령어: /잇기참가 또는 /잇기시작";
            }

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                version: "2.0",
                template: {
                    outputs: [{
                        simpleText: {
                            text: reply
                        }
                    }]
                }
            }));
        });
    }
});

server.listen(3000, () => {
    console.log("서버 실행됨");
});

