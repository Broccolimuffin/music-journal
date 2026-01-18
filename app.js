const dateInput = document.getElementById("dateInput");
const songInput = document.getElementById("songInput");
const noteInput = document.getElementById("noteInput");
const saveBtn = document.getElementById("saveBtn");
const entriesDiv = document.getElementById("entries");
const autocompleteDiv = document.getElementById("autocomplete");

const todayKey = new Date().toISOString().slice(0, 10);
dateInput.value = todayKey;

// Fetch album art
async function fetchAlbumArt(query) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.results.length > 0) return data.results[0].artworkUrl100.replace("100x100","300x300");
  return null;
}

// Load journal entries
function loadJournal() {
  const journal = JSON.parse(localStorage.getItem("musicJournal")) || {};
  entriesDiv.innerHTML = "";

  const dates = Object.keys(journal).sort().reverse();
  dates.forEach(date => {
    const entry = document.createElement("div");
    entry.className = "entry";

    const textDiv = document.createElement("div");
    textDiv.className = "text";
    textDiv.innerHTML = `
      <strong>${date}</strong>
      ${journal[date].song}<br>
      <em>${journal[date].note || ""}</em>
    `;

    if(journal[date].art){
      const img = document.createElement("img");
      img.src = journal[date].art;
      img.className = "art";
      entry.appendChild(img);
    }

    const actions = document.createElement("div");
    actions.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.innerHTML = "✏️";
    editBtn.title = "Edit entry";
    editBtn.addEventListener("click", e => {
      e.stopPropagation();
      showEditPopup(editBtn, date, journal[date]);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "🗑️";
    deleteBtn.title = "Delete entry";
    deleteBtn.addEventListener("click", e=>{
      e.stopPropagation();
      if(confirm(`Delete entry for ${date}?`)){
        delete journal[date];
        localStorage.setItem("musicJournal", JSON.stringify(journal));
        loadJournal();
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    entry.appendChild(textDiv);
    entry.appendChild(actions);

    entriesDiv.appendChild(entry);
  });

  const selectedEntry = journal[dateInput.value];
  if(selectedEntry){
    songInput.value = selectedEntry.song;
    noteInput.value = selectedEntry.note || "";
  } else {
    songInput.value = "";
    noteInput.value = "";
  }
}

// Show edit popup next to button
function showEditPopup(button, date, data){
  document.querySelectorAll(".edit-popup").forEach(p=>p.remove());

  const popup = document.createElement("div");
  popup.className = "edit-popup";

  const songInp = document.createElement("input");
  songInp.value = data.song;
  songInp.placeholder = "Song – Artist";

  const noteInp = document.createElement("textarea");
  noteInp.value = data.note || "";
  noteInp.placeholder = "Note";

  const dateInp = document.createElement("input");
  dateInp.type = "date";
  dateInp.value = date;

  const saveBtnPopup = document.createElement("button");
  saveBtnPopup.textContent = "Save";

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";

  saveBtnPopup.addEventListener("click", async ()=>{
    const journal = JSON.parse(localStorage.getItem("musicJournal")) || {};
    const albumArt = await fetchAlbumArt(songInp.value);

    if(dateInp.value !== date) delete journal[date];

    journal[dateInp.value] = {
      song: songInp.value,
      note: noteInp.value,
      art: albumArt
    };

    localStorage.setItem("musicJournal", JSON.stringify(journal));
    loadJournal();
    popup.remove();
  });

  cancelBtn.addEventListener("click", ()=> popup.remove());

  popup.appendChild(songInp);
  popup.appendChild(noteInp);
  popup.appendChild(dateInp);
  popup.appendChild(saveBtnPopup);
  popup.appendChild(cancelBtn);

  document.body.appendChild(popup);

  const rect = button.getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY + 4}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;
}

// Autocomplete
songInput.addEventListener("input", async ()=>{
  const query = songInput.value;
  autocompleteDiv.innerHTML = "";
  if(!query) return;

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`;
  const response = await fetch(url);
  const data = await response.json();

  data.results.forEach(r=>{
    const div = document.createElement("div");
    div.className = "autocomplete-item";

    const img = document.createElement("img");
    img.src = r.artworkUrl60;
    img.className = "autocomplete-art";

    const text = document.createElement("span");
    text.textContent = r.trackName + " – " + r.artistName;

    div.appendChild(img);
    div.appendChild(text);

    div.addEventListener("click", ()=>{
      songInput.value = r.trackName + " – " + r.artistName;
      autocompleteDiv.innerHTML = "";
    });

    autocompleteDiv.appendChild(div);
  });
});

document.addEventListener("click", e=>{
  if(e.target !== songInput) autocompleteDiv.innerHTML = "";
});

dateInput.addEventListener("change", loadJournal);

// Main save button
saveBtn.addEventListener("click", async ()=>{
  if(!songInput.value || !dateInput.value) return;
  const journal = JSON.parse(localStorage.getItem("musicJournal")) || {};
  const albumArt = await fetchAlbumArt(songInput.value);

  journal[dateInput.value] = {
    song: songInput.value,
    note: noteInput.value,
    art: albumArt
  };

  localStorage.setItem("musicJournal", JSON.stringify(journal));
  loadJournal();
});

loadJournal();
