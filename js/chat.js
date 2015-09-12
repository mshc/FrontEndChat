(function () {
  if (typeof Messages === "undefined") {
    Messages = window.Messages = {};
  }

  Chat = Messages.Chat = function (options) {
    this.$el = options.$el;
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

  Chat.prototype.activateConversation = function (event) {
    event.preventDefault();
    $(".active-conversation").removeClass("active-conversation");
    var $convDiv = $(event.currentTarget).addClass("active-conversation");
  };

  Chat.prototype.addMessage = function (message, currentUser) {
    var divClass = currentUser ? "current-user-message" : "other-message";
    var bubble = $("<div>").addClass(divClass).text(message);
    this.$el.find(".current-conversation").append(bubble);
  };

  Chat.prototype.addUser = function (username) {
    if (!this.availableName(username)) { return; }
    var $userDiv = $("<div>").addClass("conversation").text(username);
    $userDiv.click(this.activateConversation.bind(this));
    this.$el.find(".conversations").append($userDiv);
  };

  Chat.prototype.removeUser = function (username) {
    this.$el.find(".conversation:contains('" + username + "')").remove();
  };

  Chat.prototype.availableName = function (username) {
    return this.$el.find(".conversation:contains('"+username+"')").length === 0;
  };

  Chat.prototype.bindEvents = function () {
    this.$el.find(".send-message").click(this.submit.bind(this));

    var self = this;
    var socket = this.socket;

    socket.on("receive", function(message){ self.addMessage(message, false); });
    socket.on("entrance", function (username) { self.addUser(username); });
    socket.on("add", function (username) {self.addUser(username); });
    socket.on("exit", function (username) { self.removeUser(username); });

  };

})();
