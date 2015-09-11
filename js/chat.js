(function () {
  if (typeof Messages === "undefined") {
    Messages = window.Messages = {};
  }

  Chat = Messages.Chat = function (options) {
    this.$el = options.$el;
    this.socket = options.socket
    this.bindEvents();
  };

  Chat.prototype.submit = function (event) {
    event.preventDefault();
    var inputArea = this.$el.find(".new-message>textarea");
    var input = inputArea.val();
    if (input) {
      this.socket.emit("chat message", input);
      var bubble = $("<div>").addClass("current-user-message").text(input);
      this.$el.find(".current-conversation").append(bubble);
      inputArea.val("");
    }
  };

  Chat.prototype.bindEvents = function () {
    this.$el.find(".send-message").click(this.submit.bind(this));
    this.socket.on('chat message', function(message){
      var bubble = $("<div>").addClass("other-message").text(message);
      this.$el.find(".current-conversation").append(bubble);
    }.bind(this));
  };

})();
