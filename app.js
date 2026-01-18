const dateInput = document.getElementById("dateInput");
const songInput = document.getElementById("songInput");
const noteInput = document.getElementById("noteInput");
const saveBtn = document.getElementById("saveBtn");
const entriesEl = document.getElementById("entries");
const sortSelect = document.getElementById("sortSelect");

dateInput.valueAsDate = new Date();

let entries = JSON.parse(localStorage.getItem("musicJournal")) || [];

function saveEntries() {
  localStorage.setItem("musicJournal", JSON.stringify(entries));
}

function addEntry() {
  if (!songInput.value.trim()) return;

  entries.push({
    date: dateInput.value,
    song: songInput.value,
    note: noteInput.value
  });

  saveEntries();
  songInput.value = "";
  noteInput.value = "";
  renderEntries();
}

saveBtn.addEventListener("click", addEntry);

sortSelect.addEventListener("change", renderEntries);

function renderEntries() {
  entriesEl.innerHTML = "";

  const sorted = [...entries].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  const mode = sortSelect.value;
  const groups = {};

  sorted.forEach(entry => {
    const d = new Date(entry.date);
    let key;

    if (mode === "day") {
      key = d.toDateString();
    } else if (mode === "week") {
      const firstDay = new Date(d);
      firstDay.setDate(d.getDate() - d.getDay());
      key = firstDay.toDateString();
    } else if (mode === "month") {
      key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    } else {
      key = d.getFullYear();
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });

  Object.keys(groups).forEach(group => {
    const groupTitle = document.createElement("h3");
    groupTitle.textContent = group;
    entriesEl.appendChild(groupTitle);

    groups[group].forEach(entry => {
      const div = document.createElement("div");
      div.className = "entry";

      div.innerHTML = `
        <div class="entry-date">${entry.date}</div>
        <strong>${entry.song}</strong>
        ${entry.note ? `<div class="entry-note">${entry.note}</div>` : ""}
      `;

      entriesEl.appendChild(div);
    });
  });
}

renderEntries();
