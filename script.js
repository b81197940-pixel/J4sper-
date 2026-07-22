// Date/time
function updateDateTime() {
  const now = new Date();

  document.getElementById("date").textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  document.getElementById("time").textContent = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

updateDateTime();
setInterval(updateDateTime, 1000);

// ---------- YouTube ----------
function getVideos() {
  try {
    return JSON.parse(localStorage.getItem("savedVideos") || "[]");
  } catch {
    return [];
  }
}

function setVideos(videos) {
  localStorage.setItem("savedVideos", JSON.stringify(videos));
}

function showStatus(message) {
  document.getElementById("status").textContent = message;
}

function normalizeYouTubeUrl(input) {
  try {
    const url = new URL(input.trim());

    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;

      const pathParts = url.pathname.split("/").filter(Boolean);
      if (pathParts[0] === "shorts" && pathParts[1]) {
        return `https://www.youtube-nocookie.com/embed/${pathParts[1]}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function renderPlayer(embedUrl, label = "Playing now") {
  const playerArea = document.getElementById("playerArea");
  playerArea.innerHTML = `
    <div class="video-item">
      <p class="video-item-title">${label}</p>
      <div class="video-frame">
        <iframe
          src="${embedUrl}"
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
    </div>
  `;
}

function playVideo(url) {
  const embedUrl = normalizeYouTubeUrl(url);
  if (!embedUrl) {
    showStatus("That does not look like a valid YouTube link.");
    return;
  }

  renderPlayer(embedUrl);
  showStatus("Video loaded.");
}

function loadVideos() {
  const videoList = document.getElementById("videoList");
  const videos = getVideos();

  videoList.innerHTML = "";

  if (videos.length === 0) {
    videoList.innerHTML = `<div class="empty-state">No saved videos yet.</div>`;
    return;
  }

  videos.forEach((url, index) => {
    const item = document.createElement("div");
    item.className = "video-item";

    item.innerHTML = `
      <p class="video-item-title">${url}</p>
      <div class="video-actions">
        <button class="neo-btn" data-action="play" data-index="${index}">Watch</button>
        <button class="neo-btn" data-action="delete" data-index="${index}">Delete</button>
      </div>
    `;

    videoList.appendChild(item);
  });

  videoList.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      const action = btn.dataset.action;
      const videos = getVideos();

      if (action === "play") {
        playVideo(videos[index]);
      }

      if (action === "delete") {
        videos.splice(index, 1);
        setVideos(videos);
        loadVideos();
        showStatus("Video deleted.");
      }
    });
  });
}

function saveVideo() {
  const input = document.getElementById("videoUrl");
  const url = input.value.trim();

  if (!url) {
    showStatus("Paste a YouTube link first.");
    return;
  }

  const embedUrl = normalizeYouTubeUrl(url);
  if (!embedUrl) {
    showStatus("That does not look like a valid YouTube link.");
    return;
  }

  const videos = getVideos();
  videos.push(url);
  setVideos(videos);

  input.value = "";
  loadVideos();
  showStatus("Video saved.");
}

document.getElementById("saveBtn").addEventListener("click", saveVideo);
document.getElementById("videoUrl").addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveVideo();
});

loadVideos();
showStatus("Ready.");

// ---------- Calendar ----------
function getEvents() {
  try {
    return JSON.parse(localStorage.getItem("savedEvents") || "[]");
  } catch {
    return [];
  }
}

function setEvents(events) {
  localStorage.setItem("savedEvents", JSON.stringify(events));
}

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function monthName(monthIndex) {
  return new Date(currentYear, monthIndex, 1).toLocaleDateString("en-US", {
    month: "long"
  });
}

function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  const monthLabel = document.getElementById("monthLabel");
  const events = getEvents();

  const firstDay = new Date(currentYear, currentMonth, 1);
  const startDay = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  monthLabel.textContent = `${monthName(currentMonth)} ${currentYear}`;
  grid.innerHTML = "";

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  dayNames.forEach((name) => {
    const el = document.createElement("div");
    el.className = "day-name";
    el.textContent = name;
    grid.appendChild(el);
  });

  const totalCells = 42; // 6 weeks
  const today = new Date();

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "day-cell";

    let dayNumber;
    let cellMonth = currentMonth;
    let cellYear = currentYear;
    let otherMonth = false;

    if (i < startDay) {
      dayNumber = daysInPrevMonth - startDay + i + 1;
      cellMonth = currentMonth - 1;
      if (cellMonth < 0) {
        cellMonth = 11;
        cellYear = currentYear - 1;
      }
      otherMonth = true;
    } else if (i >= startDay + daysInMonth) {
      dayNumber = i - (startDay + daysInMonth) + 1;
      cellMonth = currentMonth + 1;
      if (cellMonth > 11) {
        cellMonth = 0;
        cellYear = currentYear + 1;
      }
      otherMonth = true;
    } else {
      dayNumber = i - startDay + 1;
    }

    const eventCount = events.filter((ev) => {
      const d = new Date(ev.date + "T00:00:00");
      return (
        d.getDate() === dayNumber &&
        d.getMonth() === cellMonth &&
        d.getFullYear() === cellYear
      );
    }).length;

    const isToday =
      !otherMonth &&
      dayNumber === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();

    if (otherMonth) cell.classList.add("other-month");
    if (isToday) cell.classList.add("today");

    cell.innerHTML = `
      <div class="day-number">${dayNumber}</div>
      ${eventCount > 0 ? `<div>${Array.from({ length: eventCount }).map(() => '<span class="day-event-dot"></span>').join("")}</div>` : ""}
    `;

    grid.appendChild(cell);
  }

  renderEventsList();
}

function renderEventsList() {
  const list = document.getElementById("eventsList");
  const events = getEvents().sort((a, b) => {
    const aTime = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
    const bTime = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
    return aTime - bTime;
  });

  list.innerHTML = "";

  if (events.length === 0) {
    list.innerHTML = `<div class="empty-state">No saved events yet.</div>`;
    return;
  }

  events.forEach((ev, index) => {
    const item = document.createElement("div");
    item.className = "event-item";
    item.innerHTML = `
      <div class="event-title">${ev.title}</div>
      <div>${ev.date}${ev.time ? ` at ${ev.time}` : ""}</div>
      <div>Reminder: ${ev.reminderMinutes} min before</div>
      <div class="video-actions" style="margin-top:10px;">
        <button class="neo-btn" data-delete-event="${index}">Delete</button>
      </div>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll("button[data-delete-event]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.deleteEvent);
      const events = getEvents().sort((a, b) => {
        const aTime = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
        const bTime = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
        return aTime - bTime;
      });

      events.splice(index, 1);
      setEvents(events);
      renderCalendar();
      showStatus("Event deleted.");
    });
  });
}

