/*
    Inlämningsuppgift 1 - FE23 Javascript 2
    Kristoffer Bengtsson
    Yasir Kakar

    Class: Player
    Defines a player in the game, with their game state and choice of name and fighter-type.
*/
import FighterType from "./FighterType.js";
import StatusEffect from "./StatusEffect.js";
import AttackSkill from "./AttackSkill.js";

export default class Player {
    #playerId;
    #playerName;
    #currentHealth;
    #fighterType;
    #statusEffects;
    #combatRound;


    constructor(playerName, fighterType) {
        if ((typeof fighterType !== "object") || !(fighterType instanceof FighterType)) {
            throw new Error("Invalid fighter type specified!");
        }

        this.name = playerName;
        this.#fighterType = fighterType;
        this.#currentHealth = this.#fighterType.maxHealth;
        this.#statusEffects = [];
        this.#combatRound = 0;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Get ID of the player
    get id() {
        return this.#playerId;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Set the ID of the player
    set id(newID) {
        if ((newID == 1) || (newID == 2)) {
            this.#playerId = newID;
        }
        else {
            throw new Error("The player ID must be either 1 or 2.");
        }
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Get the name of the player
    get name() {
        return this.#playerName;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Change the name of the player
    set name(newName) {
        if ((typeof newName !== "string") || (newName.length < 2) || (newName.length > 20)) {
            throw new Error("The player name must be a string between 2 and 20 characters in length.");
        }
        this.#playerName = newName;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Get the current health of the player
    get health() {
        return this.#currentHealth;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Get the size of the health pool of the player (depends on chosen fighter type)
    get maxHealth() {
        return this.#fighterType.maxHealth;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Get the class/fighter type of the player
    get type() {
        return this.#fighterType;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Get the effective defense bonus value of the player
    get armor() {
        return this.type.armor + (this.hasStatusEffect("evade") ? 15 : 0);
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Get the value of the combat round counter for the player
    get round() {
        return this.#combatRound;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Increment the combat round counter of the player
    incrementRound() {
        this.#combatRound++;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Damage the player by the specified amount (capped at 0)
    takeDamage(damageAmount) {
        if (typeof damageAmount === "string") {
            damageAmount = parseInt(damageAmount);
        }
        if (damageAmount > 0) {
            damageAmount = Math.min(damageAmount, this.#currentHealth);
            this.#currentHealth -= damageAmount;
        }
        return damageAmount;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Heal the player the specified amount (capped at the health pool size)
    heal(healAmount) {
        if (typeof healAmount === "string") {
            healAmount = parseInt(healAmount);
        }
        if (healAmount > 0) {
            healAmount = (this.#currentHealth + healAmount > this.type.maxHealth ? this.type.maxHealth - this.#currentHealth : healAmount);
            this.#currentHealth += healAmount;
        }
        return healAmount;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Apply a status effect to the player
    addStatusEffect(effectType, duration) {
        if (AttackSkill.statusEffects.includes(effectType) && (duration > 0)) {
            this.#statusEffects.push(new StatusEffect(effectType, duration, this));
        }
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Remove a status effect from the player
    removeStatusEffect(effectType) {
        let removeCount = 0;

        if (AttackSkill.statusEffects.includes(effectType)) {
            const updatedStatusList = [];

            for (const status of this.#statusEffects) {
                if (status.effectType != effectType) {
                    updatedStatusList.push(status);
                }
                else {
                    removeCount++;
                    status.expireMessage();
                }
            }
            this.#statusEffects = updatedStatusList;
        }

        return removeCount;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Check if this player has a status effect of the specified type applied. 
    hasStatusEffect(effectType) {
        for (const status of this.#statusEffects) {
            if (status.effectType == effectType) {
                return true;
            }
        }
        return false;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Get an array listing all status effects applied to the player.  
    getStatusEffects() {
        const statusList = [];
        for (const status of this.#statusEffects) {
            statusList.push(`<span class="status-${status.effectType}">${status.effectName} [${parseInt(status.duration)}]</span>`);
        }
        return statusList;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Update duration of any status effects applied to the player and proc 
    // effects that apply per round. 
    updateStatusEffects() {
        const updatedStatusList = [];
        for (let i = 0; i < this.#statusEffects.length; i++) {
            const status = this.#statusEffects[i];

            status.turnProc();
            if (status.duration > 0) {
                updatedStatusList.push(status);
            }
            else {
                status.expireMessage();
            }
        }
        this.#statusEffects = updatedStatusList;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Make the player use the skill with the specified name
    useSkill(attackSkill, opponentPlayer) {
        const skillObj = this.type.getAttackSkill(attackSkill);

        if ((skillObj === undefined) || (skillObj === null)) {
            throw new Error(`The skill ${attackSkill} is not known to a ${this.type}!`);
        }

        const skillDmg = skillObj.use(opponentPlayer, this);
        return { roll: skillDmg, skill: skillObj };
    }
}