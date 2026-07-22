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

    // youtu.be/VIDEO_ID
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }

    // youtube.com/watch?v=VIDEO_ID
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

function loadVideos() {
  const videoList = document.getElementById("videoList");
  const videos = JSON.parse(localStorage.getItem("savedVideos")) || [];

  videoList.innerHTML = "";

  if (videos.length === 0) {
    videoList.innerHTML = "<p>No saved videos yet.</p>";
    return;
  }

  videos.forEach((url, index) => {
    const embedUrl = getEmbedUrl(url);

    const div = document.createElement("div");
    div.className = "video-item";

    if (!embedUrl) {
      div.innerHTML = `
        <p>Invalid YouTube link</p>
        <button onclick="deleteVideo(${index})">Delete</button>
      `;
    } else {
      div.innerHTML = `
        <div class="video-frame">
          <iframe
            src="${embedUrl}"
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
        <div class="video-actions">
          <button onclick="deleteVideo(${index})">Delete</button>
        </div>
      `;
    }

    videoList.appendChild(div);
  });
}

function saveVideo() {
  const input = document.getElementById("videoUrl");
  const url = input.value.trim();

  if (!url) {
    alert("Paste a YouTube link first.");
    return;
  }

  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) {
    alert("That doesn't look like a valid YouTube link.");
    return;
  }

  const videos = JSON.parse(localStorage.getItem("savedVideos")) || [];
  videos.push(url);
  localStorage.setItem("savedVideos", JSON.stringify(videos));

  input.value = "";
  loadVideos();
}

function deleteVideo(index) {
  const videos = JSON.parse(localStorage.getItem("savedVideos")) || [];
  videos.splice(index, 1);
  localStorage.setItem("savedVideos", JSON.stringify(videos));
  loadVideos();
}

document.getElementById("saveBtn").addEventListener("click", saveVideo);
loadVideos();
.video-frame {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  margin-bottom: 10px;
}

.video-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 8px;
}
