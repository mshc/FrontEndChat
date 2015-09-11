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
    debugger;
  };

  Chat.prototype.bindEvents = function () {
    this.$el.find(".send-message").click(this.submit.bind(this));
  };

})();
