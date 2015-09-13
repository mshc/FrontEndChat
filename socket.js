var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/images", express.static(__dirname + "/images"));

app.get("/", function(req, res){
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  socket.idNumber = Math.floor(Math.random() * 100000);
  var username = "User" + socket.idNumber;
  socket.username = username;
  socket.broadcast.emit("entrance", username, socket.idNumber);

  for (var s in io.sockets.connected) {
    if (s !== socket.id) {
      var curr_soc = io.sockets.connected[s];
      curr_soc.broadcast.emit("add", curr_soc.username, curr_soc.idNumber);
    }
  }

  socket.on("join", function (room) {
    socket.leave(socket.room);
    if (room === "default") {
      socket.room = room;
    } else {
      socket.room = parseInt(room) + socket.idNumber;
    }
    socket.join(socket.room);
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
