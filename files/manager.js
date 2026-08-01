const MANAGER_PASSWORD = "1960";
const DAILY_LIMIT_MINUTES = 60;

function checkPassword() {
  const pwd = document.getElementById("pwd").value;
  const error = document.getElementById("error");

  if (pwd === MANAGER_PASSWORD) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    error.textContent = "";
    loadBackupStatus();
    loadStaffList();
    loadOverLimitList();
    loadBreaks();
  } else {
    error.textContent = "Incorrect password";
  }
}

// Allow pressing Enter to log in
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("pwd").addEventListener("keydown", function (e) {
    if (e.key === "Enter") checkPassword();
  });
});

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Total break minutes today, per employee. Breaks still in progress
// count using elapsed time so far.
function getTodayTotalsByEmployee() {
  const breaks = JSON.parse(localStorage.getItem("breaks")) || [];
  const today = new Date();
  const totals = {};

  breaks.forEach(function (b) {
    const start = new Date(b.start);
    if (!isSameDay(start, today)) return;

    const end = b.end ? new Date(b.end) : new Date();
    const mins = Math.round((end - start) / 60000);
    totals[b.employee] = (totals[b.employee] || 0) + mins;
  });

  return totals;
}

function getOverLimitEmployees() {
  const totals = getTodayTotalsByEmployee();
  return Object.keys(totals)
    .filter(function (name) {
      return totals[name] > DAILY_LIMIT_MINUTES;
    })
    .map(function (name) {
      return { name: name, minutes: totals[name] };
    })
    .sort(function (a, b) {
      return b.minutes - a.minutes;
    });
}

function loadOverLimitList() {
  const listEl = document.getElementById("overLimitList");
  const overLimit = getOverLimitEmployees();

  if (overLimit.length === 0) {
    listEl.innerHTML = '<p class="empty-note">Nobody over the 1-hour limit today.</p>';
    return;
  }

  listEl.innerHTML = "";
  overLimit.forEach(function (item) {
    const row = document.createElement("div");
    row.className = "over-limit-row";
    row.textContent = item.name + " — " + item.minutes + " min today";
    listEl.appendChild(row);
  });
}

const BACKUP_REMINDER_DAYS = 365;

function getBackupReferenceDate() {
  let ref = localStorage.getItem("lastBackupDate") || localStorage.getItem("installDate");
  if (!ref) {
    ref = new Date().toISOString();
    localStorage.setItem("installDate", ref);
  }
  return new Date(ref);
}

function loadBackupStatus() {
  const statusEl = document.getElementById("backupStatus");
  const refDate = getBackupReferenceDate();
  const daysSince = Math.floor((Date.now() - refDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = BACKUP_REMINDER_DAYS - daysSince;

  if (daysLeft <= 0) {
    statusEl.textContent = "⚠ Overdue — export a backup and clear old records.";
    statusEl.className = "backup-status overdue";
  } else {
    statusEl.textContent = "Next backup due in " + daysLeft + " days.";
    statusEl.className = "backup-status";
  }
}

function exportAllBreaksCSV() {
  const breaks = JSON.parse(localStorage.getItem("breaks")) || [];
  const today = new Date().toLocaleDateString().replace(/\//g, "-");

  let csv = "Employee,Start,End,Duration (min)\n";
  breaks.forEach(function (b) {
    const start = new Date(b.start);
    const end = b.end ? new Date(b.end) : null;
    const duration = end ? Math.round((end - start) / 60000) : "in progress";

    csv +=
      '"' + b.employee + '",' +
      start.toLocaleString() + "," +
      (end ? end.toLocaleString() : "-") + "," +
      duration + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "breakclock-full-backup-" + today + ".csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function markBackupDone() {
  if (confirm("Confirm you've saved the exported backup somewhere safe. This resets the 1-year reminder.")) {
    localStorage.setItem("lastBackupDate", new Date().toISOString());
    loadBackupStatus();
  }
}

function loadStaffList() {
  const listEl = document.getElementById("staffList");
  listEl.innerHTML = "";
  const employees = getEmployees();

  employees.forEach(function (name) {
    const row = document.createElement("div");
    row.className = "staff-row";

    const label = document.createElement("span");
    label.textContent = name;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.className = "remove-btn";
    removeBtn.onclick = function () {
      handleRemoveEmployee(name);
    };

    row.appendChild(label);
    row.appendChild(removeBtn);
    listEl.appendChild(row);
  });
}

function handleAddEmployee() {
  const input = document.getElementById("newEmployeeName");
  const name = input.value.trim();
  if (!name) return;

  addEmployee(name);
  input.value = "";
  loadStaffList();
}

function handleRemoveEmployee(name) {
  if (confirm('Remove "' + name + '" from the staff list? Their break history will be kept.')) {
    removeEmployee(name);
    loadStaffList();
  }
}

function loadBreaks() {
  const breaks = JSON.parse(localStorage.getItem("breaks")) || [];
  const tbody = document.getElementById("breaksBody");
  tbody.innerHTML = "";

  const overLimitNames = getOverLimitEmployees().map(function (item) {
    return item.name;
  });

  breaks.slice().reverse().forEach(function (b) {
    const row = document.createElement("tr");
    const start = new Date(b.start);
    const end = b.end ? new Date(b.end) : null;

    if (overLimitNames.includes(b.employee) && isSameDay(start, new Date())) {
      row.className = "over-limit";
    }

    let duration = "In progress";
    if (end) {
      const mins = Math.round((end - start) / 60000);
      duration = mins + " min";
    }

    const cells = [
      b.employee,
      start.toLocaleString(),
      end ? end.toLocaleString() : "-",
      duration
    ];

    cells.forEach(function (text) {
      const td = document.createElement("td");
      td.textContent = text;
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });
}

function clearRecords() {
  if (confirm("Are you sure you want to clear all break records? This cannot be undone.")) {
    localStorage.removeItem("breaks");
    loadOverLimitList();
    loadBreaks();
  }
}

function printOverLimitList() {
  const overLimit = getOverLimitEmployees();
  const printArea = document.getElementById("printArea");
  const today = new Date().toLocaleDateString();

  let html = "<h2>Break Limit Report — " + today + "</h2>";
  html += "<p>Staff over the " + DAILY_LIMIT_MINUTES + "-minute daily break limit</p>";

  if (overLimit.length === 0) {
    html += "<p>Nobody over the daily limit today.</p>";
  } else {
    html += "<table><thead><tr><th>Employee</th><th>Minutes Today</th></tr></thead><tbody>";
    overLimit.forEach(function (item) {
      html += "<tr><td>" + item.name + "</td><td>" + item.minutes + "</td></tr>";
    });
    html += "</tbody></table>";
  }

  printArea.innerHTML = html;
  window.print();
}

function exportOverLimitCSV() {
  const overLimit = getOverLimitEmployees();
  const today = new Date().toLocaleDateString().replace(/\//g, "-");

  let csv = "Employee,Minutes Today,Date\n";
  overLimit.forEach(function (item) {
    csv += '"' + item.name + '",' + item.minutes + "," + today + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "over-limit-" + today + ".csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function goHome() {
  window.location = "index.html";
}
