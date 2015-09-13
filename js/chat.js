(function () {
  if (typeof Messages === "undefined") {
    Messages = window.Messages = {};
  }

  Chat = Messages.Chat = function (options) {
    this.$el = options.$el;
    this.socket = options.socket;
    this.socket.emit("join", "default");
    this.bindEvents();
  };

  Chat.prototype.submit = function () {
    var inputArea = this.$el.find(".new-message>textarea");
    var input = inputArea.val();
    if (input) {
      this.socket.emit("send", input);
      this.addMessage(input, true);
      inputArea.val("");
    }
  };

  Chat.prototype.activateConversation = function (event) {
    event.preventDefault();
    if ($(event.currentTarget).hasClass("active-conversation")) { return; }

    $(".active-conversation").removeClass("active-conversation");
    var $convDiv = $(event.currentTarget).addClass("active-conversation");
    var otherId = $convDiv.data("id");

    this.socket.emit("join", otherId);
    this.clearCurrConv();
  };

  Chat.prototype.clearCurrConv = function () {
    $(".current-conversation").empty();
  };

  Chat.prototype.addMessage = function (message, currentUser) {
    var divClass = currentUser ? "current-user-message" : "other-message";
    var bubble = $("<div>").addClass("message").addClass(divClass).text(message);
    this.$el.find(".current-conversation").append(bubble);
    this.addMostRecentMessage(message);
  };

  Chat.prototype.addUser = function (username, socketId) {
    if (!this.availableName(username)) { return; } //Perhaps alert user to choose another name.
    var $img = $("<div>").addClass("demo-img");
    var $mostRecent = $("<div>").addClass("most-recent");
    var $text = $("<div>").addClass("text").text(username).append($mostRecent);
    var $convDiv = $("<div>")
                    .addClass("conversation")
                    .attr("data-id", socketId)
                    .append($img)
                    .append($text);

    $convDiv.click(this.activateConversation.bind(this));
    this.$el.find(".all-conversations").append($convDiv);
  };

  Chat.prototype.addMostRecentMessage = function (message) {
    var $activeConv = $(".active-conversation");
    $activeConv.find(".most-recent").text(message);
  };

  Chat.prototype.removeUser = function (username) {
    this.$el.find(".conversation:contains('" + username + "')").remove();
  };

  Chat.prototype.availableName = function (username) {
    return this.$el.find(".conversation:contains('"+username+"')").length === 0;
  };

  Chat.prototype.bindEvents = function () {
    var self = this;
    var socket = this.socket;

    this.$el.find(".conversation").click(this.activateConversation);
    this.$el.find(".new").on("keydown", function (event) {
      var numChars = self.$el.find(".new").val().length;

      if (event.keyCode === 13) {
        event.preventDefault();
        self.submit();
      } else if (numChars > 0) {
        //is typing
      } else if (numChars <= 1 && event.keyCode === 8) {
        //is no longer typing
      }
    });

    socket.on("receive", function(message){
      self.addMessage(message, false);
    });

    socket.on("add", function (username, socketId) {
      self.addUser(username, socketId);
    });

    socket.on("exit", function (username) {
      self.removeUser(username);
    });

    socket.on("entrance", function (username, socketId) {
      self.addUser(username, socketId);
    });
  };

})();
