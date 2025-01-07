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
			victories: 0,
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

function playATurn() {
	const allPlayCardFields = document.querySelectorAll(".playCard");
	let pot = [];

	// -- EVERONE PLAYS A CARD --
	allPlayCardFields.forEach(function (playField) {
		players.forEach(function (player) {
			if (player.number == playField.id) {
				const playedCard = player.cards.pop();
				const object = {
					player: player.number,
					playedCard: playedCard,
					number: getNumber(playedCard),
				};
				pot.push(object);
				playField.style.backgroundImage = `url(./images/${playedCard}.svg`;
			}
		});
	});

	// -- DETERMINE THE WINNER --
	pot.sort((a, b) => (a.number > b.number ? 1 : b.number > a.number ? -1 : 0));
	const winner = pot[0].player;
	pot.forEach(function (card) {
		players.forEach(function (player) {
			if (player.number == winner) {
				player.cards.push(card.playedCard);
			}
		});
	});
	console.log(players);
}

function createPlayers() {
	for (let i = 0; i < playerAmount; i++) {
		const element = `<div class="player" id="${players[i].number}">
			<div class="cards">
				<p>${players[i].cards.length}</p>
			</div>
				<div class="hand">
			</div>
				<div class="playCard" id="${players[i].number}">
			</div>
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
		const element = `<div class="nameInput"><label for="player${playerNumber}">Player ${playerNumber}: </label><input id="player${playerNumber}" name="player${playerNumber}" type="text" placeholder="name" required /></div>`;
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
	console.log(players);
}

function getNumber(string) {
	const [number] = string.match(/(\d+)/);
	return number;
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
