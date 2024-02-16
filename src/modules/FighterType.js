/*
    Inlämningsuppgift 1 - FE23 Javascript 2
    Kristoffer Bengtsson
    Yasir Kakar

    Class: FighterType
    Definition of a type of fighter (i.e. Warrior, Mage, Rogue etc)
    Abstract, do not create objects of this class, use one of its subclasses in FighterTypes instead. 
*/
import AttackSkill from "./AttackSkill.js";

export default class FighterType {
    #fighterName;
    #maxHealth = 800;
    #armorClass = 10;
    #attackTypes = [];
    #classStyle;
    #classIcon;


    constructor(fighterName, maxHealth, armorClass, style, icon) {
        this.name = fighterName;
        this.#maxHealth = maxHealth;
        this.#armorClass = armorClass;
        this.#classStyle = style;
        this.#classIcon = icon;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Change the name of this fighter type
    set name(fighterName) {
        if ((typeof fighterName !== "string") || (fighterName.length < 2) || (fighterName.length > 20)) {
            throw new Error("The name of a fighter type must be a string between 2 and 20 characters in length.");
        }
        this.#fighterName = fighterName;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return the name of this fighter type
    get name() {
        return this.#fighterName;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return the armor class of this fighter type
    get armor() {
        return this.#armorClass;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return the health pool size of this fighter type
    get maxHealth() {
        return this.#maxHealth;
    }

    ///////////////////////////////////////////////////////////////////////////////
    // Return the icon for this class
    get icon() {
        return this.#classIcon;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return the color for this class
    get style() {
        return this.#classStyle;
    }

    ///////////////////////////////////////////////////////////////////////////////
    addSkill(attackType) {
        if ((typeof attackType !== "object") || !(attackType instanceof AttackSkill)) {
            throw new Error(`Error attempting to add invalid skill to ${this.#fighterName}!`);
        }

        if (!this.#attackTypes.includes(attackType)) {
            this.#attackTypes.push(attackType);
        }
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return the attack or skill with the specified name
    getAttackSkill(skillName) {
        for (const skill of this.#attackTypes) {
            if (skill.name == skillName) {
                return skill;
            }
        }
        throw new Error(`The ${this.#fighterName} does not know the ${skillName} skill.`);
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Return a list of skills available to use.
    getAvailableSkills() {
        if (this.#attackTypes.length <= 0) {
            throw new Error(`The ${this.#fighterName} does not have any skills assigned!`);
        }

        return this.#attackTypes.filter(({ uses }) => ((uses > 0) || (uses === -1)));
    }
}