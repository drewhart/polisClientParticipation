define([
  "view",
  "templates/inbox"
], function (View, template) {
  return View.extend({
    name: "inbox",
    template: template,
    initialize: function(options) {
      this.collection = options.collection;
      this.filters = {};
      this.filters.is_active = options.is_active;
      this.filters.is_draft = options.is_draft;
      this.collection.comparator = function(conversation) {
        return -new Date(conversation.get("createdAt")).getTime();
      };
      this.collection.fetch(this.filters);
    },
    events: {
      "mouseup input": function(event) {
        // :(  http://stackoverflow.com/questions/3272089/programmatically-selecting-text-in-an-input-field-on-ios-devices-mobile-safari
        setTimeout(function() {
          if (event.target) {
            event.target.setSelectionRange(0,9999999);
          }
        },1);
      }
    },
    publish: function(){
      var model = $(event.target).model();
      model.save({is_active: true, is_draft: false});
    }
  });
});
