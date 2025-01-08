"use strict";

let stage = "amount";
let playerAmount = 2;
let players = [];
let cardDeck = [];
createCardDeck();

// -- AMOUNT MENU --
document.getElementById("lessPlayers").addEventListener("click", function () {
	if (playerAmount > 2) {
		--playerAmount;
		document.getElementById("playerCount").innerHTML = playerAmount;
	}
});
document.getElementById("morePlayers").addEventListener("click", function () {
	if (playerAmount < 6) {
		++playerAmount;
		document.getElementById("playerCount").innerHTML = playerAmount;
	}
});
document.getElementById("playButton").addEventListener("click", function () {
	playerAmount = document.getElementById("playerCount").innerHTML;
	stage = "name";
	checkScreen();
	createNameForms(playerAmount);
});

// -- NAME MENU --
document.getElementById("playerNames").addEventListener("submit", function (e) {
	e.preventDefault();
	for (let i = 0; i < playerAmount; i++) {
		const playerNumber = i + 1;
		const player = {
			number: `player${playerNumber}`,
			name: document.getElementById(`player${playerNumber}`).value,
			cards: [],
			lost: false,
		};
		players.push(player);
	}
	stage = "play";
	checkScreen();
	startGame();
});

checkScreen();

function startGame() {
	createPlayers();
	distributeCards();
	playATurn();
}

async function playATurn() {
	addPlayAnimation();
	await sleep(1500);

	// -- EVERONE PLAYS A CARD --
	const pot = collectCards();
	updateCardAmount();
	setTimeout(removeCardAnimation, 400);

	await sleep(2000);

	// -- DETERMINE THE WINNER + CHECK DUPLICATES --
	const winner = determineWinner(pot);
	if (pot[0].number == pot[1].number) {
		const winners = [];
		pot.forEach(function (play) {
			if (play.number == pot[0].number) {
				winners.push(play);
			}
		});
		await handleTie(pot, winners);
		return;
	}

	await displayWinner(winner);
	assignCardsToWinner(winner, pot);

	checkPlayersLost();

	if (playerAmount > 1) {
		await sleep(2000);
		playATurn();
	}
}

function collectCards() {
	const allPlayCardFields = document.querySelectorAll(".playCard");
	let pot = [];

	allPlayCardFields.forEach((playField) => {
		players.forEach((player) => {
			if (!player.lost && player.number === playField.id) {
				const playedCard = player.cards.shift();
				const number = getNumber(playedCard);
				pot.push({
					player: player.number,
					playedCard,
					number,
				});
				playField.style.backgroundImage = `url(./images/${playedCard}.svg)`;
			}
		});
	});

	return pot;
}

function determineWinner(pot) {
	pot.sort((a, b) => b.number - a.number);

	if (pot[0].number === pot[1]?.number) {
		console.log("Tie detected!");
		return null;
	}

	return pot[0].player;
}

async function handleTie(pot, winners) {
	// -- PLAY HIDDEN CARD --
	addPlayAnimation();
	await sleep(1500); // Wacht op hand-animatie

	for (const winner of winners) {
		const playField = document.querySelector(`.playCard#${winner.player}`);
		const player = players.find((p) => p.number === winner.player);

		if (player && player.cards.length > 0) {
			const playedCard = player.cards.shift();
			const number = getNumber(playedCard);

			pot.push({
				player: winner.player,
				playedCard,
				number,
			});

			// Toon gedekte kaart
			playField.style.backgroundImage = `url(./images/0.svg)`;
		}
	}

	setTimeout(removeCardAnimation, 400);
	await sleep(2000); // Wacht na animatie

	// -- PLAY NEW CARD --
	const subPot = [];
	addPlayAnimation();
	await sleep(1500); // Wacht op hand-animatie

	for (const winner of winners) {
		const playField = document.querySelector(`.playCard#${winner.player}`);
		const player = players.find((p) => p.number === winner.player);

		if (player && player.cards.length > 0) {
			const playedCard = player.cards.shift();
			const number = getNumber(playedCard);

			subPot.push({
				player: winner.player,
				playedCard,
				number,
			});

			// Toon open kaart
			playField.style.backgroundImage = `url(./images/${playedCard}.svg)`;
		}
	}

	setTimeout(removeCardAnimation, 400);
	await sleep(2000); // Wacht na animatie

	// -- CHECK WINNER + DUPLICATES --
	const winner = determineWinner(subPot);
	if (subPot[0].number === subPot[1]?.number) {
		const newWinners = subPot.filter((card) => card.number === subPot[0].number);
		pot.push(...subPot);
		await handleTie(pot, newWinners); // Herhaal tie-breaker
		return;
	}

	await displayWinner(winner);

	pot.push(...subPot);
	assignCardsToWinner(winner, pot);

	checkPlayersLost();

	if (playerAmount > 1) {
		await sleep(2000);
		playATurn();
	}
}

