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
      calendar: "<div class=\"time\"></div><div class=\"events\"></div>",
      hour: "<div class=\"time-label\"/>",
      event: "<div class=\"event\" />"
    };

    function Calendar(el, options) {
      var end, event, start, _i, _len, _ref;
      this.opts = $.extend({}, this.defaults, options);
      this.$el = $(el);
      this.columnsY = [];
      this.$el.html(this.template.calendar);
      this.hourSection = this.$el.find(".time");
      this.eventsSection = this.$el.find(".events");
      this.events = this.opts.events.sort(function(a, b) {
        return a.start - b.start;
      });
      this.startHour = 24;
      this.endHour = 0;
      _ref = this.events;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        if ((start = Math.floor(event.start / 100)) < this.startHour) {
          this.startHour = start;
        }
        if ((end = Math.floor(event.end / 100)) > this.endHour) {
          this.endHour = end;
        }
      }
      this.interval = this.opts.height / (this.endHour - this.startHour);
      this.processEvents();
      this.populateHours();
      this.populateEvents();
    }

    Calendar.prototype.processEvents = function() {
      var bottom, columnY, currentColY, end, event, height, i, index, length, start, top, _i, _len, _ref, _results;
      this.columnsY = [
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
        if (event.width == null) {
          event.width = 0;
        }
        if (event.conflict == null) {
          event.conflict = 1;
        }
        length = this.columnsY.length;
        currentColY = {
          top: top,
          bottom: bottom,
          index: index,
          conflict: []
        };
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = this.columnsY;
          _results1 = [];
          for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
            columnY = _ref1[i];
            if (top >= columnY.bottom) {
              this.columnsY[i] = currentColY;
              if (event.column == null) {
                event.column = i;
              }
              event.width++;
              event.top = top;
              event.bottom = bottom;
              _results1.push(event.height = height);
            } else if (event.width > 0) {
              event.conflict = length;
              break;
            } else if (length - 1 === i) {
              currentColY.conflict.push(columnY.index);
              event.column = this.columnsY.push(currentColY) - 1;
              columnY.conflict.push(index);
              event.width++;
              event.conflict++;
              event.top = top;
              event.bottom = bottom;
              event.height = height;
              this.events[columnY.index].conflict++;
              break;
            } else {
              this.events[columnY.index].conflict++;
              currentColY.conflict.push(columnY.index);
              _results1.push(event.conflict++);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Calendar.prototype.populateHours = function() {
      var count, current, hour, period, time, _i, _ref, _ref1, _results;
      count = 0;
      _results = [];
      for (hour = _i = _ref = this.startHour, _ref1 = this.endHour; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; hour = _ref <= _ref1 ? ++_i : --_i) {
        current = $(this.template.hour);
        time = hour === 12 ? hour : hour % 12;
        period = hour < 12 ? "AM" : "PM";
        current.text("" + time + " " + period);
        current.css({
          top: count * this.interval
        });
        this.hourSection.append(current);
        _results.push(count++);
      }
      return _results;
    };

    Calendar.prototype.populateEvents = function() {
      var event, eventEle, hasConflict, width, _i, _len, _ref, _results;
      hasConflict = function(current, target) {
        var _ref, _ref1;
        return (target.start < (_ref = current.start) && _ref < target.end) || (target.start < (_ref1 = current.end) && _ref1 < target.end);
      };
      _ref = this.events;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        eventEle = $(this.template.event);
        eventEle.text("Event " + event.id);
        width = (this.opts.width * 0.85 - 20) * (event.width / event.conflict) - 2;
        eventEle.css({
          top: event.top,
          height: event.height,
          width: width,
          left: width * event.column + 10
        });
        _results.push(this.eventsSection.append(eventEle));
      }
      return _results;
    };

    Calendar.prototype.findAvailableCol = function(columns, top) {
      var columnY, i, _i, _len, _ref;
      if (columns == null) {
        columns = 1;
      }
      if (columns === 1) {
        return {
          column: columns,
          top: top
        };
      }
      _ref = this.columnsY;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        columnY = _ref[i];
        if (columnY <= top) {
          return {
            column: i + 1,
            top: top
          };
        }
      }
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
