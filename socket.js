var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));

app.get("/", function(req, res){
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  var username = "User" + Math.floor(Math.random() * 10000);
  socket.emit("entrance", username);

  socket.on("send", function (message) {
    socket.broadcast.emit("receive", message);
  });

  socket.on("disconnect", function () {
    socket.emit("exit", username);
  });
});

http.listen(3000, function(){
  console.log("listening on *:3000");
});