async function displayWinner(winner) {
	const allPlayCardFields = document.querySelectorAll(".playCard");
	allPlayCardFields.forEach((playField) => {
		if (winner === playField.id) {
			playField.classList.add("winner");
		}
	});

	await sleep(2000);

	allPlayCardFields.forEach((playField) => {
		playField.classList.remove("winner");
	});
}

function assignCardsToWinner(winner, pot) {
	const winnerPlayer = players.find((player) => player.number === winner);
	if (winnerPlayer) {
		pot.forEach((card) => {
			winnerPlayer.cards.push(card.playedCard);
		});
	}

	updateCardAmount();
	removeCardsFromBoard();
}

function createPlayers() {
	for (let i = 0; i < playerAmount; i++) {
		const element = `<div class="player" id="${players[i].number}">
			<div class="cards">
				<p>${players[i].cards.length}</p>
			</div>
				<div class="hand" id="${players[i].number}">
			</div>
				<div class="playCard" id="${players[i].number}">
			</div>
			<h1 class="nameTag">${players[i].name}</h1>
		</div>`;
		if (i % 2) {
			document.getElementById("top").innerHTML += element;
		} else {
			document.getElementById("bottom").innerHTML += element;
		}
	}
}

function checkScreen() {
	if (stage == "amount") {
		document.getElementById("amountMenu").style.display = "flex";
		document.getElementById("nameMenu").style.display = "none";
		document.getElementById("playingField").style.display = "none";
	} else if (stage == "name") {
		document.getElementById("nameMenu").style.display = "flex";
		document.getElementById("amountMenu").style.display = "none";
		document.getElementById("playingField").style.display = "none";
	} else if (stage == "play") {
		document.getElementById("playingField").style.display = "flex";
		document.getElementById("amountMenu").style.display = "none";
		document.getElementById("nameMenu").style.display = "none";
	}
}

function createNameForms(playerAmount) {
	for (let i = 0; i < playerAmount; i++) {
		const playerNumber = i + 1;
		const element = `<div class="nameInput">
			<label for="player${playerNumber}">Player ${playerNumber}: </label>
			<input id="player${playerNumber}" name="player${playerNumber}" type="text" placeholder="name" required />
		</div>`;
		document.getElementById("submitNames").insertAdjacentHTML("beforebegin", element);
	}
}

function distributeCards() {
	let amountOfCards = cardDeck.length;
	let amountOfPlayers = players.length - 1;

	// -- SHUFFLE CARDS --
	const shuffle = (cards) => {
		for (let i = cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = cards[i];
			cards[i] = cards[j];
			cards[j] = temp;
		}
		return cards;
	};
	let shuffledCards = shuffle(cardDeck);

	// -- DISTRIBUTE CARDS --
	for (let i = amountOfCards; i > 0; --i) {
		players[amountOfPlayers].cards.push(shuffledCards.pop());
		--amountOfPlayers;
		if (amountOfPlayers < 0) {
			amountOfPlayers = players.length - 1;
		}
	}

	updateCardAmount();
}

function getNumber(string) {
	const [number] = string.match(/(\d+)/);
	return Number(number);
}

function createCardDeck() {
	let symbols = ["K", "S", "H", "R"];
	symbols.forEach(function (symbol) {
		for (let i = 2; i < 15; i++) {
			const card = symbol + i;
			cardDeck.push(card);
		}
	});
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function checkPlayersLost() {
	players.forEach(function (player) {
		if (player.cards.length == 0) {
			player.lost = true;
			--playerAmount;
		}
	});
}

function updateCardAmount() {
	const playerFields = document.querySelectorAll(".player");
	playerFields.forEach(function (playerField) {
		players.forEach(function (player) {
			if (playerField.id == player.number) {
				playerField.firstElementChild.innerHTML = `<p>${player.cards.length}</p>`;
			}
		});
	});
}

function removeCardsFromBoard() {
	const allPlayCardFields = document.querySelectorAll(".playCard");
	allPlayCardFields.forEach(function (playField) {
		playField.style.backgroundImage = "none";
	});
}

function addPlayAnimation() {
	const allHands = document.querySelectorAll(".hand");
	allHands.forEach(function (hand) {
		players.forEach(function (player) {
			if (hand.id == player.number) {
				hand.classList.add("playHand");
			}
		});
	});
}

function removeCardAnimation() {
	const allHands = document.querySelectorAll(".hand");
	allHands.forEach(function (hand) {
		hand.classList.remove("playHand");
	});
}
