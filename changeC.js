const vocabularySearch = document.querySelector("#word-search");
const vocabularyGrid = document.querySelector("#word-grid");
const vocabularyStatus = document.querySelector("#vocabulary-status");
const vocabularyCards = Array.from(vocabularyGrid.querySelectorAll(".word-tile"));

function editDistance(left, right) {
	let previousRow = Array.from({ length: right.length + 1 }, (_, index) => index);

	for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
		const currentRow = [leftIndex];
		for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
			const insertion = currentRow[rightIndex - 1] + 1;
			const deletion = previousRow[rightIndex] + 1;
			const substitution = previousRow[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
			currentRow[rightIndex] = Math.min(insertion, deletion, substitution);
		}
		previousRow = currentRow;
	}

	return previousRow[right.length];
}

function updateVocabulary() {
	const query = vocabularySearch.value.trim().toLowerCase();
	const directMatches = vocabularyCards.filter((card) => card.dataset.search.includes(query));
	let visibleTiles = directMatches;

	if (query && directMatches.length === 0) {
		visibleTiles = vocabularyCards
			.map((tile, index) => ({
				tile,
				index,
				distance: Math.min(
					editDistance(query, tile.dataset.word.toLowerCase()),
					editDistance(query, tile.dataset.meaning)
				)
			}))
			.sort((first, second) => first.distance - second.distance || first.index - second.index)
			.slice(0, 3)
			.map((result) => result.tile);
	}

	const visibleSet = new Set(visibleTiles);
	vocabularyCards.forEach((tile) => {
		tile.hidden = !visibleSet.has(tile);
	});

	if (!query) {
		vocabularyStatus.textContent = `Showing all ${vocabularyCards.length} words.`;
	} else if (directMatches.length > 0) {
		const label = directMatches.length === 1 ? "match" : "matches";
		vocabularyStatus.textContent = `${directMatches.length} ${label} found.`;
	} else {
		vocabularyStatus.textContent = `No direct matches. Showing the ${visibleTiles.length} closest words.`;
	}
}

vocabularySearch.addEventListener("input", updateVocabulary);
updateVocabulary();
