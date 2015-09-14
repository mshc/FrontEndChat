(function () {
  if (typeof Messages === "undefined") {
    Messages = window.Messages = {};
  }

  Chat = Messages.Chat = function (options) {
    this.$el = options.$el;
    this.conversations = {};
    this.messagesToKeep = 5;
    this.socket = options.socket;
    this.socket.emit("join", "default");
    this.bindEvents();
    this.welcome();
  };

  //For demo purposes.
  Chat.prototype.welcome = function () {
    var self = this;
    $(".conversation").eq(0).addClass("active-conversation");

    var first = "Welcome! This is a Chat app build with node.js and socket.io.";
    var second = "Start typing to send a message to everyone in the main chat room, or click a user to the left for a private chat!";
    var third = "If nobody is online, try opening another tab or two to test the app.";
    var fourth = "Check the code out at github.com/mpiercy827/FrontEndChat!";

    setTimeout(function () { self.addMessage(first + " " + second); }, 1000);
    setTimeout(function () { self.addMessage(third + " " + fourth); }, 2000);
  };

  //For switching between conversations.
  Chat.prototype.activateConversation = function (event) {
    event.preventDefault();
    var $newActive = $(event.currentTarget);

    //Remove notification if present and return if already active.
    $newActive.find(".message-notification").remove();
    if ($newActive.hasClass("active-conversation")) { return; }

    //Deactivate the currently active conversation.
    var currActiveId = $(".active-conversation").data("id");
    $(".active-conversation").removeClass("active-conversation");

    //Activate the current target and get it's id.
    $newActive.addClass("active-conversation");
    var newActiveId = $newActive.data("id");

    //Clear the current conversation and reload the last few messages of the
    //new active conversation.
    this.clearConversation(currActiveId);
    this.populateRecent(newActiveId);

    //The demo user doesn't have a socket.
    if (newActiveId === 100000) { return; }

    //If this is not the demo user, emet a join.
    this.socket.emit("join", newActiveId);
  };

  //Remove conversation bubbles from the conversation area and store the last
  //few (specified by this.messagesToKeep).
  Chat.prototype.clearConversation = function (currActiveId) {
    this.conversations[currActiveId] = $(".current-conversation")
                                  .find(".message")
                                  .slice(-this.messagesToKeep);
    $(".current-conversation").empty();
  };

  //Loads the last (this.messagesToKeep) messages from the active conversation.
  Chat.prototype.populateRecent = function (convId) {
    if (this.conversations[convId]) {
      $.each(this.conversations[convId], function (index, messageDiv) {
        $(".current-conversation").append(messageDiv);
      });
    }
  };

  //When enter is pressed in the textarea.
  Chat.prototype.submit = function () {
    var inputArea = this.$el.find(".new-message>textarea");
    var input = inputArea.val();
    if (input) {
      this.socket.emit("send", input);
      this.addMessage(input, true);
      inputArea.val("");
    }
  };

  //Adds a message to the current conversation and styles it based on whether it
  //was submitted by the current user or not.
  Chat.prototype.addMessage = function (message, currentUser) {
    var divClass = currentUser ? "current-user-message" : "other-message";
    var bubble = $("<div>").addClass("message").addClass(divClass).text(message);
    this.removeTyping();
    this.$el.find(".current-conversation").append(bubble);
    this.addMostRecentMessage(message);
  };

  //Lets the user know that the other user in the current conversation is typing
  Chat.prototype.addTypingDiv = function () {
    if ($(".is-typing").length >= 1) { return; }
    var $typingDiv = $("<div>")
                      .addClass("other-message")
                      .addClass("is-typing")
                      .text("Typing...");
    $(".current-conversation").append($typingDiv);
  };

  //Lets the user know that a user in a different conversation is typing to them.
  Chat.prototype.addTypingText = function (otherUserId) {
    var $conv = $(".conversation").filter(function (index, conv) {
      return $(conv).data("id") === otherUserId;
    });

    $conv.find(".most-recent").text("Typing...");
  };

  Chat.prototype.removeTyping = function () {
    $(".is-typing").remove();
  };

  //Stores the message in the most recent messages for this conversation.
  Chat.prototype.storeMessage = function (convId, $messageDiv) {
    if (!this.conversations[convId]) {
      this.conversations[convId] = [];
    } else if (this.conversations[convId].length === this.messagesToKeep) {
       this.conversations[convId].shift();
    }
    this.conversations[convId].push($messageDiv);
  };

  //Displays the most recent message on the left side of the screen in the
  //corresponding conversation.
  Chat.prototype.addMostRecentMessage = function (message) {
    var $activeConv = $(".active-conversation");
    $activeConv.find(".most-recent").text(message);
  };

  //If the receiving user is not in the chat room where another user is sending
  //them a message, this will give them a notification and put the messages in
  //the store for that conversation.
  Chat.prototype.createNotification = function (message, otherSocketId) {
    var $message = $("<div>").addClass("other-message").text(message);
    this.storeMessage(otherSocketId, $message);

    var $conv = $(".conversation").filter(function (i, conversation) {
      return $(conversation).data("id") === otherSocketId;
    });

    //Adds notification if not already present.
    if ($conv.find(".message-notification").length === 0) {
      $conv.append($("<div>").addClass("message-notification"));
    }

    $conv.find(".most-recent").text(message);
  };

  //Adds a new user to the list of conversations when a new user joins.
  Chat.prototype.addUser = function (username, socketId) {
    if (!this.availableName(username)) { return; }

    //Random images for users.
    var $img = $("<img>")
                .attr("src", "http://lorempixel.com/40/40/animals/" + socketId % 10);
    var $imgDiv = $("<div>").addClass("demo-img").append($img);

    var $mostRecent = $("<div>").addClass("most-recent");
    var $text = $("<div>").addClass("text").text(username).append($mostRecent);

    var $convDiv = $("<div>")
                    .addClass("conversation")
                    .attr("data-id", socketId)
                    .append($imgDiv)
                    .append($text);

    $convDiv.click(this.activateConversation.bind(this));
    this.$el.find(".all-conversations").append($convDiv);
  };

  //Called when a user leaves the app.
  Chat.prototype.removeUser = function (username) {
    this.$el.find(".conversation:contains('" + username + "')").remove();
  };

  //So that users cannot have overlapping names.
  Chat.prototype.availableName = function (username) {
    return this.$el.find(".conversation:contains('"+username+"')").length === 0;
  };

  //Add event handlers and socket events.
  Chat.prototype.bindEvents = function () {
    var self = this;
    var socket = this.socket;

    this.$el.find(".conversation").click(this.activateConversation.bind(this));
    this.$el.find(".new").on("keydown", function (event) {
      var numChars = self.$el.find(".new").val().length; //Include most recent character
      var activeId = $(".active-conversation").data("id");

      if (event.keyCode === 13) {
        event.preventDefault();
        self.submit();
      } else if (numChars <= 1 && (event.keyCode === 8 || event.keyCode === 46)) {
        socket.emit("not-typing", activeId);
      } else if (numChars + 1 > 0) {
        socket.emit("is-typing", activeId);
      }
    });

    socket.on("receive", function(message){
      self.addMessage(message, false);
    });

    socket.on("add", function (username, socketId) {
      self.addUser(username, socketId);
    });

    socket.on("add-typing-div", self.addTypingDiv.bind(self));

    socket.on("add-typing-text", function (otherId) {
      self.addTypingText(otherId);
    });

    socket.on("remove-typing", function (otherId) {
      self.removeTyping(otherId);
    });

    socket.on("exit", function (username) {
      self.removeUser(username);
    });

    socket.on("entrance", function (username, socketId) {
      self.addUser(username, socketId);
    });

    socket.on("notification", function(message, otherSocketId) {
      self.createNotification(message, otherSocketId);
    });
  };

})();
