const adventureData = window.wordwiseAdventureData;
const query = new URLSearchParams(location.search);
const category = query.get("category") || "general";
const returnPage = { travel: "travelling.html", daily: "daily.html", academic: "academic.html", general: "no.html" }[category] || "Category.html";
const learnedWords = adventureData.learnedWords();
const meanings = adventureData.meanings();
const adventure = adventureData.readAdventure();
const equippedWords = [...new Set(adventure.equippedWords.filter((word) => learnedWords.includes(word)))];
let selectedLevel = Math.min(60, Math.max(1, adventure.highestCompleted + 1));

document.querySelector("#back-to-words").href = returnPage;
const ui = {
	preview: document.querySelector("#character-preview"),
	costumeName: document.querySelector("#costume-name"),
	costumeSelect: document.querySelector("#costume-select"),
	level: document.querySelector("#character-level"),
	xp: document.querySelector("#xp-total"),
	points: document.querySelector("#costume-points"),
	damage: document.querySelector("#question-damage"),
	upgrade: document.querySelector("#upgrade-button"),
	unlock: document.querySelector("#costume-button"),
	note: document.querySelector("#upgrade-note"),
	equipped: document.querySelector("#equipped-words"),
	addWord: document.querySelector("#add-word-slot"),
	learnedSummary: document.querySelector("#learned-summary"),
	map: document.querySelector("#map-world"),
	path: document.querySelector("#level-path"),
	count: document.querySelector("#route-count"),
	hint: document.querySelector("#route-hint"),
	enter: document.querySelector("#enter-level")
};

function saveAdventure() {
	adventure.equippedWords = equippedWords;
	adventureData.writeAdventure(adventure);
}

function wordRequirement(level) {
	return level * 2;
}

function isUnlocked(level) {
	return level <= adventure.highestCompleted + 1 && learnedWords.length >= wordRequirement(level);
}

function renderLoadout() {
	const costume = adventureData.costumes.find((item) => item.id === adventure.selectedCostume);
	const costumeName = adventure.selectedCostume === "starter" ? "Trail clothes" : costume?.name || "Trail clothes";
	ui.preview.dataset.costume = adventure.selectedCostume;
	ui.costumeName.textContent = costumeName;
	ui.costumeSelect.replaceChildren(new Option("Trail clothes", "starter"));
	for (const item of adventureData.costumes.filter(({ id }) => adventure.ownedCostumes.includes(id))) {
		ui.costumeSelect.add(new Option(item.name, item.id));
	}
	ui.costumeSelect.value = adventure.selectedCostume;
	ui.level.textContent = `LV ${adventure.upgrades + 1}`;
	ui.xp.textContent = `${adventure.xp} XP`;
	ui.points.textContent = `${adventure.costumePoints} / 100`;
	ui.damage.textContent = String(33 + adventure.upgrades * 10);
	ui.upgrade.disabled = adventure.xp < 5;
	const allCostumesOwned = adventureData.costumes.every(({ id }) => adventure.ownedCostumes.includes(id));
	ui.unlock.disabled = adventure.costumePoints < 100 || allCostumesOwned;
	ui.unlock.textContent = allCostumesOwned ? "All costumes unlocked" : "Unlock costume · 100 points";
	ui.equipped.replaceChildren();
	for (const [index, word] of equippedWords.entries()) {
		const slot = document.createElement("div");
		slot.className = "equipped-word-slot";
		const select = document.createElement("select");
		select.className = "word-slot";
		select.setAttribute("aria-label", `Word sword slot ${index + 1}`);
		select.add(new Option("Choose a learned word", ""));
		for (const learnedWord of learnedWords) {
			if (equippedWords.includes(learnedWord) && learnedWord !== word) continue;
			select.add(new Option(`${learnedWord} · ${meanings.get(learnedWord)}`, learnedWord));
		}
		select.value = word;
		select.addEventListener("change", () => {
			if (!select.value) equippedWords.splice(index, 1);
			else equippedWords[index] = select.value;
			saveAdventure();
			renderLoadout();
		});
		const remove = document.createElement("button");
		remove.type = "button";
		remove.className = "remove-word-slot";
		remove.textContent = "×";
		remove.setAttribute("aria-label", `Remove ${word} from the word sword`);
		remove.addEventListener("click", () => {
			equippedWords.splice(index, 1);
			saveAdventure();
			renderLoadout();
		});
		slot.append(select, remove);
		ui.equipped.append(slot);
	}
	ui.addWord.disabled = equippedWords.length >= learnedWords.length;
	ui.addWord.textContent = equippedWords.length >= learnedWords.length ? "All learned words equipped" : "+ Add learned word";
	ui.learnedSummary.textContent = learnedWords.length
		? `${equippedWords.length} equipped · ${learnedWords.length} learned words available.`
		: "Learned words appear here. Open a word card on any category page to add one.";
}

