const adventureData = window.wordwiseAdventureData;
const query = new URLSearchParams(location.search);
const category = query.get("category") || "general";
const level = Math.max(1, Number.parseInt(query.get("level") || "1", 10));
const returnUrl = `adventure.html?category=${encodeURIComponent(category)}`;
const learnedWords = adventureData.learnedWords();
const meanings = adventureData.meanings();
const adventure = adventureData.readAdventure();
const worlds = [
	{ id: "mosswood", name: "Mosswood Trail" },
	{ id: "ruins", name: "Broken Ruins" },
	{ id: "cave", name: "Deep Cavern" }
];
const world = worlds[(level - 1) % worlds.length];
if (level > adventure.highestCompleted + 1 || learnedWords.length < level * 2) location.replace(returnUrl);

document.querySelector("#map-link").href = returnUrl;
document.querySelector("#level-title").textContent = `Level ${level}`;
document.querySelector("#world-kicker").textContent = world.name;
document.querySelector("#pixel-scene").dataset.world = world.id;
document.querySelector("#world-marker").textContent = `LEVEL ${level}`;
const playerElement = document.querySelector("#world-player");
playerElement.dataset.costume = adventure.selectedCostume || "starter";

const ui = {
	scene: document.querySelector("#pixel-scene"),
	world: document.querySelector("#game-world"),
	player: playerElement,
	details: document.querySelector("#world-details"),
	obstacles: document.querySelector("#world-obstacles"),
	enemies: document.querySelector("#world-enemies"),
	playerBar: document.querySelector("#player-health-bar"),
	playerText: document.querySelector("#player-health-text"),
	enemyGroup: document.querySelector("#enemy-health-group"),
	enemyLabel: document.querySelector("#enemy-label"),
	enemyBar: document.querySelector("#enemy-health-bar"),
	enemyText: document.querySelector("#enemy-health-text"),
	question: document.querySelector("#question-pause"),
	quizKind: document.querySelector("#quiz-kind"),
	quizProgress: document.querySelector("#quiz-progress"),
	quizTitle: document.querySelector("#quiz-title"),
	quizPrompt: document.querySelector("#quiz-prompt"),
	answers: document.querySelector("#answer-list"),
	feedback: document.querySelector("#quiz-feedback"),
	message: document.querySelector("#run-message"),
	start: document.querySelector("#start-button"),
	jump: document.querySelector("#jump-button"),
	attack: document.querySelector("#attack-button"),
	retry: document.querySelector("#retry-button")
};

const worldWidth = 5200;
const obstaclePositions = [480, 1480, 2660];
const enemies = [
	{ id: 0, x: 980, kind: "monster", hp: 150 + (level - 1) * 50 },
	{ id: 1, x: 2180, kind: "monster", hp: 150 + (level - 1) * 50 },
	{ id: 2, x: 4140, kind: "boss", hp: 500 }
].map((enemy) => ({ ...enemy, maxHp: enemy.hp, defeated: false }));
let playerHp = 100;
let distance = 90;
let camera = 0;
let obstacleIndex = 0;
let encounter = null;
let mode = "ready";
let questionKind = "sword";
let questionWord = "";
let questionNumber = 0;
let lastFrame = 0;
let frameRequest = 0;
let pendingResumeTimer = 0;

function saveProgress() {
	const progress = adventureData.readProgress();
	progress.adventure = { ...adventure };
	try {
		localStorage.setItem(window.wordwiseProgressStorageKey, JSON.stringify(progress));
		document.querySelector("#save-label").textContent = "Progress saved on this device";
	} catch {
		document.querySelector("#save-label").textContent = "Could not save progress";
	}
}

function updateHealth() {
	ui.playerBar.style.width = `${playerHp}%`;
	ui.playerText.textContent = `${playerHp} / 100`;
	if (encounter) {
		ui.enemyBar.style.width = `${Math.max(0, encounter.hp / encounter.maxHp * 100)}%`;
		ui.enemyText.textContent = `${encounter.hp} / ${encounter.maxHp}`;
	}
}

function buildWorld() {
	for (let index = 0; index < 68; index += 1) {
		const block = document.createElement("i");
		block.className = "world-detail";
		block.style.left = `${80 + index * 75}px`;
		ui.details.append(block);
	}
	for (const [index, x] of obstaclePositions.entries()) {
		const obstacle = document.createElement("div");
		obstacle.className = "world-obstacle";
		obstacle.dataset.index = String(index);
		obstacle.style.left = `${x}px`;
		obstacle.innerHTML = "<i></i><b></b>";
		ui.obstacles.append(obstacle);
	}
	for (const enemy of enemies) {
		const sprite = document.createElement("div");
		sprite.className = `scene-enemy${enemy.kind === "boss" ? " is-boss" : ""}`;
		sprite.dataset.enemyId = String(enemy.id);
		sprite.style.left = `${enemy.x}px`;
		sprite.setAttribute("aria-label", enemy.kind === "boss" ? "Pixel boss" : "Pixel monster");
		sprite.innerHTML = "<i></i><b></b><span></span>";
		ui.enemies.append(sprite);
	}
}

