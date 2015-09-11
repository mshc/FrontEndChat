(function () {
  if (typeof Messages === "undefined") {
    Messages = window.Messages = {};
  }

  Chat = Messages.Chat = function (options) {
    this.$el = options.$el;
    this.bindEvents();
  };

  Chat.prototype.submit = function (event) {
    event.preventDefault();
    var inputArea = this.$el.find(".new-message>textarea");
    var input = inputArea.val();
    if (input) {
      var bubble = $("<div>").addClass("current-user-message").text(input);
      this.$el.find(".current-conversation").append(bubble);
      inputArea.val("");
    }
  };

  Chat.prototype.bindEvents = function () {
    this.$el.find(".send-message").click(this.submit.bind(this));
  };

})();
