const STORAGE_KEY = "tmc_camera_data_v2";

const DEFAULT_CAMERAS = [
  { lokasi: "Semarang", video: "TMC", recorder: "10.101.2.4", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Salatiga", video: "TMC", recorder: "10.101.2.20", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Karanganyar", video: "TMC", recorder: "10.101.2.36", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Sragen", video: "TMC", recorder: "10.101.2.52", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Ngawi", video: "TMC", recorder: "10.101.2.68", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Madiun", video: "TMC", recorder: "10.101.2.84", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Nganjuk", video: "TMC", recorder: "10.101.2.100", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Jombang", video: "TMC", recorder: "10.101.2.116", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Mojokerto Kota", video: "TMC", recorder: "10.101.2.132", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Sidoarjo Kota", video: "TMC", recorder: "10.101.2.148", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Pasuruan Kota", video: "TMC", recorder: "10.101.2.164", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Probolinggo Kota", video: "TMC", recorder: "10.101.2.180", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Banyuwangi", video: "TMC", recorder: "10.101.2.196", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Jembrana", video: "TMC", recorder: "10.101.2.212", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Tabanan", video: "TMC", recorder: "10.101.2.228", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Badung", video: "TMC", recorder: "10.101.2.244", username: "admin", password: "ksa.2019!", status: "Online" },
  { lokasi: "Polres Denpasar", video: "TMC", recorder: "10.101.3.4", username: "admin", password: "ksa.2019!", status: "Online" },
];

const form = document.getElementById("cameraForm");
const cameraBody = document.getElementById("cameraBody");
const table = document.getElementById("cameraTable");
const emptyState = document.getElementById("emptyState");

function initializeData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CAMERAS));
  }
}

function loadCameras() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCameras(cameras) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cameras));
}

function renderTable() {
  const cameras = loadCameras();
  cameraBody.innerHTML = "";

  if (cameras.length === 0) {
    table.hidden = true;
    emptyState.hidden = false;
    return;
  }

  cameras.forEach((camera, index) => {
    const row = document.createElement("tr");
    const statusClass = camera.status === "Online" ? "status-online" : "status-offline";

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${camera.lokasi}</td>
      <td>${camera.video}</td>
      <td class="mono">${camera.recorder}</td>
      <td>${camera.username}</td>
      <td class="mono">${camera.password}</td>
      <td><span class="status ${statusClass}">${camera.status}</span></td>
      <td>
        <button type="button" class="action-btn" data-index="${index}">Hapus</button>
      </td>
    `;

    cameraBody.appendChild(row);
  });

  table.hidden = false;
  emptyState.hidden = true;
}

function addCamera(camera) {
  const cameras = loadCameras();
  cameras.push(camera);
  saveCameras(cameras);
  renderTable();
}

function deleteCamera(index) {
  const cameras = loadCameras();
  cameras.splice(index, 1);
  saveCameras(cameras);
  renderTable();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  addCamera({
    lokasi: document.getElementById("cameraLocation").value.trim(),
    video: document.getElementById("cameraVideo").value.trim(),
    recorder: document.getElementById("cameraRecorder").value.trim(),
    username: document.getElementById("cameraUser").value.trim(),
    password: document.getElementById("cameraPass").value.trim(),
    status: document.getElementById("cameraStatus").value,
  });

  form.reset();
  document.getElementById("cameraVideo").value = "TMC";
  document.getElementById("cameraStatus").value = "Online";
});

cameraBody.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const index = Number(target.dataset.index);
  if (Number.isNaN(index)) return;

  deleteCamera(index);
});

initializeData();
renderTable();
