(function () {
  if (typeof Messages === "undefined") {
    Messages = window.Messages = {};
  }

  Chat = Messages.Chat = function (options) {
    this.$el = options.$el;
    this.io = options.io;
    this.socket = options.socket;
    this.bindEvents();
  };

  Chat.prototype.submit = function (event) {
    event.preventDefault();
    var inputArea = this.$el.find(".new-message>textarea");
    var input = inputArea.val();
    if (input) {
      this.socket.emit("send", input);
      this.addMessage(input, true);
      inputArea.val("");
    }
  };

  Chat.prototype.addMessage = function (message, currentUser) {
    var divClass = currentUser ? "current-user-message" : "other-message";
    var bubble = $("<div>").addClass(divClass).text(message);
    this.$el.find(".current-conversation").append(bubble);
  };

  Chat.prototype.addUser = function (username) {

  };

  Chat.prototype.removeUser = function (username) {
    
  };

  Chat.prototype.bindEvents = function () {
    this.$el.find(".send-message").click(this.submit.bind(this));

    this.socket.on("receive", function(message){
      this.addMessage(message, false);
    }.bind(this));

    this.socket.on("entrance", function (username) {
      this.addUser(username);
    }.bind(this));

    this.socket.on("exit", function (username) {
      this.removeUser(username);
    }.bind(this));
  };

})();
