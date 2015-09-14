var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

function usersIn(roomName) {
  var users = [];
  for (var id in io.sockets.connected) {
    var index = io.sockets.connected[id].rooms.indexOf(roomName);
    if (index !== -1) { users.push(io.sockets.connected[id]); }
  }
  return users;
};

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/images", express.static(__dirname + "/images"));

app.get("/", function(req, res){
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  socket.idNumber = Math.floor(Math.random() * 100000);
  socket.username = "User" + socket.idNumber;
  socket.broadcast.emit("entrance", socket.username, socket.idNumber);

  for (var id in io.sockets.connected) {
    if (id !== socket.id) {
      var curr_soc = io.sockets.connected[id];
      curr_soc.broadcast.emit("add", curr_soc.username, curr_soc.idNumber);
    }
  }

  socket.on("join", function (room) {
    socket.leave(socket.room);
    socket.room = (room === "default") ? room : parseInt(room) + socket.idNumber;
    socket.join(socket.room);
  });

  socket.on("is-typing", function (notifyId) {
    var userCount = usersIn(socket.room).length;

    for (var id in io.sockets.connected) {
      var curr_soc = io.sockets.connected[id];
      if (curr_soc.idNumber === notifyId && userCount === 2) {
        curr_soc.emit("add-typing-div");
      } else if (curr_soc.idNumber === notifyId && userCount === 1) {
        curr_soc.emit("add-typing-text", socket.idNumber);
      }
    }
  });

  socket.on("not-typing", function (notifyId) {
    for (var id in io.sockets.connected) {
      var curr_soc = io.sockets.connected[id];
      if (curr_soc.idNumber === notifyId) {
        curr_soc.emit("remove-typing", socket.idNumber);
      }
    }
  });

  socket.on("send", function (message) {
    var userCount = (usersIn(socket.room).length);
    if (userCount === 2) {
      socket.broadcast.to(socket.room).emit("receive", message);
    } else {
      var otherSocketId = socket.room - socket.idNumber;
      for (var id in io.sockets.connected) {
        var curr_soc = io.sockets.connected[id];
        if (curr_soc.idNumber === otherSocketId) {
          curr_soc.emit("notification", message, socket.idNumber);
        }
      }
    }
  });

  socket.on("disconnect", function () {
    socket.broadcast.emit("exit", socket.username);
  });
});

http.listen(3000, function(){
  console.log("listening on *:3000");
});
