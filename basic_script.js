// TODO: 
// - fix bug with subsequent games rendering 'the game is over'
//		- probably to do with the game not being destroyed and/or the mutator not being successfully disconnected
// 		- hacky fix could be to just..... not render that text


var wordObj = function(){
	var that = {};
	var words = ["accoutrements", "acumen", "anomalistic", "auspicious", "bellwether", "callipygian", "circumlocution", "concupiscent", "conviviality", "coruscant", "cuddlesome", "cupidity", "cynosure", "ebullient", "equanimity", "excogitate", "gasconading", "idiosyncratic", "luminescent", "magnanimous", "nidificate", "osculator", "parsimonious", "penultimate", "perfidiousness", "perspicacious", "proficuous", "remunerative", "saxicolous", "sesquipedalian", "superabundant", "unencumbered", "unparagoned", "usufruct", "winebibber"];
	var getRandomWord = function(){
		return words[Math.floor(Math.random() * (words.length - 0) + 0)];
	};
	that.getRandomWord = getRandomWord;
	return that;
};
// needs getFormattedHangman defined in otherFuncs
var messageObj = function(sendMessageFunc, sendMessageOptions, otherFuncs){
	var that = {};
	that.sendMessage = sendMessageFunc;
	var letterGuessed = function(player, letter){
		that.sendMessage(player.name + " successfully guessed the letter " + letter, sendMessageOptions);
	},
	failedGuess = function(player, letter){
		that.sendMessage(player.name + ":\n"+otherFuncs.getFormattedHangman(player.getLives()), sendMessageOptions);
	},
	gameIsOver = function(){
		otherFuncs.getFormattedHangman(0);
		that.sendMessage("The game is over.", sendMessageOptions);
		// startAgainQuestion();
	},
	showWordSoFar = function(guessedArray){
		that.sendMessage(guessedArray.join(" "), sendMessageOptions);
	},
	defeat = function(losingPlayer){
		that.sendMessage(losingPlayer.name + " is out of the game!", sendMessageOptions);
	},
	victory = function(winningPlayer, word){
		that.sendMessage("Congratulations! " + winningPlayer.name + " has won! The word was: \n\"" + word+"\"", sendMessageOptions);
	},
	prevGuessedLetter = function(player, letter){
		that.sendMessage(player.name + "! Stop it. \"" + letter + "\" has already been guessed!", sendMessageOptions);
	},
	prevGuessedWord = function(player, word){
		that.sendMessage(player.name + "! Stop that. \"" + word + "\" has already been guessed!", sendMessageOptions);
	},
	startAgainQuestion = function(){
		// TODO: what to do to start new game???
		that.sendMessage("If you wish to start a new game, do something about it yo.", sendMessageOptions);
	},
	beginGame = function(players, guessedArray){
		var playerNames = [];
		for(var key in players){
			playerNames.push(players[key].name); 
		}
		that.sendMessage("A new game has begun with the following players: "+playerNames.join(", ")+". The clue is: \n"+guessedArray.join(" "), sendMessageOptions);
	};
	that.prevGuessedLetter = prevGuessedLetter;
	that.prevGuessedWord = prevGuessedWord;
	that.letterGuessed = letterGuessed;
	that.showWordSoFar = showWordSoFar;
	that.failedGuess = failedGuess;
	that.defeat = defeat;
	that.victory = victory;
	// that.startAgainQuestion = startAgainQuestion;
	that.gameIsOver = gameIsOver;
	that.beginGame = beginGame;
	return that;
};