function updateCamera() {
	const viewportWidth = ui.scene.clientWidth;
	const followX = Math.min(180, viewportWidth * 0.32);
	camera = Math.max(0, Math.min(worldWidth - viewportWidth, distance - followX));
	ui.world.style.transform = `translate3d(${-camera}px, 0, 0)`;
	ui.player.style.left = `${distance}px`;
}

function chooseQuestionWord() {
	const equipped = adventure.equippedWords.filter((word) => learnedWords.includes(word));
	const words = equipped.length && Math.random() < 0.7 ? equipped : learnedWords;
	return words[Math.floor(Math.random() * words.length)];
}

function askQuestion(kind) {
	if (mode === "paused" || !learnedWords.length) return;
	mode = "paused";
	questionKind = kind;
	questionNumber += 1;
	ui.scene.classList.add("is-paused");
	ui.question.hidden = false;
	ui.quizKind.textContent = kind === "sword" ? "Sword attack" : "Monster attack";
	ui.quizProgress.textContent = `Question ${questionNumber}`;
	ui.quizPrompt.textContent = kind === "sword"
		? "Answer correctly to strike with your word sword."
		: "The monster attacks. Answer correctly to dodge it.";
	questionWord = chooseQuestionWord();
	const correctMeaning = meanings.get(questionWord);
	ui.quizTitle.textContent = questionWord;
	ui.feedback.textContent = "";
	const distractors = [...new Set([...meanings.values()].filter((meaning) => meaning !== correctMeaning))];
	const choices = [correctMeaning];
	while (choices.length < 4 && distractors.length) {
		const [meaning] = distractors.splice(Math.floor(Math.random() * distractors.length), 1);
		if (!choices.includes(meaning)) choices.push(meaning);
	}
	choices.sort(() => Math.random() - 0.5);
	ui.answers.replaceChildren();
	for (const meaning of choices) {
		const answer = document.createElement("button");
		answer.type = "button";
		answer.className = "answer-button";
		answer.textContent = meaning;
		answer.addEventListener("click", () => answerQuestion(answer, meaning, correctMeaning));
		ui.answers.append(answer);
	}
	ui.answers.querySelector("button")?.focus();
}

function resumeAfterAnswer() {
	ui.question.hidden = true;
	ui.scene.classList.remove("is-paused");
	mode = encounter ? "combat" : "running";
	lastFrame = performance.now();
	if (!encounter && enemies.every((enemy) => enemy.defeated)) finishLevel(true);
}

function answerQuestion(button, selected, correct) {
	if (mode !== "paused") return;
	const isCorrect = selected === correct;
	for (const answer of ui.answers.querySelectorAll("button")) {
		answer.disabled = true;
		if (answer.textContent === correct) answer.classList.add("is-correct");
	}
	if (isCorrect) {
		button.classList.add("is-correct");
		if (questionKind === "sword") {
			const damage = 10 + 33 + adventure.upgrades * 10;
			encounter.hp = Math.max(0, encounter.hp - damage);
			ui.feedback.textContent = `Correct! Your sword deals ${damage} damage.`;
			ui.player.classList.add("is-attacking");
			updateHealth();
			if (encounter.hp === 0) {
				encounter.defeated = true;
				ui.enemies.querySelector(`[data-enemy-id="${encounter.id}"]`)?.remove();
				encounter = null;
				ui.enemyGroup.hidden = true;
			}
		} else {
			ui.feedback.textContent = "Correct! You dodge the monster's attack.";
		}
	} else {
		button.classList.add("is-wrong");
		if (questionKind === "monster") {
			playerHp = Math.max(0, playerHp - 33);
			ui.feedback.textContent = `Incorrect. ${questionWord} means ${correct}. You lose 33 HP.`;
			ui.player.classList.add("is-hurt");
			updateHealth();
		} else {
			ui.feedback.textContent = `Incorrect. ${questionWord} means ${correct}. The monster counters.`;
		}
	}
	window.setTimeout(() => {
		if (playerHp === 0) {
			finishLevel(false);
			return;
		}
		if (questionKind === "sword" && encounter) {
			ui.question.hidden = true;
			ui.scene.classList.remove("is-paused");
			mode = "combat";
			pendingResumeTimer = window.setTimeout(() => askQuestion("monster"), 280);
		} else {
			resumeAfterAnswer();
		}
	}, 900);
}

