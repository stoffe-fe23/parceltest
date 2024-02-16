/*
    Inlämningsuppgift 1 - FE23 Javascript 2
    Kristoffer Bengtsson
    Yasir Kakar

    Class: Game
    Logic for controlling a match of the game. 
*/
import gameInterface from "./GameInterface.js";
import Player from "./Player.js";
import { createHTMLElement, setHTMLElement } from './utilities.js';

export default class Game {
    #gameRound = 0;
    #currentPlayer;
    #playerOne;
    #playerTwo;


    constructor(player1, player2) {
        if (!(player1 instanceof Player) || !(player2 instanceof Player)) {
            throw new Error("Invalid player encountered, unable to start match.");
        }

        this.#playerOne = player1;
        this.#playerTwo = player2;

        this.#playerOne.id = 1;
        this.#playerTwo.id = 2;

        gameInterface.setPlayerColor(1, this.#playerOne.type.style);
        gameInterface.setPlayerColor(2, this.#playerTwo.type.style);
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Get the player currently taking their turn
    get player() {
        return this.#currentPlayer;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Get the player currently waiting for their turn
    get opponent() {
        return (this.#currentPlayer === this.#playerOne ? this.#playerTwo : this.#playerOne);
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Update the game for a turn, passing control to the next player
    nextPlayerTurn() {
        // End game if anyone has gotten KO'd
        if (this.checkForGameOver()) {
            return;
        }

        // Increase round counter once both players have taken their turn. 
        if (this.#playerOne.round === this.#playerTwo.round) {
            this.#gameRound++;
        }

        // Pass control to next player
        this.#currentPlayer = this.opponent;
        this.#currentPlayer.incrementRound();

        // Skip this turn if the player is stunned
        if (this.#currentPlayer.hasStatusEffect("stun")) {
            gameInterface.showMessage(`<strong>Round ${this.#gameRound}:</strong> ${this.#currentPlayer.name} is stunned, skipping turn!`);
            this.#currentPlayer.updateStatusEffects();
            this.nextPlayerTurn();
            return;
        }

        gameInterface.showMessage(`<strong>Round ${this.#gameRound}:</strong> ${this.#currentPlayer.name}'s turn!`);
        gameInterface.setCurrentPlayer(this.#currentPlayer.id);

        // Process status effects
        this.#currentPlayer.updateStatusEffects();

        // Update displayed player info
        this.#buildPlayerAvatar(this.#playerOne);
        this.#buildPlayerAvatar(this.#playerTwo);

        // Game over if anyone is KO'd
        this.checkForGameOver();
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Check if either player has been knocked out.
    checkForGameOver() {
        if (this.#playerOne.health <= 0) {
            this.#doGameOver(this.#playerTwo, this.#playerOne);
            return true;
        }
        if (this.#playerTwo.health <= 0) {
            this.#doGameOver(this.#playerOne, this.#playerTwo);
            return true;
        }
        return false;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Someone got knocked out? Show the Game Over box.
    #doGameOver(winner, loser) {
        this.#gameRound = 0;
        this.#currentPlayer = null;

        gameInterface.showMessage(`<strong>GAME OVER:</strong> ${loser.name} is knocked out, ${winner.name} wins!`);
        gameInterface.showGameOverScreen(winner.name);
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Build/update the player info elements on the page
    #buildPlayerAvatar(player) {
        const outputElement = gameInterface.getPlayerElement(player.id);

        // Update elements if they exist, otherwise create them. 
        setHTMLElement('div', player.name, outputElement, 'player-name', { id: `player-${player.id}-name` });
        setHTMLElement('div', `<span>Class:</span> ${player.type.name}`, outputElement, 'player-class', { id: `player-${player.id}-class` }, true);
        setHTMLElement('div', `<span>Health:</span> ${player.health} / ${player.maxHealth}`, outputElement, 'player-health', { id: `player-${player.id}-health` }, true);
        setHTMLElement('div', `<span>Defense:</span> ${player.armor}`, outputElement, 'player-defense', { id: `player-${player.id}-defense` }, true);
        setHTMLElement('ul', player.getStatusEffects(), outputElement, 'player-effects', { id: `player-${player.id}-effects` }, true);
        setHTMLElement('img', 'Player avatar', outputElement, 'avatar-icon', { src: `${player.type.icon}` })

        // Build buttons for available skills
        this.#buildSkillButtons(player);
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Build the buttons with the player's available skills
    #buildSkillButtons(player) {
        const playerSkills = player.type.getAvailableSkills();
        const outputElement = gameInterface.getPlayerElement(player.id);
        let buttonContainer = outputElement.querySelector(".skill-buttons");
        let buttonWrapper;

        // If the skill button form does not exist, create it, otherwise use existing one.
        if ((buttonContainer === undefined) || (buttonContainer === null)) {
            buttonContainer = createHTMLElement('form', '', outputElement, 'skill-buttons', { id: `player-${player.id}-skills` });
            buttonWrapper = createHTMLElement('fieldset', '', buttonContainer, 'skill-button-wrapper');

            // Event handler for when the player clicks a skill button.
            buttonContainer.addEventListener("submit", (event) => {
                event.preventDefault();
                const usedSkill = event.submitter.getAttribute("skillname");
                const skillResult = this.player.useSkill(usedSkill, this.opponent);
                gameInterface.showPlayerMove(this.player, this.opponent, usedSkill, skillResult);
            });
        }
        else {
            buttonWrapper = buttonContainer.querySelector(".skill-button-wrapper");
        }

        buttonWrapper.innerHTML = '';

        // Disable the buttons for the player not taking this turn
        buttonWrapper.disabled = (player == this.#currentPlayer ? false : true);

        // Create a button for each skill the player has available to use.
        for (const skill of playerSkills) {
            const buttonId = "player-" + player.id + "-" + skill.name.toLowerCase().replaceAll(' ', '-');
            // If the skill has limited uses per match, show remaining uses on the buton.
            const buttonLabel = `<img src="${skill.icon}">` + (skill.uses === -1 ? skill.name : `${skill.name} (${skill.uses})`);
            createHTMLElement('button', buttonLabel, buttonWrapper, 'player-skill', { id: buttonId, skillname: skill.name }, true);
            createHTMLElement('div', skill.description, buttonWrapper, 'player-skill-tooltip');
        }
    }
}