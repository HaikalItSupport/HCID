const STORAGE_KEY = "camera_data_v1";

const form = document.getElementById("cameraForm");
const cameraBody = document.getElementById("cameraBody");
const table = document.getElementById("cameraTable");
const emptyState = document.getElementById("emptyState");

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

function maskPassword(password) {
  return "*".repeat(Math.max(password.length, 6));
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

    row.innerHTML = `
      <td>${camera.name}</td>
      <td class="mono">${camera.ip}</td>
      <td>${camera.username}</td>
      <td class="mono">${maskPassword(camera.password)}</td>
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
    name: document.getElementById("cameraName").value.trim(),
    ip: document.getElementById("cameraIp").value.trim(),
    username: document.getElementById("cameraUser").value.trim(),
    password: document.getElementById("cameraPass").value,
  });

  form.reset();
});

cameraBody.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const index = Number(target.dataset.index);
  if (Number.isNaN(index)) return;

  deleteCamera(index);
});

renderTable();
