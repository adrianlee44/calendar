class Calendar
  defaults:
    events: []
    height: 800
    width:  600

  template:
    calendar: """<div class="time"></div><div class="events"></div>"""
    hour:     """<div class="time-label"/>"""
    event:    """<div class="event" />"""

  constructor: (el, options) ->
    @opts    = $.extend {}, @defaults, options
    @$el     = $(el)

    # Replace content with template
    @$el.html @template.calendar

    @hourSection   = @$el.find ".time"
    @eventsSection = @$el.find ".events"

    @events = @opts.events.sort (a,b) ->
      a.start - b.start

    @startHour = 24
    @endHour   = 0
    for event in @events
      if (start = Math.floor(event.start / 100)) < @startHour
        @startHour = start
      if (end = Math.floor(event.end / 100)) > @endHour
        @endHour = end
    @interval  = @opts.height / (@endHour - @startHour)

    @processEvents()

    @populateHours()
    @populateEvents()

  processEvents: ->
    columnsY = [{top: 0, bottom: 0}]
    for event, index in @events
      start  = Math.floor(event.start / 100) + ((event.start%100) / 60)
      end    = Math.floor(event.end / 100) + ((event.end%100) / 60)
      top    = @interval * (start - @startHour) - 20
      height = @interval * (end - start)
      bottom = top + height

      $.extend event, {top, bottom, height, width: 0, conflict: 1}

      length      = columnsY.length
      currentColY = {top, bottom, index}

      for columnY, i in columnsY
        # when there is an available slot
        if top >= columnY.bottom
          columnsY[i]  = currentColY
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

  populateHours: ->
    for hour in [@startHour..@endHour]
      time   = if hour is 12 then hour else hour%12
      period = if hour < 12 then "AM" else "PM"
      $(@template.hour).text("#{time} #{period}")
        .css
          top: (hour-@startHour) * @interval
        .appendTo @hourSection

  populateEvents: ->
    for event in @events
      width    = (event.width/event.conflict) * 100
      eventEle = $(@template.event)
        .text("Event #{event.id}")
        .css
          top:    event.top
          height: event.height
          width:  "#{width}%"
          left:   "#{width * event.column}%"
        .appendTo @eventsSection

$.fn.extend calendar: (options, args...) ->
  this.each ->
    $this = $(this)
    data  = $this.data "calendar"

    unless data
      $this.data "calendar", (data = new Calendar(this, options))

    if typeof option == "string"
      data[option].apply data, argsW