function beginEncounter(enemy) {
	encounter = enemy;
	mode = "combat";
	ui.enemyGroup.hidden = false;
	ui.enemyLabel.textContent = enemy.kind === "boss" ? "BOSS" : "MONSTER";
	ui.enemies.querySelector(`[data-enemy-id="${enemy.id}"]`)?.classList.add("is-active");
	ui.attack.hidden = false;
	ui.message.textContent = enemy.kind === "boss" ? "The boss blocks the trail. Swing your sword to attack." : "Monster ahead. Swing your sword to attack.";
	updateHealth();
}

function checkWorldEvents() {
	const obstacle = obstaclePositions[obstacleIndex];
	if (obstacle !== undefined && distance >= obstacle - 78) {
		mode = "obstacle";
		ui.jump.hidden = false;
		ui.message.textContent = "Obstacle ahead. Jump to clear it and continue running.";
		return;
	}
	const nextEnemy = enemies.find((enemy) => !enemy.defeated);
	if (nextEnemy && distance >= nextEnemy.x - 190) beginEncounter(nextEnemy);
}

function animationFrame(time) {
	if (mode === "running") {
		const delta = Math.min((time - lastFrame) / 1000, 0.05);
		lastFrame = time;
		distance = Math.min(worldWidth - 180, distance + 170 * delta);
		updateCamera();
		checkWorldEvents();
	} else {
		lastFrame = time;
	}
	frameRequest = requestAnimationFrame(animationFrame);
}

function startRunning() {
	if (mode !== "ready") return;
	mode = "running";
	ui.start.hidden = true;
	ui.player.classList.add("is-running");
	ui.message.textContent = "Auto-running. Jump obstacles and attack monsters with J or the button.";
	lastFrame = performance.now();
	frameRequest = requestAnimationFrame(animationFrame);
}

function jumpObstacle() {
	if (mode !== "obstacle") return;
	mode = "jumping";
	ui.jump.hidden = true;
	ui.player.classList.remove("is-jumping");
	void ui.player.offsetWidth;
	ui.player.classList.add("is-jumping");
	window.setTimeout(() => {
		if (mode !== "jumping") return;
		ui.obstacles.querySelector(`[data-index="${obstacleIndex}"]`)?.remove();
		obstacleIndex += 1;
		ui.player.classList.remove("is-jumping");
		mode = "running";
		ui.message.textContent = "Obstacle cleared. Running continues.";
		lastFrame = performance.now();
	}, 460);
}

function attack() {
	if (mode !== "combat" || !encounter) return;
	ui.player.classList.remove("is-attacking");
	void ui.player.offsetWidth;
	ui.player.classList.add("is-attacking");
	askQuestion("sword");
}

function finishLevel(won) {
	cancelAnimationFrame(frameRequest);
	window.clearTimeout(pendingResumeTimer);
	mode = won ? "complete" : "defeat";
	ui.scene.classList.add("is-paused");
	ui.player.classList.remove("is-running", "is-attacking", "is-hurt");
	ui.jump.hidden = true;
	ui.attack.hidden = true;
	if (!won) {
		ui.retry.hidden = false;
		ui.message.textContent = "You ran out of HP. Retry the level to run again.";
		return;
	}
	const newClear = level > adventure.highestCompleted;
	if (newClear) {
		adventure.highestCompleted = level;
		adventure.xp += 20;
		adventure.costumePoints += 40;
		adventure.equippedWords = adventure.equippedWords;
		const progress = adventureData.readProgress();
		progress.adventure = { ...adventure };
		try {
			localStorage.setItem(window.wordwiseProgressStorageKey, JSON.stringify(progress));
		} catch {}
	}
	const panel = document.createElement("div");
	panel.className = "level-complete";
	const card = document.createElement("section");
	card.className = "complete-panel";
	const kicker = document.createElement("p");
	kicker.className = "panel-kicker";
	kicker.textContent = newClear ? "Level cleared" : "Run complete";
	const title = document.createElement("h2");
	title.textContent = "Trail conquered";
	const reward = document.createElement("p");
	reward.textContent = newClear ? "+20 XP · +40 costume points earned" : "This level was already cleared, so rewards were not repeated.";
	const back = document.createElement("a");
	back.className = "game-button primary-button";
	back.href = returnUrl;
	back.textContent = "Back to level map";
	card.append(kicker, title, reward, back);
	panel.append(card);
	ui.scene.append(panel);
	ui.message.textContent = "The boss is defeated. Your rewards are saved.";
}

ui.start.addEventListener("click", startRunning);
ui.jump.addEventListener("click", jumpObstacle);
ui.attack.addEventListener("click", attack);
ui.retry.addEventListener("click", () => location.reload());
document.addEventListener("keydown", (event) => {
	if ((event.code === "Space" || event.code === "ArrowUp") && mode === "obstacle") {
		event.preventDefault();
		jumpObstacle();
	} else if ((event.code === "KeyJ" || event.code === "Enter") && mode === "combat") {
		event.preventDefault();
		attack();
	}
});

buildWorld();
updateHealth();
updateCamera();