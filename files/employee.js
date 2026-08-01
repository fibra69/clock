const employee = localStorage.getItem("employee");

// If nobody was selected (e.g. page opened directly), send back home
if (!employee) {
  window.location = "index.html";
}

document.getElementById("name").textContent = employee;

const startBtn = document.getElementById("startBtn");
const returnBtn = document.getElementById("returnBtn");
const homeBtn = document.getElementById("homeBtn");
const message = document.getElementById("message");

function getBreaks() {
  return JSON.parse(localStorage.getItem("breaks")) || [];
}

function saveBreaks(breaks) {
  localStorage.setItem("breaks", JSON.stringify(breaks));
}

// Finds this employee's most recent break entry, if any
function findOpenBreak(breaks) {
  for (let i = breaks.length - 1; i >= 0; i--) {
    if (breaks[i].employee === employee) {
      return breaks[i].end === null ? breaks[i] : null;
    }
  }
  return null;
}

function goHome() {
  window.location = "index.html";
}

function updateUI() {
  const breaks = getBreaks();
  const openBreak = findOpenBreak(breaks);

  if (openBreak) {
    // Employee is currently on break: only show the return button
    startBtn.style.display = "none";
    returnBtn.style.display = "block";
    message.textContent = "On break since " + new Date(openBreak.start).toLocaleTimeString();
  } else {
    // Employee is at work: only show the start button
    startBtn.style.display = "block";
    returnBtn.style.display = "none";
    message.textContent = "Ready";
  }
}

startBtn.onclick = function () {
  const breaks = getBreaks();
  breaks.push({
    employee: employee,
    start: new Date().toISOString(),
    end: null
  });
  saveBreaks(breaks);

  startBtn.style.display = "none";
  returnBtn.style.display = "none";
  homeBtn.style.display = "none";
  message.textContent = "Break started. Returning to main screen...";

  setTimeout(goHome, 3000);
};

returnBtn.onclick = function () {
  const breaks = getBreaks();
  const openBreak = findOpenBreak(breaks);

  if (openBreak) {
    openBreak.end = new Date().toISOString();
    saveBreaks(breaks);
  }

  startBtn.style.display = "none";
  returnBtn.style.display = "none";
  homeBtn.style.display = "none";
  message.textContent = "Welcome back! Returning to main screen...";

  setTimeout(goHome, 3000);
};

updateUI();
