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

function extractYouTubeId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }

    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

function getEmbedUrl(url) {
  const videoId = extractYouTubeId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

function getVideos() {
  return JSON.parse(localStorage.getItem("savedVideos") || "[]");
}

function setVideos(videos) {
  localStorage.setItem("savedVideos", JSON.stringify(videos));
}

function showStatus(message) {
  document.getElementById("status").textContent = message;
}

function playVideo(url) {
  const embedUrl = getEmbedUrl(url);
  const playerArea = document.getElementById("playerArea");

  if (!embedUrl) {
    playerArea.innerHTML = "<p>That is not a valid YouTube link.</p>";
    return;
  }

  playerArea.innerHTML = `
    <div class="video-frame">
      <iframe
        src="${embedUrl}"
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>
  `;
}

function loadVideos() {
  const videoList = document.getElementById("videoList");
  const videos = getVideos();

  videoList.innerHTML = "";

  if (videos.length === 0) {
    videoList.innerHTML = "<p>No saved videos yet.</p>";
    return;
  }

  videos.forEach((url, index) => {
    const item = document.createElement("div");
    item.className = "video-item";
    item.innerHTML = `
      <p>Saved video ${index + 1}</p>
      <div class="video-actions">
        <button data-action="play" data-index="${index}">Watch</button>
        <button data-action="delete" data-index="${index}">Delete</button>
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

  if (!getEmbedUrl(url)) {
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
loadVideos();
showStatus("Ready.");
