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
  socket.on("chat message", function (message) {
    io.emit("chat message", message)
  });

  socket.on("disconnect", function () {
    console.log("User disconnected");
  });
});

http.listen(3000, function(){
  console.log("listening on *:3000");
});