function addEvent() {
  const title = document.getElementById("eventTitle").value.trim();
  const date = document.getElementById("eventDate").value;
  const time = document.getElementById("eventTime").value;
  const reminderMinutes = Number(document.getElementById("reminderMinutes").value || 0);

  if (!title || !date) {
    showStatus("Enter a title and date first.");
    return;
  }

  const events = getEvents();
  events.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title,
    date,
    time,
    reminderMinutes
  });

  setEvents(events);

  document.getElementById("eventTitle").value = "";
  document.getElementById("eventDate").value = "";
  document.getElementById("eventTime").value = "";
  document.getElementById("reminderMinutes").value = "10";

  renderCalendar();
  showStatus("Event saved.");
}

document.getElementById("addEventBtn").addEventListener("click", addEvent);

document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

// reminders while the page is open
let alertedEvents = new Set();

function checkReminders() {
  const events = getEvents();
  const now = new Date();

  events.forEach((ev) => {
    const eventTime = new Date(`${ev.date}T${ev.time || "09:00"}`);
    const reminderTime = new Date(eventTime.getTime() - ev.reminderMinutes * 60000);

    const key = `${ev.title}-${ev.date}-${ev.time}-${ev.reminderMinutes}`;

    if (now >= reminderTime && now < eventTime && !alertedEvents.has(key)) {
      alertedEvents.add(key);
      alert(`Reminder: ${ev.title} is coming up soon.`);
    }
  });
}

renderCalendar();
setInterval(checkReminders, 30000);
checkReminders();