var gameObj = function(options){
	var that = {};
	var gameActive,
		wordHelper,
		sendMessage,
		word,
		guessedArray,
		wordArray,
		domObserver,
		prevGuessedLetters = [],
		prevGuessedWords = [],
		players = [];

	var setup = function(options){
		gameActive = true;
		wordHelper = new wordObj();
		sendMessage = new messageObj(options.sendMessageFunc, options.sendMessageOptions, options.otherFuncs);
		word = wordHelper.getRandomWord();
		domObserver = options.domObserver;
		wordArray = word.split("");
		// create array with an underscore for each letter in word
		guessedArray = new Array(wordArray.length + 1).join("_").split("");
		players = options.players;
		sendMessage.beginGame(players, guessedArray);
	},
	hasPreviouslyGuessedLetter = function(guessedLetter){
		return prevGuessedLetters.indexOf(guessedLetter) !== -1;
	},
	hasPreviouslyGuessedWord = function(guessedWord){
		return prevGuessedWords.indexOf(guessedWord) !== -1;
	},
	guessLetter = function(player, guessedLetter){
		if(!gameActive){
			sendMessage.gameIsOver();
			return false;
		}
		var guessed = false;
		if(hasPreviouslyGuessedLetter(guessedLetter)){
			sendMessage.prevGuessedLetter(player, guessedLetter);
			return false;
		}
		prevGuessedLetters.push(guessedLetter);
		for(var key in wordArray){
			if(lettersMatch(wordArray[key], guessedLetter)){
				guessed = true;
				updateGuessedArray(key, guessedLetter);
			}
		}
		if(!guessed){
			player.deductLife();
			if(player.isAlive()){
				sendMessage.failedGuess(player, guessedLetter);			
				sendMessage.showWordSoFar(guessedArray);
			}else{
				gameOver(player);
			}
		}else{
			// sendMessage.letterGuessed(player, guessedLetter);
			sendMessage.showWordSoFar(guessedArray);
			if(wordIsComplete()){
				endGame(player);
			}
		}
		return guessed;
	},
	wordIsComplete = function(){
		return guessedArray.indexOf("_") === -1;
	},
	lettersMatch = function(actualLetter, guessedLetter){
		return actualLetter == guessedLetter;
	},
	updateGuessedArray = function(key, letter){
		guessedArray[key] = letter;
	},
	gameOver = function(losingPlayer){
		sendMessage.defeat(losingPlayer);
		removePlayerFromGame(losingPlayer);
		if(singlePlayerRemaining()){
			endGame();
		}
		options.domObserver.disconnect();
		// delete(that);
	},
	endGame = function(winningPlayer){
		var name;
		if(winningPlayer == null){
			// if no specified winning player assume the only player remaining wins
			winningPlayer = players[0];
		}
		gameActive = false;
		sendMessage.victory(winningPlayer, word);
		// sendMessage.startAgainQuestion();
	},
	singlePlayerRemaining = function(){
		return players.length === 1;
	},
	removePlayerFromGame = function(player){
		for(var key in players){
			if(players[key] == player){
				players.splice(key, 1);
				return true;
			}
		}
		return false;
	},
	guessWord = function(player, guessedWord){
		if(!gameActive){
			sendMessage.gameIsOver();
			return false;
		}
		if(hasPreviouslyGuessedWord(guessedWord)){
			sendMessage.prevGuessedWord(player, guessedWord);
			return false;
		}
		prevGuessedWords.push(guessedWord);

		if(guessedWord == word){
			endGame(player);
			return true;
		}else{
			player.deductLife();
			if(player.isAlive()){
				sendMessage.failedGuess(player, guessedWord);			
				sendMessage.showWordSoFar(guessedArray);
			}else{
				gameOver(player);
			}
			return false;
		}
	};

	setup(options);
	that.gameActive = gameActive;
	that.guessLetter = guessLetter;
	that.guessWord = guessWord;
	return that;
};

var player = function(playerName){
	var that = {};
	var lives = 7, name = playerName, game = gameObj;

	var deductLife = function(){
		lives--;
	},
	getLives = function(){
		return lives;
	},
	isAlive = function(){
		return lives > 0;
	};
	that.name = name;
	that.deductLife = deductLife;
	that.getLives = getLives;
	that.isAlive = isAlive;
	return that;
};



/// FB UI code
// limitations:
// games disappear when refreshing/moving page
var getPlayers = function(button){
	var currentUser = document.querySelector('._2dpb').textContent;
	var otherUsers = button.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector('.titlebarText').textContent;
	otherUsers = otherUsers.split(", ");
	var players = [new player(currentUser)];
	for(var key in otherUsers){
		var firstName = otherUsers[key].split(" ")[0];
		players.push(new player(firstName));
	}
	return players;
};

