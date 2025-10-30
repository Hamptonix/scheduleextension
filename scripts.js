const schedulesBase = {
  1: [
    { name: "Period 1", start: "07:40", end: "08:45" },
    { name: "Period 2", start: "08:47", end: "09:52" },
    { name: "Period 3", start: "09:54", end: "10:59" },
    { name: "LUNCH", start: "11:01", end: "11:21" },
    { name: "Period 5", start: "11:23", end: "12:28" },
    { name: "Period 6", start: "12:30", end: "13:35" },
    { name: "Period 7", start: "13:37", end: "14:42" },
    { name: "Period 8", start: "14:44", end: "15:49" },
  ],
  2: [
    { name: "Period 1", start: "07:40", end: "08:45" },
    { name: "Period 2", start: "08:47", end: "09:52" },
    { name: "Period 3", start: "09:54", end: "10:59" },
    { name: "Period 4", start: "11:01", end: "12:06" },
    { name: "LUNCH", start: "12:08", end: "12:28" },
    { name: "Period 6", start: "12:30", end: "13:35" },
    { name: "Period 7", start: "13:37", end: "14:42" },
    { name: "Period 8", start: "14:44", end: "15:49" },
  ],
};

function addMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m + mins, 0, 0);
  return d.toTimeString().slice(0, 5);
}

function withPassingPeriods(schedule) {
  const result = [];
  for (let i = 0; i < schedule.length; i++) {
    result.push(schedule[i]);
    if (i < schedule.length - 1) {
      result.push({
        name: "Passing Period",
        start: schedule[i].end,
        end: addMinutes(schedule[i].end, 2),
      });
    }
  }
  return result;
}

const schedules = {
  1: withPassingPeriods(schedulesBase[1]),
  2: withPassingPeriods(schedulesBase[2]),
};

function parseTime(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatDuration(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function nextWeekendStart(now) {
  const d = new Date(now);
  const day = d.getDay();
  const daysUntilFriday = (5 - day + 7) % 7;
  d.setDate(d.getDate() + daysUntilFriday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function nextSchoolStart(now) {
  const d = new Date(now);
  let day = d.getDay();
  let addDays = 0;
  if (day === 5) addDays = 3;
  else if (day === 6) addDays = 2;
  else if (day === 0) addDays = 1;
  else addDays = 1;
  d.setDate(d.getDate() + addDays);
  d.setHours(7, 40, 0, 0);
  return d;
}

function updateSchedule() {
  const lunchChoice = document.getElementById("lunch").value;
  const now = new Date();
  const day = now.getDay();
  const display = document.getElementById("currentPeriod");
  const elapsedEl = document.getElementById("elapsed");
  const remainingEl = document.getElementById("remaining");
  const progressBar = document.getElementById("progressBar");
  const endOfDayEl = document.getElementById("endOfDay");
  const weekendEl = document.getElementById("weekendTimer");

  if (day === 5 || day === 6 || day === 0) {
    display.textContent = "It's the weekend 🎉";
    elapsedEl.textContent = "Elapsed: --";
    remainingEl.textContent = "Remaining: --";
    progressBar.style.width = "0%";
    endOfDayEl.textContent =
      "Until School Starts: " + formatDuration(nextSchoolStart(now) - now);
    weekendEl.textContent = "Weekend: NOW";
    return;
  }

  const todaysSchedule = schedules[lunchChoice];
  let current = null;
  for (const p of todaysSchedule) {
    const start = parseTime(p.start);
    const end = parseTime(p.end);
    if (now >= start && now <= end) {
      current = { ...p, start, end };
      break;
    }
  }

  if (current) {
    display.textContent = `Current: ${current.name}`;
    const elapsedMs = now - current.start;
    const remainingMs = current.end - now;
    const totalMs = current.end - current.start;
    elapsedEl.textContent = `Elapsed: ${formatDuration(elapsedMs)}`;
    remainingEl.textContent = `Remaining: ${formatDuration(remainingMs)}`;
    progressBar.style.width = `${(elapsedMs / totalMs) * 100}%`;
  } else {
    display.textContent = "No class in session";
    elapsedEl.textContent = "Elapsed: --";
    remainingEl.textContent = "Remaining: --";
    progressBar.style.width = "0%";
  }

  const lastEnd = parseTime(todaysSchedule[todaysSchedule.length - 1].end);
  if (now < lastEnd) {
    endOfDayEl.textContent =
      "Until End of Day: " + formatDuration(lastEnd - now);
  } else {
    endOfDayEl.textContent =
      "Until School Starts: " + formatDuration(nextSchoolStart(now) - now);
  }

  const weekendStart = nextWeekendStart(now);
  if (now >= weekendStart) {
    weekendEl.textContent = "Weekend: NOW";
  } else {
    weekendEl.textContent =
      "Until Weekend: " + formatDuration(weekendStart - now);
  }
}

setInterval(updateSchedule, 1000);
updateSchedule();

