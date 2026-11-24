window.wordwiseAdventureData = {
	vocabulary: {
		travel: [["luggage", "行李"], ["itinerary", "行程"], ["boarding pass", "登机牌"], ["destination", "目的地"], ["accommodation", "住宿"], ["reservation", "预订"], ["departure", "出发"], ["arrival", "到达"], ["passport", "护照"], ["customs", "海关"], ["currency", "货币"], ["exchange rate", "汇率"], ["terminal", "航站楼"], ["platform", "站台"], ["transfer", "换乘"], ["delayed", "延误"], ["sightseeing", "观光"], ["landmark", "地标"], ["excursion", "短途旅行"], ["travel insurance", "旅行保险"]],
		daily: [["greeting", "问候"], ["introduce", "介绍"], ["conversation", "对话"], ["appointment", "预约"], ["neighbor", "邻居"], ["borrow", "借入"], ["lend", "借出"], ["recommend", "推荐"], ["apologize", "道歉"], ["invitation", "邀请"], ["directions", "指引"], ["groceries", "食品杂货"], ["commute", "通勤"], ["schedule", "日程"], ["available", "有空的"], ["pharmacy", "药店"], ["receipt", "收据"], ["crowded", "拥挤的"], ["repair", "修理"], ["routine", "日常"]],
		academic: [["analyze", "分析"], ["evidence", "证据"], ["hypothesis", "假设"], ["research", "研究"], ["method", "方法"], ["data", "数据"], ["theory", "理论"], ["source", "来源"], ["citation", "引用"], ["compare", "比较"], ["contrast", "对比"], ["evaluate", "评估"], ["interpret", "解释"], ["argument", "论点"], ["conclusion", "结论"], ["significant", "显著的"], ["variable", "变量"], ["survey", "调查"], ["abstract", "摘要"], ["thesis", "论文"]],
		general: [["curious", "好奇的"], ["improve", "提高"], ["journey", "旅程"], ["discover", "发现"], ["careful", "仔细的"], ["result", "结果"], ["choice", "选择"], ["meaning", "意思"], ["notice", "注意"], ["practice", "练习"], ["wonder", "想知道"], ["possible", "可能的"], ["common", "常见的"], ["remember", "记得"], ["decide", "决定"], ["change", "改变"], ["explain", "解释"], ["useful", "有用的"], ["challenge", "挑战"], ["goal", "目标"]]
	},
	costumes: [
		{ id: "forest", name: "Forest guard" },
		{ id: "ember", name: "Ember coat" },
		{ id: "sky", name: "Sky traveler" },
		{ id: "royal", name: "Royal mantle" }
	],
	readProgress() {
		try {
			return JSON.parse(localStorage.getItem(window.wordwiseProgressStorageKey) || "{}") || {};
		} catch {
			return {};
		}
	},
	writeAdventure(adventure) {
		const progress = this.readProgress();
		progress.adventure = { ...adventure };
		try {
			localStorage.setItem(window.wordwiseProgressStorageKey, JSON.stringify(progress));
			document.querySelector("#save-label").textContent = "Progress saved on this device";
		} catch {
			document.querySelector("#save-label").textContent = "Could not save progress";
		}
	},
	learnedWords() {
		const progress = this.readProgress();
		const meanings = new Map(Object.values(this.vocabulary).flat().map(([word, meaning]) => [word, meaning]));
		return [...new Set(Object.values(progress.learnedByCategory || {}).flatMap((words) => Array.isArray(words) ? words : []))]
			.filter((word) => meanings.has(word));
	},
	meanings() {
		return new Map(Object.values(this.vocabulary).flat().map(([word, meaning]) => [word, meaning]));
	},
	readAdventure() {
		const saved = this.readProgress().adventure || {};
		const adventure = {
			highestCompleted: Number.isInteger(saved.highestCompleted) ? saved.highestCompleted : 0,
			xp: Number.isFinite(saved.xp) ? saved.xp : 0,
			costumePoints: Number.isFinite(saved.costumePoints) ? saved.costumePoints : 0,
			upgrades: Number.isInteger(saved.upgrades) ? saved.upgrades : 0,
			ownedCostumes: Array.isArray(saved.ownedCostumes) ? saved.ownedCostumes : ["starter"],
			selectedCostume: saved.selectedCostume || "starter",
			equippedWords: Array.isArray(saved.equippedWords) ? saved.equippedWords : []
		};
		if (!adventure.ownedCostumes.includes("starter")) adventure.ownedCostumes.unshift("starter");
		if (!adventure.ownedCostumes.includes(adventure.selectedCostume)) adventure.selectedCostume = "starter";
		return adventure;
	}
};