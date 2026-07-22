const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const navItems = document.querySelectorAll(".nav-item");
const shortcutButtons = document.querySelectorAll(".shortcut-btn");

const panels = {
  home: document.getElementById("home-panel"),
  dashboard: document.getElementById("dashboard-panel"),
  talk: document.getElementById("talk-panel"),
  shortcuts: document.getElementById("shortcuts-panel"),
  media: document.getElementById("media-panel"),
  tube: document.getElementById("tube-panel"),
  today: document.getElementById("today-panel"),
  calendar: document.getElementById("calendar-panel"),
  settings: document.getElementById("settings-panel"),
  customization: document.getElementById("customization-panel"),
};

function showPanel(name) {
  Object.values(panels).forEach((panel) => panel && panel.classList.remove("active"));
  if (panels[name]) panels[name].classList.add("active");

  navItems.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.panel === name);
  });
}

navItems.forEach((btn) => {
  btn.addEventListener("click", () => {
    showPanel(btn.dataset.panel);
  });
});

shortcutButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const panel = btn.dataset.panel;
    if (panel) showPanel(panel);
  });
});

if (sidebarToggle) {
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    sidebarToggle.textContent = sidebar.classList.contains("collapsed") ? "⟩" : "⟨";
  });
}

// Date and time
function updateDateTime() {
  const now = new Date();

  const dateEl = document.getElementById("date");
  const timeEl = document.getElementById("time");

  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
}

updateDateTime();
setInterval(updateDateTime, 1000);

// Day / night mode
function getModeByHour(hour) {
  if (hour >= 6 && hour < 11) return "morning";
  if (hour >= 11 && hour < 18) return "day";
  return "night";
}

function applyTimeMode() {
  const now = new Date();
  const mode = getModeByHour(now.getHours());

  document.body.classList.remove("theme-morning", "theme-day", "theme-night");
  document.body.classList.add(`theme-${mode}`);

  const modeText = document.getElementById("modeText");
  const modeIcon = document.getElementById("modeIcon");
  const dashboardMode = document.getElementById("dashboardMode");
  const todayMode = document.getElementById("todayMode");
  const settingsMode = document.getElementById("settingsMode");

  let label = "Day Mode";
  let icon = "◐";

  if (mode === "morning") {
    label = "Morning Mode";
    icon = "☀";
  } else if (mode === "day") {
    label = "Day Mode";
    icon = "◐";
  } else {
    label = "Night Mode";
    icon = "☾";
  }

  if (modeText) modeText.textContent = label;
  if (modeIcon) modeIcon.textContent = icon;
  if (dashboardMode) dashboardMode.textContent = "Auto";
  if (todayMode) todayMode.textContent = "Auto";
  if (settingsMode) settingsMode.textContent = "Auto";
}

applyTimeMode();
setInterval(applyTimeMode, 60000);

// YouTube vault
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

function showStatus(message) {
  const status = document.getElementById("status");
  if (status) status.textContent = message;
}

function renderPlayer(embedUrl, label = "Playing now") {
  const playerArea = document.getElementById("playerArea");
  if (!playerArea) return;

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

  const videoCount = document.getElementById("videoCount");
  if (videoCount) videoCount.textContent = String(videos.length);

  if (!videoList) return;
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
        <button class="neo-btn" data-action="play" data-index="${index}" type="button">Watch</button>
        <button class="neo-btn" data-action="delete" data-index="${index}" type="button">Delete</button>
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
        showPanel("tube");
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
  if (!input) return;

  const url = input.value.trim();

  if (!url) {
    showStatus("Paste a YouTube link first.");
    return;
  }

  if (!normalizeYouTubeUrl(url)) {
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

const saveBtn = document.getElementById("saveBtn");
if (saveBtn) saveBtn.addEventListener("click", saveVideo);

const videoUrl = document.getElementById("videoUrl");
if (videoUrl) {
  videoUrl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveVideo();
  });
}

loadVideos();

// Calendar
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

function monthName(monthIndex, year) {
  return new Date(year, monthIndex, 1).toLocaleDateString("en-US", { month: "long" });
}

function dateKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function renderTodayPanel() {
  const todayEventsEl = document.getElementById("todayEvents");
  const todayCountEl = document.getElementById("todayCount");
  if (!todayEventsEl || !todayCountEl) return;

  const today = dateKey(new Date());
  const events = getEvents()
    .filter((ev) => ev.date === today)
    .sort((a, b) => {
      const aTime = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
      const bTime = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
      return aTime - bTime;
    });

  todayCountEl.textContent = String(events.length);
  todayEventsEl.innerHTML = "";

  if (events.length === 0) {
    todayEventsEl.innerHTML = `<div class="empty-state">No events today.</div>`;
    return;
  }

  events.forEach((ev) => {
    const item = document.createElement("div");
    item.className = "event-item";
    item.innerHTML = `
      <p class="event-title">${ev.title}</p>
      <div>${ev.time ? ev.time : "All day"}</div>
      <div>Reminder: ${ev.reminderMinutes} min before</div>
    `;
    todayEventsEl.appendChild(item);
  });
}

function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  const monthLabel = document.getElementById("monthLabel");
  const events = getEvents();

  const eventCountEl = document.getElementById("eventCount");
  if (eventCountEl) eventCountEl.textContent = String(events.length);

  if (!grid || !monthLabel) return;

  const firstDay = new Date(currentYear, currentMonth, 1);
  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  monthLabel.textContent = `${monthName(currentMonth, currentYear)} ${currentYear}`;
  grid.innerHTML = "";

  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((name) => {
    const el = document.createElement("div");
    el.className = "day-name";
    el.textContent = name;
    grid.appendChild(el);
  });

  const totalCells = 42;
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
      ${
        eventCount > 0
          ? `<div>${Array.from({ length: eventCount }).map(() => '<span class="day-event-dot"></span>').join("")}</div>`
          : ""
      }
    `;

    grid.appendChild(cell);
  }

  renderEventsList();
  renderTodayPanel();
}

function renderEventsList() {
  const list = document.getElementById("eventsList");
  const events = getEvents().sort((a, b) => {
    const aTime = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
    const bTime = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
    return aTime - bTime;
  });

  if (!list) return;
  list.innerHTML = "";

  if (events.length === 0) {
    list.innerHTML = `<div class="empty-state">No saved events yet.</div>`;
    return;
  }

  events.forEach((ev, index) => {
    const item = document.createElement("div");
    item.className = "event-item";
    item.innerHTML = `
      <p class="event-title">${ev.title}</p>
      <div>${ev.date}${ev.time ? ` at ${ev.time}` : ""}</div>
      <div>Reminder: ${ev.reminderMinutes} min before</div>
      <div class="video-actions" style="margin-top:10px;">
        <button class="neo-btn" data-delete-event="${index}" type="button">Delete</button>
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
    });
  });
}

function addEvent() {
  const title = document.getElementById("eventTitle")?.value.trim();
  const date = document.getElementById("eventDate")?.value;
  const time = document.getElementById("eventTime")?.value;
  const reminderMinutes = Number(document.getElementById("reminderMinutes")?.value || 0);

  if (!title || !date) return;

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
}

const addEventBtn = document.getElementById("addEventBtn");
if (addEventBtn) addEventBtn.addEventListener("click", addEvent);

const prevMonth = document.getElementById("prevMonth");
if (prevMonth) {
  prevMonth.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });
}

const nextMonth = document.getElementById("nextMonth");
if (nextMonth) {
  nextMonth.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });
}

renderCalendar();
showPanel("home");
