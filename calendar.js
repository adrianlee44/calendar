/*
@name Calendar
@description
Just a small jQuery plugin to render a daily agenda

@author Adrian Lee
@email adrian@adrianlee.me
@license MIT
*/

var __slice = [].slice;

(function(window, $) {
  var Calendar;
  Calendar = (function() {
    Calendar.prototype.defaults = {
      events: [],
      height: 800,
      width: 600,
      startHour: 0,
      endHour: 24
    };

    Calendar.prototype.template = {
      events: "<div class=\"events\"></div>",
      time: "<div class=\"time\"></div>",
      hour: "<div class=\"time-label\"/>",
      event: "<div class=\"event\" />",
      currentTime: "<div class=\"current-time\"></div>"
    };

    function Calendar(el, options) {
      var currentTimeBar, eventsSection, hourSection;
      this.opts = $.extend({}, this.defaults, options);
      this.$el = $(el);
      hourSection = $(this.template.time);
      currentTimeBar = $(this.template.currentTime);
      eventsSection = $(this.template.events).append(currentTimeBar);
      this.$el.empty().append(hourSection, eventsSection);
      this.$el.css({
        width: this.opts.width
      });
      this.interval = this.opts.height / (this.opts.endHour - this.opts.startHour);
      this.processEvents(this.opts.events);
      this.populateHours(hourSection);
      this.populateEvents(eventsSection);
      this.setCurrentTime(currentTimeBar);
    }

    /*
    @name normalizeTime
    @type function
    @description
    To convert start and end time to format used by calendar plugin
    @param {Object} event Event object with start and end time
    @returns {Object} Updated event with new start and end time
    */


    Calendar.prototype.normalizeTime = function(event) {
      var end, start;
      start = event.start;
      end = event.end;
      if (typeof start === "string" && start.indexOf("T") > -1) {
        event.start = parseInt(start.split("T")[1].substring(0, 4));
      }
      if (typeof end === "string" && end.indexOf("T") > -1) {
        return event.end = parseInt(end.split("T")[1].substring(0, 4));
      }
    };

    Calendar.prototype.processEvents = function(events) {
      var bottom, columnY, columnsY, currentColY, end, event, height, i, index, length, start, top, _i, _len, _ref, _results;
      this.events = events.sort(function(a, b) {
        return a.start - b.start;
      });
      columnsY = [
        {
          top: 0,
          bottom: 0
        }
      ];
      _ref = this.events;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        event = _ref[index];
        this.normalizeTime(event);
        start = Math.floor(event.start / 100) + ((event.start % 100) / 60);
        end = Math.floor(event.end / 100) + ((event.end % 100) / 60);
        top = this.interval * (start - this.opts.startHour) - 20;
        height = this.interval * (end - start);
        bottom = top + height;
        $.extend(event, {
          top: top,
          bottom: bottom,
          height: height,
          width: 0,
          conflict: 1
        });
        length = columnsY.length;
        currentColY = {
          top: top,
          bottom: bottom,
          index: index
        };
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (i = _j = 0, _len1 = columnsY.length; _j < _len1; i = ++_j) {
            columnY = columnsY[i];
            if (top >= columnY.bottom) {
              columnsY[i] = currentColY;
              if (event.column == null) {
                event.column = i;
              }
              _results1.push(event.width++);
            } else if (event.width > 0) {
              event.conflict = length;
              break;
            } else {
              event.conflict++;
              this.events[columnY.index].conflict++;
              if (length - 1 === i) {
                event.column = columnsY.push(currentColY) - 1;
                _results1.push(event.width++);
              } else {
                _results1.push(void 0);
              }
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    /*
    @name populateHours
    @type function
    @description
    Create the side hour section
    @param {DOM element} element Element to populate hour labels
    */


    Calendar.prototype.populateHours = function(element) {
      var hour, period, time, _i, _ref, _ref1, _results;
      _results = [];
      for (hour = _i = _ref = this.opts.startHour, _ref1 = this.opts.endHour - 1; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; hour = _ref <= _ref1 ? ++_i : --_i) {
        period = hour < 12 ? "AM" : "PM";
        time = hour % 12 ? hour % 12 : 12;
        _results.push($(this.template.hour).text("" + time + " " + period).css({
          top: (hour - this.opts.startHour) * this.interval
        }).appendTo(element));
      }
      return _results;
    };

    /*
    @name populateEvents
    @type function
    @description
    Create and position all event boxes
    @param {DOM element} element Element to populate event boxes
    */


    Calendar.prototype.populateEvents = function(element) {
      var event, eventEle, width, _i, _len, _ref, _results;
      _ref = this.events;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        width = (event.width / event.conflict) * 100;
        _results.push(eventEle = $(this.template.event).text("Event " + event.id).css({
          top: event.top,
          height: event.height,
          width: "" + width + "%",
          left: "" + (width * event.column) + "%"
        }).appendTo(element));
      }
      return _results;
    };

    /*
    @name setCurrentTime
    @type function
    @description
    Update the position of the current time line
    @param {DOM element} element Current time line
    */


    Calendar.prototype.setCurrentTime = function(element) {
      var interval, updatePosition,
        _this = this;
      interval = 60 / this.interval * 1000;
      (updatePosition = function() {
        var now, top;
        now = new Date();
        top = _this.interval * (now.getHours() - _this.opts.startHour + now.getMinutes() / 60);
        return element.css({
          top: top
        });
      })();
      return setInterval(updatePosition, interval);
    };

    return Calendar;

  })();
  return $.fn.extend({
    calendar: function() {
      var args, options;
      options = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return this.each(function() {
        var $this, data;
        $this = $(this);
        data = $this.data("calendar");
        if (!data) {
          $this.data("calendar", (data = new Calendar(this, options)));
        }
        if (typeof option === "string") {
          return data[option].apply(data, args);
        }
      });
    }
  });
})(window, jQuery);
