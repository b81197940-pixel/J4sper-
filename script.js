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

function getYouTubeTitle(url) {
  return url;
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
      <p>${getYouTubeTitle(url)}</p>
      <a href="${url}" target="_blank">Watch</a>
      <button onclick="deleteVideo(${index})">Delete</button>
    `;
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
