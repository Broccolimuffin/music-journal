const dateInput = document.getElementById("dateInput");
const songInput = document.getElementById("songInput");
const noteInput = document.getElementById("noteInput");
const saveBtn = document.getElementById("saveBtn");
const entriesEl = document.getElementById("entries");
const autocompleteEl = document.getElementById("autocomplete");
const monthPicker = document.getElementById("monthPicker");

dateInput.valueAsDate = new Date();
monthPicker.value = new Date().toISOString().slice(0, 7);

let entries = JSON.parse(localStorage.getItem("musicJournal")) || [];
let selectedArtwork = null;

function saveEntries() {
  localStorage.setItem("musicJournal", JSON.stringify(entries));
}

saveBtn.addEventListener("click", () => {
  if (!songInput.value.trim()) return;

  entries.push({
    date: dateInput.value,
    song: songInput.value,
    note: noteInput.value,
    artwork: selectedArtwork
  });

  saveEntries();
  songInput.value = "";
  noteInput.value = "";
  selectedArtwork = null;
  autocompleteEl.innerHTML = "";
  renderEntries();
});

monthPicker.addEventListener("change", renderEntries);

// ---------- AUTOCOMPLETE WITH ALBUM ART ----------
let debounce;
songInput.addEventListener("input", () => {
  clearTimeout(debounce);
  const query = songInput.value.trim();
  if (!query) {
    autocompleteEl.innerHTML = "";
    return;
  }

  debounce = setTimeout(async () => {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`
    );
    const data = await res.json();
    autocompleteEl.innerHTML = "";

    data.results.forEach(song => {
      const div = document.createElement("div");
      div.className = "autocomplete-item";
      div.innerHTML = `
        <img src="${song.artworkUrl60}" />
        <span>${song.trackName} - ${song.artistName}</span>
      `;
      div.onclick = () => {
        songInput.value = `${song.trackName} - ${song.artistName}`;
        selectedArtwork = song.artworkUrl100;
        autocompleteEl.innerHTML = "";
      };
      autocompleteEl.appendChild(div);
    });
  }, 300);
});

// ---------- RENDER ENTRIES BY MONTH ----------
function renderEntries() {
  entriesEl.innerHTML = "";
  const [year, month] = monthPicker.value.split("-");

  const filtered = entries
    .filter(e => {
      const d = new Date(e.date);
      return (
        d.getFullYear() === Number(year) &&
        d.getMonth() + 1 === Number(month)
      );
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  filtered.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "entry";

    div.innerHTML = `
      ${entry.artwork ? `<img src="${entry.artwork}" />` : ""}
      <div class="entry-content">
        <div class="entry-date">${entry.date}</div>
        <strong>${entry.song}</strong>
        ${entry.note ? `<div class="entry-note">${entry.note}</div>` : ""}
      </div>
      <div class="entry-buttons">
        <button class="edit-btn" title="Edit">
          <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        </button>
        <button class="delete-btn" title="Delete">
          <svg viewBox="0 0 24 24"><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1z"/></svg>
        </button>
      </div>
    `;

    entriesEl.appendChild(div);

    const editBtn = div.querySelector(".edit-btn");
    const deleteBtn = div.querySelector(".delete-btn");

    editBtn.onclick = () => {
      const newSong = prompt("Edit Song - Artist:", entry.song);
      if (newSong !== null) entry.song = newSong;

      const newNote = prompt("Edit Note:", entry.note);
      if (newNote !== null) entry.note = newNote;

      const newDate = prompt("Edit Date (YYYY-MM-DD):", entry.date);
      if (newDate !== null) entry.date = newDate;

      saveEntries();
      renderEntries();
    };

    deleteBtn.onclick = () => {
      if (confirm("Delete this entry?")) {
        entries.splice(entries.indexOf(entry), 1);
        saveEntries();
        renderEntries();
      }
    };
  });
}

renderEntries();
