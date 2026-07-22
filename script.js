function updateDateTime() {
  const now = new Date();

  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  };

  document.getElementById("date").textContent =
    now.toLocaleDateString("en-US", dateOptions);

  document.getElementById("time").textContent =
    now.toLocaleTimeString("en-US", timeOptions);
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
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
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
  const videos = JSON.parse(localStorage.getItem("savedVideos")) || [];

  videoList.innerHTML = "";

  if (videos.length === 0) {
    videoList.innerHTML = "<p>No saved videos yet.</p>";
    return;
  }

  videos.forEach((url, index) => {
    const div = document.createElement("div");
    div.className = "video-item";
    div.innerHTML = `
      <p>YouTube Video ${index + 1}</p>
      <div class="video-actions">
        <button data-action="play" data-index="${index}">Watch</button>
        <button data-action="delete" data-index="${index}">Delete</button>
      </div>
    `;
    videoList.appendChild(div);
  });

  videoList.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      const action = btn.dataset.action;
      const videos = JSON.parse(localStorage.getItem("savedVideos")) || [];

      if (action === "play") {
        playVideo(videos[index]);
      } else if (action === "delete") {
        videos.splice(index, 1);
        localStorage.setItem("savedVideos", JSON.stringify(videos));
        loadVideos();
      }
    });
  });
}

function saveVideo() {
  const input = document.getElementById("videoUrl");
  const url = input.value.trim();

  if (!url) {
    alert("Paste a YouTube link first.");
    return;
  }

  if (!getEmbedUrl(url)) {
    alert("That doesn't look like a valid YouTube link.");
    return;
  }

  const videos = JSON.parse(localStorage.getItem("savedVideos")) || [];
  videos.push(url);
  localStorage.setItem("savedVideos", JSON.stringify(videos));

  input.value = "";
  loadVideos();
}

document.getElementById("saveBtn").addEventListener("click", saveVideo);
loadVideos();
