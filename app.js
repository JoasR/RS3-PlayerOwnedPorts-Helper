// =============================
// Data persistence
// =============================
let crew = JSON.parse(localStorage.getItem("crew") || "[]");
let captains = JSON.parse(localStorage.getItem("captains") || "[]")
let ship = JSON.parse(localStorage.getItem("ship")) || { selections: {}, morale: 0, combat: 0, seafaring: 0 };

// =============================
// Crew Functions
// =============================
function saveCrew() {
  localStorage.setItem("crew", JSON.stringify(crew));
}

function addCrew() {
  let name = document.getElementById("name").value;
  let morale = parseInt(document.getElementById("morale").value) || 0;
  let combat = parseInt(document.getElementById("combat").value) || 0;
  let seafaring = parseInt(document.getElementById("seafaring").value) || 0;

  crew.push({ name, morale, combat, seafaring });
  saveCrew();
  renderCrew();
}

function removeCrew(index) {
  crew.splice(index, 1);
  saveCrew();
  renderCrew();
}

function renderCrew() {
  let div = document.getElementById("crewList");
  console.log("crew stats: " + JSON.stringify(crew))
  div.innerHTML = crew.map((c, i) =>
    `<div class="crew">
      ${c.name} (M:${c.morale} C:${c.combat} S:${c.seafaring})
      <button onclick="removeCrew(${i})">Remove</button>
    </div>`
  ).join("");
}

// =============================
// Captain Functions
// =============================
function saveCaptains() {
  localStorage.setItem("captains", JSON.stringify(captains));
}

function addCaptain() {
  let name = document.getElementById("captainName").value;
  let morale = parseInt(document.getElementById("captainMorale").value) || 0;
  let combat = parseInt(document.getElementById("captainCombat").value) || 0;
  let seafaring = parseInt(document.getElementById("captainSeafaring").value) || 0;

  captains.push({ name, morale, combat, seafaring });
  saveCaptains();
  renderCaptains();

  // Clear inputs after adding
  document.getElementById("captainName").value = "";
  document.getElementById("captainMorale").value = "";
  document.getElementById("captainCombat").value = "";
  document.getElementById("captainSeafaring").value = "";
}

function removeCaptain(index) {
  captains.splice(index, 1);
  saveCaptains();
  renderCaptains();
}

function renderCaptains() {
  let div = document.getElementById("captainList");
  div.innerHTML = captains.map((c, i) =>
    `<div class="crew">
      ${c.name} (M:${c.morale} C:${c.combat} S:${c.seafaring})
      <button onclick="removeCaptain(${i})">Remove</button>
    </div>`
  ).join("");
}

// =============================
// Ship Functions
// =============================

// Placeholder upgrades data
const shipUpgrades = {
  Deck1: [
    {name:"Deck A", morale:2, combat:1, seafaring:0},
    {name:"Deck B", morale:1, combat:2, seafaring:1}
  ],
  Deck2: [
    {name:"Deck C", morale:0, combat:1, seafaring:2},
    {name:"Deck D", morale:1, combat:0, seafaring:1}
  ],
  Rudder: [
    {name:"Rudder A", morale:0, combat:1, seafaring:2},
    {name:"Rudder B", morale:1, combat:0, seafaring:1}
  ],
  Ram: [
    {name:"Ram A", morale:2, combat:2, seafaring:0},
    {name:"Ram B", morale:1, combat:1, seafaring:1}
  ],
  Hull: [
    {name:"Hull A", morale:1, combat:2, seafaring:1},
    {name:"Hull B", morale:0, combat:1, seafaring:2}
  ]
};

let tempSelections = {}; // temporary selections before saving

function saveShip() {
  const ship = JSON.parse(localStorage.getItem("ship")) || { selections: {}, morale: 0, combat: 0, seafaring: 0 };

  ship.selections = { ...tempSelections };

  // Calculate totals
  let totalMorale = 0, totalCombat = 0, totalSeafaring = 0;
  for (const [cat, indices] of Object.entries(ship.selections)) {
    indices.forEach(idx => {
      const upgrade = shipUpgrades[cat][idx];
      totalMorale += upgrade.morale;
      totalCombat += upgrade.combat;
      totalSeafaring += upgrade.seafaring;
    });
  }

  ship.morale = totalMorale;
  ship.combat = totalCombat;
  ship.seafaring = totalSeafaring;

  localStorage.setItem("ship", JSON.stringify(ship));
  alert("Ship upgrades saved!");
}

