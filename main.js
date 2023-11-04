document.addEventListener("DOMContentLoaded", function () {
    var calendarEl = document.getElementById("calendar");
    var popup = document.getElementById("add-new-event-popup-wraper");
    var eventForm = document.getElementById("event-form");
    var calendar;
    var uniqueIdCounter = 1;

    var popupCloseBtn = document.querySelector("#add-new-event-popup-wraper .fa-times");
    popupCloseBtn.addEventListener("click", closePopup);

    var colorIndex = 0;

    function showSuccessPopup() {
        console.log("hola");
    }

    function openPopup(date) {
        popup.style.display = "block";
        eventForm.dataset.date = date;
        updateDropdown(date);
    }

    function closePopup() {
        popup.style.display = "none";
        eventForm.reset();
    }

    function isWithinFirstThreeWeeks(date) {
        var currentDate = new Date(date);
        var firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        var twentyFirstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 21);
        return currentDate >= firstDayOfMonth && currentDate <= twentyFirstDayOfMonth;
    }

    function updateDropdown(date) {
        var timeRangeSelect = document.getElementById("time-range");
        var eventDates = calendar.getEvents().map((event) => event.start);

        timeRangeSelect.querySelectorAll("option").forEach((option) => {
            var startTime = option.value.split("-")[0];
            var endTime = option.value.split("-")[1];

            var eventCount = eventDates.filter((eventDate) => {
                return eventDate.toDateString() === new Date(date).toDateString() && eventDate.getHours() >= parseInt(startTime) && eventDate.getHours() < parseInt(endTime);
            }).length;

            option.disabled = eventCount >= 3 && eventCount <= 3 && parseInt(startTime) === 3;
        });
    }

    function checkTimeRangeConflict(date, startTime, endTime) {
        var selectedStart = new Date(date + "T" + startTime);
        var selectedEnd = new Date(date + "T" + endTime);

        var eventDates = calendar.getEvents().map((event) => {
            var start = event.start;
            var end = event.end || start;
            return { start: start, end: end };
        });

        return eventDates.some((eventDate) => {
            var eventStart = eventDate.start;
            var eventEnd = eventDate.end;
            return selectedStart < eventEnd && selectedEnd > eventStart;
        });
    }

    eventForm.addEventListener("submit", function (e) {
        e.preventDefault();

        var title = document.getElementById("event-title").value;
        var timeRange = document.getElementById("time-range").value;
        var date = eventForm.dataset.date;

        var [startTime, endTime] = timeRange.split("-");

        var start = date + "T" + startTime;
        var end = date + "T" + endTime;

        var uniqueId = uniqueIdCounter++;

        calendar.addEvent({
            title: title,
            start: start,
            end: end,
            uniqueId: uniqueId,
        });

        updateDropdown(date);
        closePopup();

        console.log("Event added with ID:", uniqueId);
        console.log(start);
        console.log(end);
    });

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        },
        events: [
            {
                title: "All Day Event",
                start: "2023-09-08",
            },
            {
                title: "All Day 2",
                start: "2023-09-09",
            },
        ],

        dateClick: function (info) {
            if (isWithinFirstThreeWeeks(info.date)) {
                openPopup(info.dateStr);
                console.log("hi");
            }
        },
        dayCellClassNames: function (arg) {
            var eventDates = calendar.getEvents().map((event) => event.start);
            if (isWithinFirstThreeWeeks(arg.date)) {
                if (eventDates.filter((eventDate) => eventDate.toDateString() === arg.date.toDateString()).length >= 3) {
                    return "fully-booked-day";
                }
                return "available-day";
            }
            return "";
        },
        eventContent: function (arg) {
            var title = arg.event.title;
            var startTime = arg.event.start ? arg.event.start.getHours() + ":" + arg.event.start.getMinutes().toString().padStart(2, "0") : "";
            var endTime = arg.event.end ? arg.event.end.getHours() + ":" + arg.event.end.getMinutes().toString().padStart(2, "0") : "";

            return {
                html: `<div class="event-content">
    <div class="event-title">${title}</div>
    <div class="event-time">${startTime} - ${endTime}</div>
    </div>`,
            };
        },

        eventClick: function (info) {
            if (confirm("Delete this event?")) {
                var deletedUniqueId = info.event.extendedProps.uniqueId; 

                console.log("Event with ID", deletedUniqueId, "is being deleted");
                console.log("Events array before removing:", calendar.getEvents()); 

                info.event.remove();
                updateDropdown(info.event.start);

                console.log("Events array after removing:", calendar.getEvents());
            }
        },
    });

    calendar.render();
});

setInterval(() => {
    document.querySelector(".fc-today-button").innerText = "Hoy";
    document.querySelector(".fc-dayGridMonth-button").innerText = "Mes";
    document.querySelector(".fc-timeGridWeek-button").innerText = "Semana";
    document.querySelector(".fc-timeGridDay-button").innerText = "Día";
    document.querySelector(".fc-listWeek-button").innerText = "Lista";
}, 1000);