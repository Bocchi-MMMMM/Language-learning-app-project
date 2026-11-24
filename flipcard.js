const vocabularyByCategory = {
	travel: [
		["luggage", "行李"], ["itinerary", "行程"], ["boarding pass", "登机牌"], ["destination", "目的地"],
		["accommodation", "住宿"], ["reservation", "预订"], ["departure", "出发"], ["arrival", "到达"],
		["passport", "护照"], ["customs", "海关"], ["currency", "货币"], ["exchange rate", "汇率"],
		["terminal", "航站楼"], ["platform", "站台"], ["transfer", "换乘"], ["delayed", "延误"],
		["sightseeing", "观光"], ["landmark", "地标"], ["excursion", "短途旅行"], ["travel insurance", "旅行保险"]
	],
	daily: [
		["greeting", "问候"], ["introduce", "介绍"], ["conversation", "对话"], ["appointment", "预约"],
		["neighbor", "邻居"], ["borrow", "借入"], ["lend", "借出"], ["recommend", "推荐"],
		["apologize", "道歉"], ["invitation", "邀请"], ["directions", "指引"], ["groceries", "食品杂货"],
		["commute", "通勤"], ["schedule", "日程"], ["available", "有空的"], ["pharmacy", "药店"],
		["receipt", "收据"], ["crowded", "拥挤的"], ["repair", "修理"], ["routine", "日常"]
	],
	academic: [
		["analyze", "分析"], ["evidence", "证据"], ["hypothesis", "假设"], ["research", "研究"],
		["method", "方法"], ["data", "数据"], ["theory", "理论"], ["source", "来源"],
		["citation", "引用"], ["compare", "比较"], ["contrast", "对比"], ["evaluate", "评估"],
		["interpret", "解释"], ["argument", "论点"], ["conclusion", "结论"], ["significant", "显著的"],
		["variable", "变量"], ["survey", "调查"], ["abstract", "摘要"], ["thesis", "论文"]
	],
	general: [
		["curious", "好奇的"], ["improve", "提高"], ["journey", "旅程"], ["discover", "发现"],
		["careful", "仔细的"], ["result", "结果"], ["choice", "选择"], ["meaning", "意思"],
		["notice", "注意"], ["practice", "练习"], ["wonder", "想知道"], ["possible", "可能的"],
		["common", "常见的"], ["remember", "记得"], ["decide", "决定"], ["change", "改变"],
		["explain", "解释"], ["useful", "有用的"], ["challenge", "挑战"], ["goal", "目标"]
	]
};

const categoryKey = document.body.dataset.category;
const vocabularyWords = vocabularyByCategory[categoryKey] || vocabularyByCategory.general;
const wordGridElement = document.querySelector("#word-grid");
const learnedList = document.querySelector("#learned-list");
const learnedEmpty = document.querySelector("#learned-empty");
const learnedCount = document.querySelector("#learned-count");
const finishedCourseList = document.querySelector("#finished-course-list");
const finishedCourseEmpty = document.querySelector("#finished-course-empty");
const finishedCourseCount = document.querySelector("#finished-course-count");
const progressStorageKey = window.wordwiseProgressStorageKey;

let savedProgress = {};
try {
	savedProgress = JSON.parse(localStorage.getItem(progressStorageKey) || "{}") || {};
} catch {
	savedProgress = {};
}

const savedLearnedByCategory = savedProgress.learnedByCategory || {};
const learnedWords = new Set(Array.isArray(savedLearnedByCategory[categoryKey]) ? savedLearnedByCategory[categoryKey] : []);
const savedCoursesByCategory = savedProgress.coursesByCategory || {};
let categoryCourses = savedCoursesByCategory[categoryKey] || {};
const wordButtons = new Map();

function saveLearnedWords() {
	const updatedLearnedByCategory = {
		...savedLearnedByCategory,
		[categoryKey]: Array.from(learnedWords)
	};
	savedProgress = {
		...savedProgress,
		learnedByCategory: updatedLearnedByCategory,
		wordlearned: Array.from(learnedWords)
	};
	try {
		localStorage.setItem(progressStorageKey, JSON.stringify(savedProgress));
	} catch {}
}

function courseUrl(word, meaning, review = false) {
	const params = new URLSearchParams({ category: categoryKey, word, meaning });
	if (review) params.set("review", "1");
	return `course.html?${params}`;
}

function saveCourseProgress(word, course) {
	categoryCourses = { ...categoryCourses, [word]: course };
	savedProgress = {
		...savedProgress,
		coursesByCategory: { ...(savedProgress.coursesByCategory || {}), [categoryKey]: categoryCourses }
	};
	try {
		localStorage.setItem(progressStorageKey, JSON.stringify(savedProgress));
	} catch {}
}

function renderFinishedCourses() {
	finishedCourseList.replaceChildren();
	const finishedWords = vocabularyWords.filter(([word]) => categoryCourses[word]?.completed);
	finishedCourseCount.textContent = String(finishedWords.length);
	finishedCourseEmpty.hidden = finishedWords.length > 0;

	for (const [word, meaning] of finishedWords) {
		const item = document.createElement("li");
		item.className = "finished-course-item";
		const label = document.createElement("span");
		label.className = "learned-word";
		const wordLabel = document.createElement("strong");
		wordLabel.textContent = word;
		const meaningLabel = document.createElement("span");
		meaningLabel.textContent = meaning;
		label.append(wordLabel, meaningLabel);

		const reviewButton = document.createElement("a");
		reviewButton.className = "review-course-link";
		reviewButton.href = courseUrl(word, meaning, true);
		reviewButton.textContent = "Review";
		item.append(label, reviewButton);
		finishedCourseList.append(item);
	}
}

