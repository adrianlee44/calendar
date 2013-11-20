###
@name Calendar
@description
Just a small jQuery plugin to render a daily agenda

@author Adrian Lee
@email adrian@adrianlee.me
@license MIT
###

((window, $) ->
  class Calendar
    defaults:
      events:    []
      height:    800
      width:     600
      startHour: 0
      endHour:   24

    template:
      events:      """<div class="events"></div>"""
      time:        """<div class="time"></div>"""
      hour:        """<div class="time-label"/>"""
      event:       """<div class="event" />"""
      currentTime: """<div class="current-time"></div>"""

    constructor: (el, options) ->
      @opts = $.extend {}, @defaults, options
      @$el  = $(el)

      hourSection    = $(@template.time)
      currentTimeBar = $(@template.currentTime)
      eventsSection  = $(@template.events).append currentTimeBar

      # Replace content with template
      @$el.empty().append hourSection, eventsSection
      @$el.css width: @opts.width

      @interval  = @opts.height / (@opts.endHour - @opts.startHour)

      @processEvents @opts.events

      @populateHours hourSection
      @populateEvents eventsSection

      @setCurrentTime currentTimeBar

    ###
    @name normalizeTime
    @type function
    @description
    To convert start and end time to format used by calendar plugin
    @param {Object} event Event object with start and end time
    @returns {Object} Updated event with new start and end time
    ###
    normalizeTime: (event) ->
      start = event.start
      end   = event.end

      # Convert ISO UTC Datetime
      if typeof start is "string" and start.indexOf("T") > -1
        event.start = parseInt(start.split("T")[1].substring(0, 4))

      if typeof end is "string" and end.indexOf("T") > -1
        event.end = parseInt(end.split("T")[1].substring(0,4))

    processEvents: (events) ->
      @events = events.sort (a,b) ->
        a.start - b.start

      columnsY = [{top: 0, bottom: 0}]
      for event, index in @events
        @normalizeTime event

        start  = Math.floor(event.start / 100) + ((event.start%100) / 60)
        end    = Math.floor(event.end / 100) + ((event.end%100) / 60)
        top    = @interval * (start - @opts.startHour) - 20
        height = @interval * (end - start)
        bottom = top + height

        $.extend event, {top, bottom, height, width: 0, conflict: 1}

        length      = columnsY.length
        currentColY = {top, bottom, index}

        for columnY, i in columnsY
          # when there is an available slot
          if top >= columnY.bottom
            columnsY[i]   = currentColY
            event.column ?= i
            event.width++

          # if there is conflict and width is already set
          else if event.width > 0
            event.conflict = length
            break

          # when it's last column and there is conflict
          else
            event.conflict++
            @events[columnY.index].conflict++

            if length-1 is i
              event.column = columnsY.push(currentColY) - 1
              event.width++

    ###
    @name populateHours
    @type function
    @description
    Create the side hour section
    @param {DOM element} element Element to populate hour labels
    ###
    populateHours: (element) ->
      for hour in [@opts.startHour..@opts.endHour-1]
        period = if hour < 12 then "AM" else "PM"
        time   = if hour%12 then hour%12 else 12
        $(@template.hour).text("#{time} #{period}")
          .css
            top: (hour-@opts.startHour) * @interval
          .appendTo element

    ###
    @name populateEvents
    @type function
    @description
    Create and position all event boxes
    @param {DOM element} element Element to populate event boxes
    ###
    populateEvents: (element) ->
      for event in @events
        width    = (event.width/event.conflict) * 100
        eventEle = $(@template.event)
          .text("Event #{event.id}")
          .css
            top:    event.top
            height: event.height
            width:  "#{width}%"
            left:   "#{width * event.column}%"
          .appendTo element

    ###
    @name setCurrentTime
    @type function
    @description
    Update the position of the current time line
    @param {DOM element} element Current time line
    ###
    setCurrentTime: (element) ->
      interval = 60/@interval * 1000
      (updatePosition = =>
        now = new Date()
        top = @interval * (now.getHours() - @opts.startHour + now.getMinutes()/60)
        element.css {top})()
      setInterval updatePosition, interval

  $.fn.extend calendar: (options, args...) ->
    this.each ->
      $this = $(this)
      data  = $this.data "calendar"

      unless data
        $this.data "calendar", (data = new Calendar(this, options))

      if typeof option == "string"
        data[option].apply data, args
)(window, jQuery)