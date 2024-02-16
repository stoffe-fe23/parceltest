/*
    Inlämningsuppgift 1 - FE23 Javascript 2
    Kristoffer Bengtsson
    Yasir Kakar

    Class: AttackSkill
    Defines a type of skill or attack move a player can use (i.e. Firebolt, Stab, Heal etc)
*/
import gameInterface from "./GameInterface.js";


export default class AttackSkill {
    // Static lookup table for checking valid status effect types a skill may apply. 
    static statusEffects = ['none', 'heal', 'cure', 'evade', 'burn', 'stun', 'riposte'];
    #skillName;
    #skillDamageMin;
    #skillDamageMax;
    #skillUses;
    #skillTarget;
    #skillHitChance = 10;
    #skillIcon;
    #skillDescription;
    #skillStatus = 'none';
    #skillStatusDuration = 0;


    ///////////////////////////////////////////////////////////////////////////////
    // Set the name, damage range, number of uses and target of this skill
    constructor(name, damageMin, damageMax, hitChance = 10, charges = -1, target = 'enemy', statusEffect = 'none', icon = 'skill.png', description = '') {
        this.#skillName = name;
        this.#skillDamageMin = damageMin;
        this.#skillDamageMax = damageMax;
        this.#skillIcon = icon;
        this.#skillDescription = description;

        const [statusEffectType, statusEffectDuration] = statusEffect.split('|');

        if (AttackSkill.statusEffects.includes(statusEffectType)) {
            this.#skillStatus = statusEffectType;
            this.#skillStatusDuration = statusEffectDuration ?? 0;
        }

        // Attack bonus of this skill
        if ((hitChance >= 0) && (hitChance <= 20)) {
            this.#skillHitChance = hitChance;
        }

        // cap uses per match to between 1 - 10 (except -1 = unlimited uses)
        this.#skillUses = (charges === -1 ? -1 : Math.max(1, Math.min(charges, 10)));

        // skill targets either the player or the opponent (self-targeted are assumed to be beneficial)
        this.#skillTarget = (target !== "self" ? "enemy" : "self");
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return the lower range of the skill damage
    get minDamage() {
        return this.#skillDamageMin;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return the upper range of the skill damage
    get maxDamage() {
        return this.#skillDamageMax;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return the name of the skill
    get name() {
        return this.#skillName;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return the target type of the skill, either: "self" or "enemy"
    get target() {
        return this.#skillTarget;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return the number of uses left of this skill
    get uses() {
        return this.#skillUses;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return its type if this skill inflicts any kind of status effect.
    get status() {
        return this.#skillStatus;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return the duration of the status effect inflicted by the this skill, if any. 
    get statusDuration() {
        return this.#skillStatusDuration;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return the attack bonus modifier of this skill (0-20)
    get hitChance() {
        return this.#skillHitChance;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return the filename of the icon for this skill
    get icon() {
        return this.#skillIcon;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return the skill description
    get description() {
        return this.#skillDescription;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Use the skill, decreasing number of available uses and returning rolled damage/healing
    use(opponent, skillUser) {
        if ((this.#skillUses != -1) && (this.#skillUses <= 0)) {
            throw new Error(`You cannot use ${this.#skillName} any more times during this match.`);
        }

        let skillRoll = Math.round((this.#skillDamageMax - this.#skillDamageMin) * Math.random()) + this.#skillDamageMin;

        if (this.#skillUses != -1) {
            this.#skillUses--;
        }

        // Skill is self-targeted
        if (this.target == "self") {
            if ((this.status == "heal") || (this.status == "cure")) {
                skillUser.heal(skillRoll);
                gameInterface.showMessage(`${skillUser.name} healed themselves for ${skillRoll} health.`);
            }
            if (this.status == "cure") {
                if (skillUser.removeStatusEffect("burn")) {
                    gameInterface.showMessage(`${skillUser.name} cured themselves of burning.`);
                }
            }

            // Apply status effect
            if ((this.status != "none") && (this.statusDuration > 0)) {
                skillUser.addStatusEffect(this.status, this.statusDuration);
            }
        }
        // Skill is enemy-targeted
        else {
            const attackRoll = this.#rollDice(20, this.hitChance);
            const defenseRoll = this.#rollDice(20, opponent.armor);

            if (attackRoll >= defenseRoll) {
                opponent.takeDamage(skillRoll);
                gameInterface.showMessage(`${skillUser.name} attacked ${opponent.name} with ${this.name} for ${skillRoll} damage. (${attackRoll} vs. ${defenseRoll})`);

                // Apply status effect
                if ((this.status == "riposte") && (this.statusDuration > 0)) {
                    skillUser.addStatusEffect(this.status, this.statusDuration);
                }
                else if ((this.status != "none") && (this.statusDuration > 0)) {
                    opponent.addStatusEffect(this.status, this.statusDuration);
                }

                if (opponent.hasStatusEffect('riposte')) {
                    skillUser.takeDamage(15);
                    gameInterface.showMessage(`${opponent.name} riposted ${skillUser.name}'s attack dealing 15 damage in return.`);
                }
            }
            else {
                gameInterface.showMessage(`${skillUser.name} attacked ${opponent.name} with ${this.name} but missed! (${attackRoll} vs. ${defenseRoll})`);
                skillRoll = null;
            }
        }

        return skillRoll;

    }


    ///////////////////////////////////////////////////////////////////////////////
    // Roll and return a random number with an added modifier value
    #rollDice(sides, modifier) {
        return Math.ceil(Math.random() * sides) + modifier;
    }
}