function renderVocabulary() {
	vocabularyWords.forEach(([word, meaning], index) => {
		const tile = document.createElement("button");
		tile.className = "word-tile";
		tile.type = "button";
		tile.dataset.word = word;
		tile.dataset.meaning = meaning;
		tile.dataset.search = `${word} ${meaning}`.toLowerCase();
		tile.innerHTML = `<span class="word-number">${String(index + 1).padStart(2, "0")}</span><span class="word-label"></span><span class="learned-mark" aria-hidden="true">Learned</span><span class="course-mark" aria-hidden="true">Course finished</span>`;
		tile.querySelector(".word-label").textContent = word;
		if (categoryCourses[word]?.completed) tile.classList.add("is-course-complete");
		tile.addEventListener("click", () => {
			if (categoryCourses[word]?.completed) {
				openWordCard(word, meaning, tile);
			} else {
				window.location.assign(courseUrl(word, meaning));
			}
		});
		wordButtons.set(word, tile);
		wordGridElement.append(tile);
	});
}

function renderLearnedWords() {
	learnedList.replaceChildren();
	learnedCount.textContent = String(learnedWords.size);
	learnedEmpty.hidden = learnedWords.size > 0;

	for (const word of learnedWords) {
		const meaning = vocabularyWords.find(([vocabularyWord]) => vocabularyWord === word)?.[1];
		if (!meaning) continue;

		const item = document.createElement("li");
		item.className = "learned-item";
		const label = document.createElement("span");
		label.className = "learned-word";
		const wordLabel = document.createElement("strong");
		wordLabel.textContent = word;
		const meaningLabel = document.createElement("span");
		meaningLabel.textContent = meaning;
		label.append(wordLabel, meaningLabel);

		const removeButton = document.createElement("button");
		removeButton.className = "remove-learned";
		removeButton.type = "button";
		removeButton.textContent = "−";
		removeButton.setAttribute("aria-label", `Remove ${word} from learned words`);
		removeButton.addEventListener("click", () => {
			learnedWords.delete(word);
			wordButtons.get(word)?.classList.remove("is-learned");
			saveLearnedWords();
			renderLearnedWords();
		});
		item.append(label, removeButton);
		learnedList.append(item);
	}

	for (const word of learnedWords) wordButtons.get(word)?.classList.add("is-learned");
}

const studyOverlay = document.createElement("div");
studyOverlay.className = "study-overlay";
studyOverlay.hidden = true;
studyOverlay.innerHTML = `
	<section class="flip-dialog" role="dialog" aria-modal="true" aria-labelledby="flip-word" tabindex="-1">
		<button class="flip-close" type="button" aria-label="Close vocabulary card">×</button>
		<button class="flip-card" type="button" aria-label="Reveal Chinese meaning">
			<span class="flip-card-inner">
				<span class="flip-face flip-front">
					<span class="flip-kicker">English word</span>
					<strong class="flip-word" id="flip-word"></strong>
					<span class="flip-hint">Click the card to reveal its meaning</span>
				</span>
				<span class="flip-face flip-back">
					<span class="flip-kicker">Chinese meaning</span>
					<strong class="flip-word" id="flip-meaning" lang="zh-Hans"></strong>
					<span class="flip-hint">Click again to return to the word</span>
				</span>
			</span>
		</button>
	</section>`;
document.body.append(studyOverlay);

const flipCard = studyOverlay.querySelector(".flip-card");
const flipCardInner = studyOverlay.querySelector(".flip-card-inner");
const closeCardButton = studyOverlay.querySelector(".flip-close");
const reviewCourseButton = document.createElement("a");
reviewCourseButton.className = "review-course-button";
reviewCourseButton.textContent = "Review course";
reviewCourseButton.hidden = true;
studyOverlay.querySelector(".flip-dialog").append(reviewCourseButton);
let activeWordButton = null;

function openWordCard(word, meaning, sourceButton) {
	activeWordButton = sourceButton;
	studyOverlay.querySelector("#flip-word").textContent = word;
	studyOverlay.querySelector("#flip-meaning").textContent = meaning;
	flipCardInner.classList.remove("is-flipped");
	flipCard.setAttribute("aria-label", "Reveal Chinese meaning");
	reviewCourseButton.href = courseUrl(word, meaning, true);
	reviewCourseButton.hidden = !categoryCourses[word]?.completed;
	studyOverlay.hidden = false;
	document.body.classList.add("study-open");

	if (!learnedWords.has(word)) {
		learnedWords.add(word);
		sourceButton.classList.add("is-learned");
		saveLearnedWords();
		renderLearnedWords();
	}
	closeCardButton.focus();
}

function closeWordCard() {
	studyOverlay.hidden = true;
	document.body.classList.remove("study-open");
	activeWordButton?.focus();
}

flipCard.addEventListener("click", () => {
	const isFlipped = flipCardInner.classList.toggle("is-flipped");
	flipCard.setAttribute("aria-label", isFlipped ? "Return to English word" : "Reveal Chinese meaning");
});
closeCardButton.addEventListener("click", closeWordCard);
studyOverlay.addEventListener("click", (event) => {
	if (event.target === studyOverlay) closeWordCard();
});
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && !studyOverlay.hidden) closeWordCard();
});

renderVocabulary();
renderLearnedWords();
renderFinishedCourses();