function renderShip() {
  const ship = JSON.parse(localStorage.getItem("ship")) || { selections: {}, morale: 0, combat: 0, seafaring: 0 };

  let totalMorale = 0, totalCombat = 0, totalSeafaring = 0;

  for (const [cat, list] of Object.entries(shipUpgrades)) {
    const section = document.getElementById(cat);
    if (!section) continue;
    section.innerHTML = ""; // clear previous content

    const selectedIndices = tempSelections[cat] ?? ship.selections[cat] ?? [];

    list.forEach((upg, i) => {
      const checked = selectedIndices.includes(i) ? "checked" : "";
      section.innerHTML += `
        <label>
          <input type="checkbox" name="${cat}" value="${i}" ${checked}>
          ${upg.name} (M:${upg.morale} C:${upg.combat} S:${upg.seafaring})
        </label><br>
      `;
    });

    // Add stats of selected upgrades
    selectedIndices.forEach(idx => {
      const upgrade = list[idx];
      totalMorale += upgrade.morale;
      totalCombat += upgrade.combat;
      totalSeafaring += upgrade.seafaring;
    });
  }

  // Update totals display
  document.getElementById("shipTotals").innerText =
    `Morale: ${totalMorale} | Combat: ${totalCombat} | Seafaring: ${totalSeafaring}`;

  // Add change listeners
  document.querySelectorAll("input[type=checkbox]").forEach(cb => cb.addEventListener("change", e => {
    const cat = e.target.name;
    const idx = parseInt(e.target.value);

    if (!tempSelections[cat]) tempSelections[cat] = [];

    if (e.target.checked) {
      // add if not already
      if (!tempSelections[cat].includes(idx)) tempSelections[cat].push(idx);
    } else {
      // remove if unchecked
      tempSelections[cat] = tempSelections[cat].filter(i => i !== idx);
    }

    renderShip(); // re-render to update totals dynamically
  }));
}

// =============================
// Optimizer
// =============================
function calculateSuccess(setup, voyage) {
  let m = setup.reduce((a, c) => a + c.morale, 0) + ship.morale;
  let c = setup.reduce((a, c) => a + c.combat, 0) + ship.combat;
  let s = setup.reduce((a, c) => a + c.seafaring, 0) + ship.seafaring;

  let moraleRatio = Math.min(m / voyage.morale, 1);
  let combatRatio = Math.min(c / voyage.combat, 1);
  let seafaringRatio = Math.min(s / voyage.seafaring, 1);

  let lowest = Math.min(moraleRatio, combatRatio, seafaringRatio);

  return Math.round(lowest * 100);
}


function findBestCrew(voyage) {
  let best = [];

  if (captains.length === 0) {
    return []; // no captains = no valid voyage
  }

  for (let cap of captains) {
    for (let i = 0; i < crew.length; i++) {
      for (let j = i + 1; j < crew.length; j++) {
        for (let k = j + 1; k < crew.length; k++) {
          for (let l = k + 1; l < crew.length; l++) {
            for (let m = l + 1; m < crew.length; m++) {
              let setup = [cap, crew[i], crew[j], crew[k], crew[l], crew[m]];
              let success = calculateSuccess(setup, voyage);
              best.push({ setup, success });
            }
          }
        }
      }
    }
  }

  best.sort((a, b) => b.success - a.success);
  return best.slice(0, 5); // top 5 results
}



function showBestSetups() {
  let voyage = {
    morale: parseInt(document.getElementById("vmorale").value) || 0,
    combat: parseInt(document.getElementById("vcombat").value) || 0,
    seafaring: parseInt(document.getElementById("vseafaring").value) || 0
  };

  if (voyage.morale + voyage.combat + voyage.seafaring === 0) {
    document.getElementById("results").innerHTML = "<p>Please enter voyage requirements.</p>";
    return;
  }

  let best = findBestCrew(voyage);

  let div = document.getElementById("results");
  div.innerHTML = best.map(b =>
    `<p>${b.success}% → ${b.setup.map(c => c.name).join(", ")}</p>`
  ).join("");
}

// =============================
// Init
// =============================
renderCrew();
renderCaptains();
renderShip();