const categoryDetails = {
	travel: { label: "Travelling", page: "travelling.html" },
	daily: { label: "Daily communication", page: "daily.html" },
	academic: { label: "Academic", page: "academic.html" },
	general: { label: "No specification", page: "no.html" }
};
const courseSteps = ["Mandarin pronunciation", "Word meaning", "Character stories", "Why the characters combine"];
const pronunciations = {
	"行李": "xíng lǐ", "行程": "xíng chéng", "登机牌": "dēng jī pái", "目的地": "mù dì dì", "住宿": "zhù sù",
	"预订": "yù dìng", "出发": "chū fā", "到达": "dào dá", "护照": "hù zhào", "海关": "hǎi guān",
	"货币": "huò bì", "汇率": "huì lǜ", "航站楼": "háng zhàn lóu", "站台": "zhàn tái", "换乘": "huàn chéng",
	"延误": "yán wù", "观光": "guān guāng", "地标": "dì biāo", "短途旅行": "duǎn tú lǚ xíng", "旅行保险": "lǚ xíng bǎo xiǎn",
	"问候": "wèn hòu", "介绍": "jiè shào", "对话": "duì huà", "预约": "yù yuē", "邻居": "lín jū",
	"借入": "jiè rù", "借出": "jiè chū", "推荐": "tuī jiàn", "道歉": "dào qiàn", "邀请": "yāo qǐng",
	"指引": "zhǐ yǐn", "食品杂货": "shí pǐn zá huò", "通勤": "tōng qín", "日程": "rì chéng", "有空的": "yǒu kòng de",
	"药店": "yào diàn", "收据": "shōu jù", "拥挤的": "yōng jǐ de", "修理": "xiū lǐ", "日常": "rì cháng",
	"分析": "fēn xī", "证据": "zhèng jù", "假设": "jiǎ shè", "研究": "yán jiū", "方法": "fāng fǎ",
	"数据": "shù jù", "理论": "lǐ lùn", "来源": "lái yuán", "引用": "yǐn yòng", "比较": "bǐ jiào",
	"对比": "duì bǐ", "评估": "píng gū", "解释": "jiě shì", "论点": "lùn diǎn", "结论": "jié lùn",
	"显著的": "xiǎn zhù de", "变量": "biàn liàng", "调查": "diào chá", "摘要": "zhāi yào", "论文": "lùn wén",
	"好奇的": "hào qí de", "提高": "tí gāo", "旅程": "lǚ chéng", "发现": "fā xiàn", "仔细的": "zǐ xì de",
	"结果": "jié guǒ", "选择": "xuǎn zé", "意思": "yì si", "注意": "zhù yì", "练习": "liàn xí",
	"想知道": "xiǎng zhī dào", "可能的": "kě néng de", "常见的": "cháng jiàn de", "记得": "jì de", "决定": "jué dìng",
	"改变": "gǎi biàn", "有用的": "yǒu yòng de", "挑战": "tiǎo zhàn", "目标": "mù biāo"
};
const characterMeanings = {
	行: "go; travel", 李: "plum", 程: "journey; course", 登: "climb; board", 机: "machine; aircraft", 牌: "card; sign",
	目: "eye; aim", 的: "a linking particle", 地: "ground; place", 住: "live; stay", 宿: "lodging; stay overnight", 预: "in advance",
	订: "arrange; book", 出: "go out; leave", 发: "send; set off", 到: "arrive", 达: "reach", 护: "protect", 照: "shine; document",
	海: "sea", 关: "gate; pass", 货: "goods", 币: "currency", 汇: "exchange; gather", 率: "rate", 航: "sail; travel by air",
	站: "stand; station", 楼: "building; floor", 台: "platform", 换: "change; exchange", 乘: "ride; take transport", 延: "extend; delay",
	误: "mistake; delay", 观: "look; view", 光: "light; scenery", 标: "mark; sign", 短: "short", 途: "route; journey", 旅: "travel",
	保: "protect; insure", 险: "risk; insurance", 问: "ask", 候: "wait; greet", 介: "introduce; between", 绍: "continue; introduce",
	对: "face; toward", 话: "speech; words", 约: "arrange; appointment", 邻: "nearby", 居: "live; reside", 借: "borrow; lend",
	入: "enter", 推: "push; recommend", 荐: "recommend", 道: "way; say", 歉: "apologize; regret", 邀: "invite", 请: "invite; please",
	指: "point; indicate", 引: "lead; guide", 食: "food; eat", 品: "item; kind", 杂: "mixed; assorted", 通: "connect; pass through",
	勤: "diligent; regular", 日: "day", 有: "have; there is", 空: "empty; free time", 药: "medicine", 店: "shop", 收: "receive; collect",
	据: "evidence; receipt", 拥: "gather around; crowd", 挤: "crowd; squeeze", 修: "repair; practice", 理: "reason; manage", 常: "usual; everyday",
	分: "divide; part", 析: "analyze; separate", 证: "prove; evidence", 假: "suppose; assume", 设: "set up; suppose", 研: "study; research",
	究: "investigate; study", 方: "method; direction", 法: "method; law", 数: "number; data", 论: "discuss; theory", 来: "come", 源: "source",
	用: "use", 比: "compare", 较: "compare; relatively", 评: "evaluate; comment", 估: "estimate", 解: "explain; untie", 释: "explain; release",
	点: "point; idea", 结: "join; conclusion", 显: "appear; show", 著: "notable; clearly", 变: "change", 量: "amount; measure",
	调: "investigate; adjust", 查: "examine; investigate", 摘: "pick; extract", 要: "important; summary", 文: "writing; text", 好: "good; well", 奇: "unusual; curious",
	提: "raise; bring up", 高: "high", 现: "appear; present", 仔: "careful", 细: "fine; detailed", 果: "fruit; result", 选: "choose",
	择: "select", 意: "intention; idea", 思: "think; thought", 注: "pay attention; pour", 练: "practice", 习: "practice; become accustomed",
	想: "think; imagine", 知: "know", 可: "can; possible", 能: "be able", 见: "see", 记: "remember; record", 得: "get; result marker",
	决: "decide", 定: "set; determine", 改: "change; correct", 挑: "choose; challenge", 战: "fight; challenge"
};
const contextualCharacterMeanings = {
	"目的地": { 的: "target; bull's-eye" },
	"好奇的": { 好: "like; be fond of", 奇: "unusual; curious" },
	"有空的": { 的: "descriptive particle" },
	"显著的": { 的: "descriptive particle" },
	"记得": { 得: "complement particle, pronounced de here" }
};
const query = new URLSearchParams(window.location.search);
const category = query.get("category");
const word = query.get("word");
const meaning = query.get("meaning");
const categoryInfo = categoryDetails[category];
const storageKey = window.wordwiseProgressStorageKey;
const courseView = document.querySelector("#course-view");
const completionView = document.querySelector("#course-complete");
const errorView = document.querySelector("#course-error");