function renderMap() {
	const count = Math.min(60, Math.max(8, adventure.highestCompleted + 3, Math.floor(learnedWords.length / 2) + 2));
	ui.map.style.width = `${Math.max(760, count * 100 + 50)}px`;
	ui.path.replaceChildren();
	ui.count.textContent = `${adventure.highestCompleted} cleared`;
	const points = Array.from({ length: count }, (_, index) => ({
		x: 74 + index * 100,
		y: index % 2 === 0 ? 104 : 232
	}));
	for (let index = 0; index < points.length - 1; index += 1) {
		const from = points[index];
		const to = points[index + 1];
		const segment = document.createElement("i");
		segment.className = `map-trail-segment${index + 1 <= adventure.highestCompleted ? " is-cleared" : ""}`;
		segment.style.left = `${from.x}px`;
		segment.style.top = `${from.y}px`;
		segment.style.width = `${Math.hypot(to.x - from.x, to.y - from.y)}px`;
		segment.style.transform = `rotate(${Math.atan2(to.y - from.y, to.x - from.x)}rad)`;
		ui.path.append(segment);
	}
	points.forEach((point, index) => {
		const level = index + 1;
		const wrap = document.createElement("div");
		wrap.className = "map-node-wrap";
		wrap.style.left = `${point.x - 24}px`;
		wrap.style.top = `${point.y - 24}px`;
		const node = document.createElement("button");
		node.type = "button";
		node.className = "map-node";
		node.textContent = level <= adventure.highestCompleted ? "✓" : String(level);
		node.disabled = !isUnlocked(level);
		node.classList.toggle("is-cleared", level <= adventure.highestCompleted);
		node.classList.toggle("is-selected", level === selectedLevel);
		node.setAttribute("aria-label", `Level ${level}, requires ${wordRequirement(level)} learned words`);
		node.addEventListener("click", () => {
			selectedLevel = level;
			renderMap();
		});
		const label = document.createElement("span");
		label.className = "map-node-label";
		label.textContent = level <= adventure.highestCompleted ? "CLEARED" : `${wordRequirement(level)} WORDS`;
		wrap.append(node, label);
		ui.path.append(wrap);
	});
	ui.hint.textContent = isUnlocked(selectedLevel)
		? `Level ${selectedLevel} is open · ${learnedWords.length} learned words ready.`
		: `Learn ${Math.max(0, wordRequirement(selectedLevel) - learnedWords.length)} more word${wordRequirement(selectedLevel) - learnedWords.length === 1 ? "" : "s"} to unlock Level ${selectedLevel}.`;
	ui.enter.disabled = !isUnlocked(selectedLevel);
	ui.enter.textContent = `Enter level ${selectedLevel}`;
	const chosen = ui.path.querySelector(".is-selected");
	if (chosen) {
		const x = chosen.getBoundingClientRect().left - ui.map.getBoundingClientRect().left + ui.map.scrollLeft;
		ui.map.scrollTo({ left: Math.max(0, x - (ui.map.clientWidth - chosen.offsetWidth) / 2), behavior: "smooth" });
	}
}

ui.upgrade.addEventListener("click", () => {
	if (adventure.xp < 5) return;
	adventure.xp -= 5;
	adventure.upgrades += 1;
	saveAdventure();
	renderLoadout();
	ui.note.textContent = `Question damage upgraded to ${33 + adventure.upgrades * 10}.`;
});
ui.unlock.addEventListener("click", () => {
	const next = adventureData.costumes.find(({ id }) => !adventure.ownedCostumes.includes(id));
	if (!next || adventure.costumePoints < 100) return;
	adventure.costumePoints -= 100;
	adventure.ownedCostumes.push(next.id);
	adventure.selectedCostume = next.id;
	saveAdventure();
	renderLoadout();
	ui.note.textContent = `${next.name} unlocked and equipped.`;
});
ui.costumeSelect.addEventListener("change", () => {
	if (!adventure.ownedCostumes.includes(ui.costumeSelect.value)) return;
	adventure.selectedCostume = ui.costumeSelect.value;
	saveAdventure();
	renderLoadout();
});
ui.addWord.addEventListener("click", () => {
	const next = learnedWords.find((word) => !equippedWords.includes(word));
	if (!next) return;
	equippedWords.push(next);
	saveAdventure();
	renderLoadout();
});
ui.enter.addEventListener("click", () => {
	if (isUnlocked(selectedLevel)) location.assign(`adventure-level.html?category=${encodeURIComponent(category)}&level=${selectedLevel}`);
});

renderLoadout();
renderMap();