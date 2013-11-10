(function() {
  var Calendar,
    __slice = [].slice;

  Calendar = (function() {
    Calendar.prototype.defaults = {
      events: [],
      height: 800,
      width: 600
    };

    Calendar.prototype.template = {
      events: "<div class=\"events\"></div>",
      time: "<div class=\"time\"></div>",
      hour: "<div class=\"time-label\"/>",
      event: "<div class=\"event\" />",
      currentTime: "<div class=\"current-time\"></div>"
    };

    function Calendar(el, options) {
      this.opts = $.extend({}, this.defaults, options);
      this.$el = $(el);
      this.hourSection = $(this.template.time);
      this.eventsSection = $(this.template.events);
      this.currentTimeBar = $(this.template.currentTime);
      this.$el.empty().append(this.hourSection, this.eventsSection);
      this.eventsSection.append(this.currentTimeBar);
      this.$el.css({
        width: this.opts.width
      });
      this.events = this.opts.events.sort(function(a, b) {
        return a.start - b.start;
      });
      this.startHour = 0;
      this.endHour = 23;
      this.interval = this.opts.height / (this.endHour - this.startHour);
      this.processEvents();
      this.populateHours();
      this.populateEvents();
      this.setCurrentTime();
    }

    Calendar.prototype.processEvents = function() {
      var bottom, columnY, columnsY, currentColY, end, event, height, i, index, length, start, top, _i, _len, _ref, _results;
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
        start = Math.floor(event.start / 100) + ((event.start % 100) / 60);
        end = Math.floor(event.end / 100) + ((event.end % 100) / 60);
        top = this.interval * (start - this.startHour) - 20;
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

    Calendar.prototype.populateHours = function() {
      var hour, period, time, _i, _ref, _ref1, _results;
      _results = [];
      for (hour = _i = _ref = this.startHour, _ref1 = this.endHour; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; hour = _ref <= _ref1 ? ++_i : --_i) {
        time = hour === 12 ? hour : hour % 12;
        period = hour < 12 ? "AM" : "PM";
        _results.push($(this.template.hour).text("" + time + " " + period).css({
          top: (hour - this.startHour) * this.interval
        }).appendTo(this.hourSection));
      }
      return _results;
    };

    Calendar.prototype.populateEvents = function() {
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
        }).appendTo(this.eventsSection));
      }
      return _results;
    };

    Calendar.prototype.setCurrentTime = function() {
      var interval, updatePosition,
        _this = this;
      interval = 60 / this.interval * 1000;
      (updatePosition = function() {
        var now, top;
        now = new Date();
        top = _this.interval * (now.getHours() - _this.startHour + now.getMinutes() / 60);
        return _this.currentTimeBar.css({
          top: top
        });
      })();
      return setInterval(updatePosition, interval);
    };

    return Calendar;

  })();

  $.fn.extend({
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
          return data[option].apply(data, argsW);
        }
      });
    }
  });

}).call(this);
