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
  socket.idNumber = Math.floor(Math.random() * 100000);
  var username = "User" + socket.idNumber;
  socket.username = username;
  socket.broadcast.emit("entrance", username);

  for (var s in io.sockets.connected) {
    if (s.id !== socket.id) {
      var curr_soc = io.sockets.connected[s];
      curr_soc.broadcast.emit("add", curr_soc.username);
    }
  }

  socket.on("join", function (roomName) {
    socket.leave(socket.room);
    socket.room = roomName;
    socket.join(roomName);
  });

  socket.on("send", function (message) {
    socket.broadcast.to(socket.room).emit("receive", message);
  });

  socket.on("disconnect", function () {
    socket.broadcast.emit("exit", username);
  });
});

http.listen(3000, function(){
  console.log("listening on *:3000");
});