var resetButtons = function(){
	// var hangmanBtns = document.querySelectorAll('._1dwg');
	var hangmanBtns = document.querySelectorAll('.fb-hangman-btn');
	var i;
	for(i = 0; i < hangmanBtns.length; i++){
		var hangmanBtnParent = hangmanBtns[i].parentNode;
		hangmanBtnParent.removeChild(hangmanBtns[i]); 
	}
	var buttonWrappers = document.querySelectorAll('._552n');
	for(i = 0; i < buttonWrappers.length; i++){
		buttonWrappers[i].insertAdjacentHTML('beforeend', '<button class="fb-hangman-btn">H</button>');
	}
};

var sendMessageFunc = function(message, messageOptions){
	var o = messageOptions.button.parentNode.parentNode.getElementsByClassName("uiTextareaAutogrow _552m");
	var chatTextBox = o[0];
	var prevValue = chatTextBox.value;
	chatTextBox.value = "HM: " + message;
	var e = new Event("keydown");
	e.keyCode = 13;
	chatTextBox.dispatchEvent(e);
	chatTextBox.value = prevValue; // designed to put back what you were writing if you were in the middle of typing. Probably not working though cos it's hard to coordinate with people.
};
// index is the number of lives
var getFormattedHangman = function(lives){
	return [
		'_____\n|          |\n|         o\n|        / | \\\n|         / \\\n|__________',
		'_____\n|          |\n|         o\n|        / | \\\n|         / \n|__________',
		'_____\n|          |\n|         o\n|        / | \\\n|         \n|__________',
		'_____\n|          |\n|         o\n|          | \\\n|         \n|__________',
		'_____\n|          |\n|         o\n|          | \n|         \n|__________',
		'_____\n|          |\n|         o\n|          \n|         \n|__________',
		'_____\n|          |\n|         \n|          \n|         \n|__________',
		'_____\n|          \n|         \n|          \n|         \n|__________',
	][lives];
};
var failedGuess = function(message, messageOptions){
	this.sendMessage(player.name + ":\n"+getHangman(player.lives), messageOptions);
};
var buttonHandler = function(){
	var startNewGame = confirm("Start a new game?");
	if(!startNewGame)
		return false;
	var game;
	var that = this;
	var players = getPlayers(this);
	var domObserver = new MutationObserver(function(mutations){
		mutations.forEach(function(mutation){
			var player;
			var newChat = mutation.addedNodes[0];
			var newChatText = newChat.textContent;
			// the way it detects here which player has posted prevents more than 2 users from playing
			var isOwnerMsg = newChat.classList.contains('_1nc6') || newChat.querySelector('._1nc6') !== null;
			if(isOwnerMsg)
				player = players[0];
			else
				player = players[1];
			if(newChatText.indexOf('/') !== 0)
				return false;
			newChatText = newChatText.replace('/', '');
			if(newChatText.length === 1){
				game.guessLetter(player, newChatText);
			}else{
				game.guessWord(player, newChatText);
			}
		});
	});
	var observerConfig = {subtree: true, childList: true, characterData: true};
	var fbChatContainer = this.parentNode.parentNode.parentNode.querySelectorAll('.conversation');
	// get last of that class since for some reason there are multiple divs with this name
	fbChatContainer = fbChatContainer[fbChatContainer.length - 1];
	domObserver.observe(fbChatContainer, observerConfig);
	var sendMessageOptions = {'button':this};
	game = new gameObj({
		players:players,
		sendMessageFunc: sendMessageFunc,
		sendMessageOptions: sendMessageOptions,
		otherFuncs: {getFormattedHangman: getFormattedHangman},
		domObserver: domObserver
	});
	return true;
};

resetButtons();
var hangmanBtns = document.querySelectorAll('.fb-hangman-btn');
for(var i = 0; i < hangmanBtns.length; i++){
	hangmanBtns[i].addEventListener("click", buttonHandler);
}


// var domObserver = new MutationObserver(function(mutations){
// 	console.log('hello');
// });
// var observerConfig = {subtree: true, childList: true, characterData: true};
// var conversationEl = document.querySelector('._4tdv:last');
// domObserver.observe(conversationEl, observerConfig);