// Generated by IcedCoffeeScript 1.3.3d
(function() {
  var Application, DomUtils, LinkFinder;

  LinkFinder = (function() {

    function LinkFinder() {}

    LinkFinder.prototype.is_visible = function(link) {
      return $(link).is(":visible") && $(link).offset()['top'] > window.scrollY && $(link).offset()['top'] + $(link).height() < window.scrollY + $(window).height();
    };

    LinkFinder.prototype.match = function(search_string) {
      var link, links, scores, tuple;
      scores = ((function() {
        var _i, _len, _ref, _results;
        _ref = $("a");
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          link = _ref[_i];
          _results.push([link, link.text.score(search_string)]);
        }
        return _results;
      })()).sort(function(a, b) {
        return b[1] - a[1];
      });
      links = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = scores.length; _i < _len; _i++) {
          tuple = scores[_i];
          if (tuple[1] > 0) _results.push(tuple[0]);
        }
        return _results;
      })();
      return (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = links.length; _i < _len; _i++) {
          link = links[_i];
          if (this.is_visible(link)) _results.push(link);
        }
        return _results;
      }).call(this);
    };

    return LinkFinder;

  })();

  DomUtils = (function() {

    function DomUtils() {
      if (navigator.userAgent.indexOf("Mac") !== -1) {
        this.platform = "Mac";
      } else if (navigator.userAgent.indexOf("Linux") !== -1) {
        this.platform = "Linux";
      } else {
        this.platform = "Windows";
      }
    }

    DomUtils.prototype.simulateClick = function(element, modifiers) {
      var event, eventSequence, mouseEvent, _i, _len, _results;
      eventSequence = ["click"];
      _results = [];
      for (_i = 0, _len = eventSequence.length; _i < _len; _i++) {
        event = eventSequence[_i];
        mouseEvent = document.createEvent("MouseEvents");
        mouseEvent.initMouseEvent(event, true, true, window, 1, 0, 0, 0, 0, modifiers.ctrlKey, false, modifiers.shiftKey, modifiers.metaKey, 0, null);
        _results.push(element.dispatchEvent(mouseEvent));
      }
      return _results;
    };

    return DomUtils;

  })();

  Application = (function() {

    function Application(options) {
      this.options = options;
      this.reset();
      this.link_finder = new LinkFinder();
      this.dom_utils = new DomUtils();
    }

    Application.prototype.reset = function() {
      this.activated = false;
      this.search_string = "";
      this.matched_links = [];
      return this.focused_link_index = 0;
    };

    Application.prototype.unfocus_links = function(links) {};

    Application.prototype.update_link_focus = function() {
      return $(this.matched_links[this.focused_link_index]).addClass("deadmouse-focused");
    };

    Application.prototype.focus_first_link = function() {
      this.focused_link_index = 0;
      return this.update_link_focus();
    };

    Application.prototype.focus_next_link = function() {
      this.focused_link_index += 1;
      if (this.focused_link_index > this.matched_links.length - 1) {
        this.focused_link_index = 0;
      }
      return this.update_link_focus();
    };

    Application.prototype.focus_prev_link = function() {
      this.focused_link_index -= 1;
      if (this.focused_link_index < 0) {
        this.focused_link_index = this.matched_links.length - 1;
      }
      return this.update_link_focus();
    };

    Application.prototype.follow_focused_link = function(ctrlPressed, metaPressed, shiftPressed) {
      var modifiers;
      modifiers = {
        ctrlKey: ctrlPressed,
        metaKey: metaPressed,
        shiftKey: shiftPressed
      };
      return this.dom_utils.simulateClick(this.matched_links[this.focused_link_index], modifiers);
    };

    Application.prototype.not_in_blacklist = function(domain) {
      var blacklisted, in_blacklist, _i, _len, _ref;
      in_blacklist = false;
      _ref = this.options.blacklist.split(",");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        blacklisted = _ref[_i];
        if (blacklisted.length && !/^\s*$/.test(blacklisted) && domain.indexOf(blacklisted) >= 0) {
          console.log(blacklisted);
          in_blacklist = true;
        }
      }
      return !in_blacklist;
    };

    Application.prototype.clear = function() {
      var link, _i, _j, _len, _len1, _ref, _ref1, _results;
      _ref = $("a");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        $(link).removeClass("deadmouse-focused");
      }
      _ref1 = $("a");
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        link = _ref1[_j];
        _results.push($(link).removeClass("deadmouse-clicked"));
      }
      return _results;
    };

    Application.prototype.keypress = function(event) {
      if (this.not_in_blacklist(document.location.hostname)) {
        if (!this.activated && event.keyCode === 32) {
          return true;
        } else if (document.activeElement === document.body) {
          this.activated = true;
          this.search_string += String.fromCharCode(event.keyCode);
          this.matched_links = this.link_finder.match(this.search_string);
          this.clear();
          if (this.matched_links.length > 0) {
            this.focus_first_link();
          } else {
            this.reset();
          }
          return false;
        } else {
          return true;
        }
      }
    };

    Application.prototype.keydown = function(event) {
      if ((event.keyCode === 27 || event.keyCode === 8) && this.activated) {
        this.clear();
        this.reset();
        return false;
      } else if (this.activated && event.keyCode === 9) {
        this.clear();
        if (event.shiftKey) {
          this.focus_prev_link();
        } else {
          this.focus_next_link();
        }
        return false;
      } else if (this.activated && event.keyCode === 13) {
        this.clear();
        this.follow_focused_link(event.ctrlKey, event.metaKey, event.shiftKey);
        this.reset();
        return false;
      }
    };

    return Application;

  })();

  $(document).ready(function() {
    return chrome.extension.sendRequest({
      action: 'gpmeGetOptions'
    }, function(options) {
      var app;
      app = new Application(options);
      $(window).on("keypress", function(e) {
        return app.keypress(event);
      });
      return $(window).on("keydown", function(e) {
        return app.keydown(event);
      });
    });
  });

}).call(this);
