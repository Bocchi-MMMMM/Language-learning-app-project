const accountsStorageKey = "wordwiseAccounts";
const sessionStorageKey = "wordwiseCurrentUser";
const legacyProgressKey = "wordwiseProgress";
const legacyOwnerKey = "wordwiseLegacyProgressOwner";
const progressKeyForUser = (username) => `wordwiseProgress:${username}`;

function readAccounts() {
	try {
		const storedAccounts = JSON.parse(localStorage.getItem(accountsStorageKey) || "{}");
		return storedAccounts && typeof storedAccounts === "object" && !Array.isArray(storedAccounts) ? storedAccounts : {};
	} catch {
		return {};
	}
}

function migrateLegacyProgress(username) {
	const userProgressKey = progressKeyForUser(username);
	if (localStorage.getItem(userProgressKey)) return;

	const legacyProgress = localStorage.getItem(legacyProgressKey);
	const legacyOwner = localStorage.getItem(legacyOwnerKey);
	if (legacyProgress && (!legacyOwner || legacyOwner === username)) {
		localStorage.setItem(userProgressKey, legacyProgress);
		localStorage.setItem(legacyOwnerKey, username);
		localStorage.removeItem(legacyProgressKey);
	} else {
		localStorage.setItem(userProgressKey, "{}");
	}
}

function encodeBytes(bytes) {
	return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
}

async function hashPassword(password, salt) {
	const saltBytes = salt ? Uint8Array.from(atob(salt), (character) => character.charCodeAt(0)) : window.crypto.getRandomValues(new Uint8Array(16));
	const key = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
	const derivedBits = await window.crypto.subtle.deriveBits({ name: "PBKDF2", salt: saltBytes, iterations: 120000, hash: "SHA-256" }, key, 256);
	return { hash: encodeBytes(new Uint8Array(derivedBits)), salt: salt || encodeBytes(saltBytes) };
}

function addAccountControls(username) {
	const bar = document.createElement("section");
	bar.className = "wordwise-account-bar";
	bar.setAttribute("aria-label", "Account controls");
	const accountLabel = document.createElement("span");
	accountLabel.className = "wordwise-account-name";
	accountLabel.textContent = `Signed in as ${username}`;
	const actions = document.createElement("div");
	actions.className = "wordwise-account-actions";
	const resetButton = document.createElement("button");
	resetButton.type = "button";
	resetButton.textContent = "Reset all";
	resetButton.addEventListener("click", () => {
		if (!window.confirm("Clear this account's learning progress and sign out? Your account will remain.")) return;
		window.wordwiseResettingProgress = true;
		localStorage.removeItem(progressKeyForUser(username));
		localStorage.removeItem(sessionStorageKey);
		window.location.assign("user.html");
	});
	const exitButton = document.createElement("button");
	exitButton.type = "button";
	exitButton.textContent = "Exit";
	exitButton.setAttribute("aria-label", "Exit account and keep progress");
	exitButton.addEventListener("click", () => {
		localStorage.removeItem(sessionStorageKey);
		window.location.assign("user.html");
	});
	actions.append(resetButton, exitButton);
	bar.append(accountLabel, actions);
	document.body.prepend(bar);
}

function initLoginPage() {
	const accounts = readAccounts();
	const currentUser = localStorage.getItem(sessionStorageKey);
	if (currentUser && Object.hasOwn(accounts, currentUser)) {
		window.location.replace("Category.html");
		return;
	}

	const form = document.querySelector("#account-form");
	const usernameInput = document.querySelector("#username");
	const passwordInput = document.querySelector("#password");
	const status = document.querySelector("#account-status");
	const submitButton = document.querySelector("#submit-account");
	const loginModeButton = document.querySelector("#login-mode");
	const createModeButton = document.querySelector("#create-mode");
	let mode = "login";

	function setMode(nextMode) {
		mode = nextMode;
		const isCreating = mode === "create";
		loginModeButton.setAttribute("aria-pressed", String(!isCreating));
		createModeButton.setAttribute("aria-pressed", String(isCreating));
		document.querySelector("#page-title").textContent = isCreating ? "Create account" : "Welcome back";
		submitButton.textContent = isCreating ? "Create account" : "Log in";
		passwordInput.autocomplete = isCreating ? "new-password" : "current-password";
		passwordInput.minLength = isCreating ? 8 : 1;
		status.textContent = "";
		status.removeAttribute("data-error");
	}

	loginModeButton.addEventListener("click", () => setMode("login"));
	createModeButton.addEventListener("click", () => setMode("create"));
	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		const username = usernameInput.value.trim().toLowerCase();
		const password = passwordInput.value;
		if (!/^[a-z0-9._-]{3,24}$/.test(username)) {
			status.dataset.error = "true";
			status.textContent = "Use 3 to 24 letters, numbers, periods, underscores, or hyphens for your username.";
			return;
		}
		if (!window.crypto?.subtle) {
			status.dataset.error = "true";
			status.textContent = "Secure local accounts are unavailable in this browser. Open the site through localhost or a secure connection.";
			return;
		}

		try {
			const storedAccounts = readAccounts();
			if (mode === "create") {
				if (password.length < 8) {
					status.dataset.error = "true";
					status.textContent = "Use a password with at least 8 characters.";
					return;
				}
				if (Object.hasOwn(storedAccounts, username)) {
					status.dataset.error = "true";
					status.textContent = "That username already exists. Log in or choose another.";
					return;
				}
				const credentials = await hashPassword(password);
				storedAccounts[username] = { salt: credentials.salt, passwordHash: credentials.hash, createdAt: new Date().toISOString() };
			} else {
				const account = storedAccounts[username];
				if (!account) {
					status.dataset.error = "true";
					status.textContent = "No account was found with that username.";
					return;
				}
				const credentials = await hashPassword(password, account.salt);
				if (credentials.hash !== account.passwordHash) {
					status.dataset.error = "true";
					status.textContent = "The password is incorrect.";
					return;
				}
				account.lastLoginAt = new Date().toISOString();
			}

			localStorage.setItem(accountsStorageKey, JSON.stringify(storedAccounts));
			migrateLegacyProgress(username);
			localStorage.setItem(sessionStorageKey, username);
			window.location.assign("Category.html");
		} catch {
			status.dataset.error = "true";
			status.textContent = "The account could not be saved in this browser. Check storage permissions and try again.";
		}
	});
}

const isLoginPage = window.location.pathname.endsWith("/user.html") || window.location.pathname === "user.html";
const activeUsername = localStorage.getItem(sessionStorageKey);
const knownAccounts = readAccounts();

if (isLoginPage) {
	initLoginPage();
} else if (!activeUsername || !Object.hasOwn(knownAccounts, activeUsername)) {
	window.wordwiseResettingProgress = true;
	document.body.hidden = true;
	localStorage.removeItem(sessionStorageKey);
	window.location.replace("user.html");
} else {
	window.wordwiseProgressStorageKey = progressKeyForUser(activeUsername);
	addAccountControls(activeUsername);
}