if (!categoryInfo || !word || !meaning) {
	errorView.hidden = false;
	courseView.hidden = true;
} else {
	document.body.dataset.category = category;
	document.querySelector("#course-category").textContent = categoryInfo.label;
	document.querySelector("#exit-course").href = categoryInfo.page;
	document.querySelector("#return-to-words").href = categoryInfo.page;
	document.querySelector("#complete-word").textContent = meaning;
	document.querySelector("#complete-meaning").textContent = `Chinese for “${word}”`;

	let savedProgress = {};
	try {
		savedProgress = JSON.parse(localStorage.getItem(storageKey) || "{}") || {};
	} catch {}

	let coursesByCategory = savedProgress.coursesByCategory || {};
	let categoryCourses = coursesByCategory[category] || {};
	const existingCourse = categoryCourses[word] || {};
	let currentStep = existingCourse.completed && query.get("review") === "1"
		? 0
		: Math.max(0, Math.min(courseSteps.length - 1, Number(existingCourse.step) || 0));

	function persistCourse(completed = false) {
		categoryCourses = {
			...categoryCourses,
			[word]: { step: currentStep, completed: completed || Boolean(categoryCourses[word]?.completed) }
		};
		coursesByCategory = { ...coursesByCategory, [category]: categoryCourses };
		savedProgress = { ...savedProgress, coursesByCategory };
		try {
			localStorage.setItem(storageKey, JSON.stringify(savedProgress));
		} catch {}
	}

	function renderStep() {
		document.querySelector("#step-count").textContent = `Point ${currentStep + 1} of ${courseSteps.length}`;
		document.querySelector("#course-progress").value = currentStep + 1;
		document.querySelector("#lesson-point").textContent = `Point ${currentStep + 1}`;
		document.querySelector("#lesson-word").textContent = meaning;
		document.querySelector("#lesson-meaning").textContent = `Chinese for “${word}”`;
		document.querySelector("#lesson-title").textContent = courseSteps[currentStep];
		const content = document.querySelector("#lesson-content");
		content.replaceChildren();

		if (currentStep === 0) {
			const explanation = document.createElement("p");
			explanation.className = "lesson-copy";
			explanation.textContent = "Listen to the Mandarin pronunciation, then repeat the syllables and tones aloud.";
			const pinyin = document.createElement("p");
			pinyin.className = "pinyin";
			pinyin.textContent = pronunciations[meaning] || "Pinyin is not available for this word yet.";
			const speakButton = document.createElement("button");
			speakButton.className = "pronunciation-button";
			speakButton.type = "button";
			speakButton.textContent = "Play Mandarin pronunciation";
			speakButton.addEventListener("click", () => {
				if (!("speechSynthesis" in window)) {
					speakButton.textContent = "Speech playback is unavailable";
					return;
				}
				window.speechSynthesis.cancel();
				const utterance = new SpeechSynthesisUtterance(meaning);
				utterance.lang = "zh-CN";
				window.speechSynthesis.speak(utterance);
			});
			content.append(pinyin, explanation, speakButton);
		} else if (currentStep === 1) {
			const text = document.createElement("p");
			text.className = "lesson-copy";
			text.textContent = `The complete word ${meaning} means “${word}.” Learn it as a Chinese expression, not as an English word spelled with Chinese characters.`;
			content.append(text);
		} else if (currentStep === 2) {
			const characterList = document.createElement("div");
			characterList.className = "character-list";
			Array.from(meaning).filter((character) => !/\s/.test(character)).forEach((character) => {
				const card = document.createElement("article");
				card.className = "character-card";
				const heading = document.createElement("h3");
				heading.lang = "zh-Hans";
				heading.textContent = character;
				const gloss = contextualCharacterMeanings[meaning]?.[character] || characterMeanings[character] || "meaning depends on the word";
				const characterMeaning = document.createElement("p");
				characterMeaning.className = "character-meaning";
				characterMeaning.textContent = gloss;
				const story = document.createElement("p");
				story.className = "character-story";
				story.textContent = `Memory story: picture “${gloss.split(";")[0]}” on a small sign marked ${character}. Let that image help you remember this character's role.`;
				card.append(heading, characterMeaning, story);
				characterList.append(card);
			});
			const note = document.createElement("p");
			note.className = "lesson-note";
			note.textContent = "These short stories are memory aids, not claims about historical origins. A character can take on a different sense in other words.";
			content.append(characterList, note);
		} else {
			const parts = Array.from(meaning).filter((character) => !/\s/.test(character)).map((character) => {
				const gloss = contextualCharacterMeanings[meaning]?.[character] || characterMeanings[character] || "contextual sense";
				return `${character} (${gloss})`;
			});
			const breakdown = document.createElement("p");
			breakdown.className = "lesson-copy";
			breakdown.textContent = parts.join(" + ");
			const compound = document.createElement("p");
			compound.className = "pinyin";
			compound.lang = "zh-Hans";
			compound.textContent = `${meaning} = ${word}`;
			const note = document.createElement("p");
			note.className = "lesson-note";
			note.textContent = "Read the characters in order. Their individual meanings give clues; together, they form the established Chinese word for this idea. The compound is learned as a whole, not always as a literal sum of its parts.";
			content.append(breakdown, compound, note);
		}

		document.querySelector("#previous-step").disabled = currentStep === 0;
		document.querySelector("#next-step").textContent = currentStep === courseSteps.length - 1 ? "Finish course" : "Next";
	}

	document.querySelector("#previous-step").addEventListener("click", () => {
		if (currentStep === 0) return;
		currentStep -= 1;
		persistCourse();
		renderStep();
	});
	document.querySelector("#next-step").addEventListener("click", () => {
		if (currentStep === courseSteps.length - 1) {
			persistCourse(true);
			courseView.hidden = true;
			completionView.hidden = false;
			window.speechSynthesis?.cancel();
			return;
		}
		currentStep += 1;
		persistCourse();
		renderStep();
	});
	window.addEventListener("pagehide", () => {
		if (!window.wordwiseResettingProgress) persistCourse();
	});
	renderStep();
}
