$(document).ready(function() {

	/****************************** 
	 * Global Variables 
	 *****************************/
	var socket = io.connect(window.location.host);
	var games;
	var clues;
	var lettersToReveal;
	var revealedLetters;
	var playerScores;
	var roundNumber;
	var activePlayer;
	
	
	
	
	/****************************** 
	 * Initialisation
	 *****************************/
	setupGames();
	setupPlayers();
	newGame();
	
	
	
	/****************************** 
	 * Event Listeners 
	 *****************************/
	$('.letter').bind('click', checkLetter);
	$('#new-game-btn').bind('click', newGame);
	$('.player').bind('click', selectActivePlayer);
	
	
	
	/****************************** 
	 * Socket.io Listeners and Emitters 
	 *****************************/
	socket.on('addplayer', function(playerId, players) {
  		$("#player-" + playerId + " .player-name").text(players[playerId]).removeClass("enter-name");
  		
  	});
	
	socket.on('activePlayer', function(id) {
		$(".player").removeClass("active");
		$("#player-"+id).addClass("active");
	});
	
	socket.on('players', function(players) {
		for (var i = 1; i < 4; i++) {
			if (players[i]) {
				$("#player-" + i + " .player-name").text(players[i]).removeClass('enter-name');
			}
		}
	});
	
	socket.on('clientLettersUsed', function(letters) {
		$(letters).each(function(index, value) {
			$("#letter-"+value).removeClass('letter').addClass('letter-used');
		});
	});
	
	socket.on('clientLetterPressed', function(letter) {
		$this = $("#letter-"+letter);
		$this.removeClass("letter");
		$this.addClass("letter-used");
		var letter = $this.attr('id').replace('letter-', '');
		var scoreUpdated = false;
		$('.cell').each(function(index) {
			if ($(this).text() == "") { return true; }
			if ($(this).text() == letter) {
				$(this).removeClass("cell-hide");
				$(this).addClass("cell-reveal");
				revealedLetters++;
				if (!scoreUpdated) {
					updatePlayerScore(activePlayer, 100);
					scoreUpdated = true;
				}
			}
		});
		if (revealedLetters == lettersToReveal) {
			$("#end-screen").show();
		}
	});
	

	
	/****************************** 
	 * Game Functions 
	 *****************************/
	function newGame() {
		$("#end-screen").hide();
		resetBoard();
		loadGame(prompt('Enter game id'));
		activePlayer = 1;
		selectPlayer(activePlayer);
	}

	function resetBoard() {
		$(".cell").each(function() {
			$(this).removeClass("cell-hide cell-reveal");
			$(this).text('');
		});
		$('#letters-container div').each(function() {
			$(this).removeClass("letter-used");
			$(this).addClass("letter");
		});
	}

	function loadGame(id) {
		$("#clue-text").text(clues[id]);
		lettersToReveal = 0;
		revealedLetters = 0;
		for (i = 0; i < 56; i++) {
			if (games[id][i] == "") { continue; }
			if (games[id][i] == "," || games[id][i] == "?") {
			} else {
				lettersToReveal++;
			}
			var cellId = i + 1;
			$("#cell-"+cellId).text(games[id][i]);
		}
		prepareBoard();
	}

	function prepareBoard() {
		$(".cell").each(function(index) {
			var $this = $(this);
			if ($this.text() != "") {
				if ($this.text() == "," || $this.text() == "?") {
					$this.addClass('cell-reveal');
				} else {
					$this.addClass('cell-hide');
				}
			}
		});
	}

	function setupPlayers() {
		
		playerScores = new Array(3);
		
		for (var i = 1; i < 4; i++) {
			playerScores[i] = 0;
			$("#player-" + i + " .player-score").text('$' + playerScores[i]);
		}
	}

	function updatePlayerScore(id, value) {
		playerScores[id] += value;
		$("#player-" + id + " .player-score").text('$' + playerScores[id]);	
	}

	function setupGames() {
		games = new Array();
		clues = new Array();

		clues[0] = "Phrase";
		games[0] = ['', '', '', '', '', '', '', '', '', '', '', '', '', '',
					'', 's', 'k', 'i', 'm', '', 't', 'h', 'e', '', '', '', '', '',
					'', 's', 'u', 'r', 'f', 'a', 'c', 'e', '', '', '', '', '', '',
					'', '', '', '', '', '', '', '', '', '', '', '', '', ''];

		clues[1] = "People";
		games[1] = ['', '', '', '', '', '', '', '', '', '', '', '', '', '',
					'', 'p', 'e', 'p', '', 's', 'q', 'u', 'a', 'd', '', '', '', '',
					'', '', '', '', '', '', '', '', '', '', '', '', '', '',
					'', '', '', '', '', '', '', '', '', '', '', '', '', ''];

		clues[2] = "Place";
		games[2] = ['', '', '', '', '', '', '', '', '', '', '', '', '', '',
					'', 'i', 'n', '', 't', 'h', 'e', '', '', '', '', '', '', '',
					'', 'f', 'o', 'r', 'e', 'g', 'r', 'o', 'u', 'n', 'd', '', '', '',
					'', '', '', '', '', '', '', '', '', '', '', '', '', ''];

		clues[3] = "Question";
		games[3] = ['', '', 'j', 'a', 'd', 'e', ',', '', 'w', 'i', 'l', 'l', '', '',
					'', '', 'y', 'o', 'u', '', 'm', 'a', 'r', 'r', 'y', '', '', '',
					'', '', 'm', 'a', 't', 't', '?', '', '', '', '', '', '', '',
					'', '', '', '', '', '', '', '', '', '', '', '', '', ''];

		clues[4] = "Question";
		games[4] = ['', 'a', '', '', '', '', '', '', '', '', '', '', '', '',
					'', '', '', '', '', '', '', '', '', '', '', '', '', '',
					'', '', '', '', '', '', '', '', '', '', '', '', '', '',
					'', '', '', '', '', '', '', '', '', '', '', '', '', ''];
	}

	function checkLetter() {
		var $this = $(this);
		if ($this.hasClass("letter-used")) { return true; }
		socket.emit('serverLetterPressed', $this.attr('id').replace('letter-', ''));
	}

	function selectPlayer(id) {
		socket.emit('selectPlayer', id);
	}

	function selectActivePlayer() {
		activePlayer = $(this).attr('id').replace('player-', '');
		if ($(this).children().hasClass('enter-name')) {
			socket.emit('initialisePlayer', activePlayer, prompt("Please enter player's name"));
		}
		selectPlayer(activePlayer);
	}

});
