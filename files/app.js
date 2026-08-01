function renderEmployeeList(filterText) {
  const listEl = document.getElementById("employeeList");
  if (!listEl) return;

  listEl.innerHTML = "";
  const filter = (filterText || "").trim().toLowerCase();

  getEmployees().filter(function (name) {
    return name.toLowerCase().includes(filter);
  }).forEach(function (name) {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.className = "employee-btn";
    btn.onclick = function () {
      openEmployee(name);
    };
    listEl.appendChild(btn);
  });
}

function openEmployee(name) {
  localStorage.setItem("employee", name);
  window.location = "employee.html";
}

function openManager() {
  window.location = "manager.html";
}

const BACKUP_REMINDER_DAYS = 365;

// The "clock" for the reminder starts on first-ever use of the app,
// and resets whenever the manager taps "Mark Backup Done".
function getBackupReferenceDate() {
  let ref = localStorage.getItem("lastBackupDate") || localStorage.getItem("installDate");
  if (!ref) {
    ref = new Date().toISOString();
    localStorage.setItem("installDate", ref);
  }
  return new Date(ref);
}

function checkBackupReminder() {
  const banner = document.getElementById("backupReminder");
  if (!banner) return;

  const refDate = getBackupReferenceDate();
  const daysSince = Math.floor((Date.now() - refDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSince >= BACKUP_REMINDER_DAYS) {
    banner.style.display = "block";
  } else {
    banner.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  renderEmployeeList("");
  checkBackupReminder();

  const searchBox = document.getElementById("searchBox");
  if (searchBox) {
    searchBox.addEventListener("input", function () {
      renderEmployeeList(searchBox.value);
    });
  }
});
