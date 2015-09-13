(function () {
  if (typeof Messages === "undefined") {
    Messages = window.Messages = {};
  }

  Chat = Messages.Chat = function (options) {
    this.$el = options.$el;
    this.conversations = {};
    this.socket = options.socket;
    this.socket.emit("join", "default");
    this.bindEvents();
    this.welcome();
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

  Chat.prototype.welcome = function () {
    var self = this;
    $(".conversation").eq(0).addClass("active-conversation");

    var first = "Welcome! This is a Chat app build with node.js and socket.io.";
    var second = "Start typing to send a message to everyone in the main chat room, or click a user to the left for a private chat!";
    var third = "If nobody is online, try opening another tab or two to test the app.";
    var fourth = "Check the code out at github.com/mpiercy827/FrontEndChat!";

    setTimeout(function () { self.addMessage(first); }, 1000);
    setTimeout(function () { self.addMessage(second); }, 3000);
    setTimeout(function () { self.addMessage(third); }, 5000);
    setTimeout(function () { self.addMessage(fourth); }, 7000);
  };

  Chat.prototype.activateConversation = function (event) {
    event.preventDefault();
    if ($(event.currentTarget).hasClass("active-conversation")) { return; }

    var currId = $(".active-conversation").data("id");
    $(".active-conversation").removeClass("active-conversation");

    var $convDiv = $(event.currentTarget).addClass("active-conversation");
    var otherId = $convDiv.data("id");

    this.socket.emit("join", otherId);
    this.clearCurrConv(currId);
    this.populateRecent(otherId);
  };

  Chat.prototype.clearCurrConv = function (currId) {
    this.conversations[currId] = $(".current-conversation")
                                  .find(".message")
                                  .slice(-5);
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
