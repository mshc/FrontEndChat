var express = require("express");
var app = express();
var http = require("http").Server(app);

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));

app.get("/", function(req, res){
  res.sendFile(__dirname + "/index.html");
});

http.listen(3000, function(){
  console.log("listening on *:3000");
});
