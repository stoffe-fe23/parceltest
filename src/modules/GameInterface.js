
/*
    Inlämningsuppgift 1 - FE23 Javascript 2
    Kristoffer Bengtsson
    Yasir Kakar

    Class: GameInterface
    Class for managing the user interface and starting the game. 
    Accessed through the global gameInterface object created here. 
*/
import { createHTMLElement } from './utilities.js';
import Game from "./Game.js";
import Player from "./Player.js";
import Rogue from "./FighterTypes/Rogue.js";
import Warrior from "./FighterTypes/Warrior.js";
import Mage from "./FighterTypes/Mage.js";
import StatusEffect from './StatusEffect.js';

// Images
import imgUrlWarrior from "../images/warrior.png";
import imgUrlRogue from "../images/rogue.png";
import imgUrlMage from "../images/mage.png";
import imgUrlArrowRight from "../images/archerright.png";
import imgUrlArrowLeft from "../images/archerleft.png";


class GameInterface {
    #game;
    #parentElement;
    #messagesElement;
    #errorsElement;
    #playerElements;
    #playerOne;
    #playerTwo;
    #playerIndicator;


    constructor(parentElement) {
        this.#parentElement = parentElement;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Build the main game interface and start the match.
    startGame(player1, player2) {
        this.#parentElement.innerHTML = '';
        this.#playerElements = createHTMLElement('div', '', this.#parentElement, 'game-players', { id: "players" });
        this.#errorsElement = createHTMLElement('div', '', this.#parentElement, 'game-errors', { id: "errors" });
        this.#messagesElement = createHTMLElement('div', '', this.#parentElement, 'game-messages', { id: "messages" });

        this.#playerOne = createHTMLElement('div', '', this.#playerElements, 'game-player', { id: `player-1` });
        this.#playerIndicator = createHTMLElement('div', '', this.#playerElements, 'game-player-indicator', { id: `player-indicator` });
        this.#playerTwo = createHTMLElement('div', '', this.#playerElements, 'game-player', { id: `player-2` });

        this.#game = new Game(
            new Player(player1.name, this.#createPlayerType(player1.type)),
            new Player(player2.name, this.#createPlayerType(player2.type))
        );

        this.#game.nextPlayerTurn();
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Create fighter type class depending on type value string from form.
    #createPlayerType(typeName) {
        switch (typeName) {
            case "warrior": return new Warrior();
            case "rogue": return new Rogue();
            case "mage": return new Mage();
        }
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Set which player should be marked as the current/active player on the UI
    setCurrentPlayer(playerNumber) {
        this.#playerIndicator.innerHTML = " ";
        if (playerNumber == 1) {
            createHTMLElement('img', 'Arrow', this.#playerIndicator, "player-indicator-archer", { src: imgUrlArrowRight })
            this.#playerOne.classList.add("activeplayer");
            this.#playerTwo.classList.remove("activeplayer");
        }
        else {
            createHTMLElement('img', 'Arrow', this.#playerIndicator, "player-indicator-archer", { src: imgUrlArrowLeft })
            this.#playerOne.classList.remove("activeplayer");
            this.#playerTwo.classList.add("activeplayer");
        }
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Set the color of the player's avatar box (css class)
    setPlayerColor(playerNumber, playerStyle) {
        if (playerNumber == 1) {
            this.#playerOne.classList.add(playerStyle);
        }
        else {
            this.#playerTwo.classList.add(playerStyle);
        }
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Get the HTML element box for the player with the specified ID
    getPlayerElement(playerIdx) {
        return this.#playerElements.querySelector(`#player-${playerIdx}`);
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Show a message to the player (combat log)
    showMessage(messageText) {
        this.#messagesElement.prepend(createHTMLElement('div', messageText, null, 'game-message', null, true));
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Show an error message to the player (red error box)
    showError(errorText) {
        const errorMsg = createHTMLElement('div', errorText, null, 'game-error', null, true);
        this.#errorsElement.prepend(errorMsg);
        this.#errorsElement.classList.add("show");

        // Hide error after 10 seconds
        setTimeout(() => {
            errorMsg.remove();
            if (this.#errorsElement.children.length <= 0) {
                this.#errorsElement.classList.remove("show");
            }
        }, 10000);
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Visually indicate the player's action between the avatar boxes
    showPlayerMove(player, opponent, skillName, skillResult) {
        // Disable buttons for both players while the action is displayed... 
        document.querySelectorAll(".skill-button-wrapper").forEach((buttonPanel) => {
            buttonPanel.disabled = true;
        });

        // Skill icon
        createHTMLElement(`img`, skillName, this.#playerIndicator, "feedback-skillIcon", { src: skillResult.skill.icon });

        // Damage or healing amount
        if (skillResult.roll !== 0) {
            createHTMLElement(`p`, `${skillResult.roll !== null ? skillResult.roll : "Miss!"}`, this.#playerIndicator, (skillResult.skill.target == "self" ? "feedback-healing" : "feedback-damage"));
        }

        // Status effect, if any, if the skill hits
        if ((skillResult.roll !== null) && (skillResult.skill.status !== "none")) {
            createHTMLElement('div', StatusEffect.getEffectName(skillResult.skill.status), this.#playerIndicator, ['feedback-statuseffect', `status-${skillResult.skill.status}`]);
        }

        // Pause briefly while displaying the action before continuing next player turn.
        setTimeout(() => { this.#game.nextPlayerTurn(); }, 2000);
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Show the game over box, declaring the winner. 
    showGameOverScreen(winnerName) {
        const gameoverBox = createHTMLElement('dialog', '', document.body, 'game-over', { id: "gameover" });
        createHTMLElement('h2', 'Game Over!', gameoverBox, 'game-over-title', { id: "gameover-title" });
        createHTMLElement('div', `${winnerName} is victorious!`, gameoverBox, 'game-over-text', { id: "gameover-text" });

        // Button: New game
        const restartButton = createHTMLElement('button', 'Play again!', gameoverBox, 'game-over-button', { id: "restart-button" });
        restartButton.addEventListener("click", (event) => {
            gameoverBox.close();
            gameoverBox.remove();
            this.newGame();
        });

        // Button: Dismiss game over box
        const endButton = createHTMLElement('button', 'OK', gameoverBox, 'game-over-button', { id: "gameover-button" });
        endButton.addEventListener("click", (event) => {
            gameoverBox.close();
            gameoverBox.remove();
        });

        gameoverBox.showModal();
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Show the new game character creation screen
    newGame() {
        this.#parentElement.innerHTML = '';

        const newPlayersForm = createHTMLElement('form', '', this.#parentElement, 'new-players-form', { id: 'new-players-form' });
        const newPlayersWrapper = createHTMLElement('div', '', newPlayersForm, 'new-players-wrapper', { id: 'new-players-wrapper' });
        const buttonsWrapper = createHTMLElement('div', '', newPlayersForm, 'start-game-button-wrapper');
        createHTMLElement('button', 'Start game!', buttonsWrapper, 'start-game-button', { id: 'start-game-button' });

        // Build boxes for both players
        this.#createNewPlayerBox(newPlayersWrapper, 'one');
        this.#createNewPlayerBox(newPlayersWrapper, 'two');

        newPlayersForm.addEventListener("submit", this.#onNewPlayersSubmit.bind(this));
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Form component for creating a new player
    #createNewPlayerBox(parentElement, playerNum) {
        const newPlayerBox = createHTMLElement('div', '', parentElement, 'new-player-box', { id: 'new-player-' + playerNum });
        createHTMLElement('h2', 'Player ' + (playerNum == "one" ? "1" : "2"), newPlayerBox, 'new-player-title');
        createHTMLElement('input', 'Choose your name:', newPlayerBox, 'new-player-name', { id: `new-player-${playerNum}-name`, type: 'text', minlength: '2', maxlength: '20', required: 'true' });
        createHTMLElement('label', 'Choose your class:', newPlayerBox, 'new-player-label', { for: `new-player-${playerNum}-class` });
        createHTMLElement('input', `<img src="${imgUrlWarrior}" alt="Warrior"> <span>Warrior</span>`, newPlayerBox, 'new-player-class', { id: `new-player-${playerNum}-class-warrior`, type: 'radio', name: `new-player-${playerNum}-class`, value: 'warrior', checked: "true" }, true);
        createHTMLElement('input', `<img src="${imgUrlRogue}" alt="Rogue"> <span>Rogue</span>`, newPlayerBox, 'new-player-class', { id: `new-player-${playerNum}-class-rogue`, type: 'radio', name: `new-player-${playerNum}-class`, value: 'rogue' }, true);
        createHTMLElement('input', `<img src="${imgUrlMage}" alt="Wizard"> <span>Wizard</span>`, newPlayerBox, 'new-player-class', { id: `new-player-${playerNum}-class-mage`, type: 'radio', name: `new-player-${playerNum}-class`, value: 'mage' }, true);
        return newPlayerBox;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // CharGen form submit handler: Start a new game when the players have chosen 
    // their name and fighter type.
    #onNewPlayersSubmit(event) {
        event.preventDefault();

        const player1 = {
            name: document.querySelector("#new-player-one-name").value.trim(),
            type: document.querySelector(`input[name="new-player-one-class"]:checked`).value
        };

        const player2 = {
            name: document.querySelector("#new-player-two-name").value.trim(),
            type: document.querySelector(`input[name="new-player-two-class"]:checked`).value
        };

        this.startGame(player1, player2);
    }
}


// Create gameInterface global object for managing the game. 
const gameInterface = new GameInterface(document.querySelector("#game"));

export default gameInterface;
