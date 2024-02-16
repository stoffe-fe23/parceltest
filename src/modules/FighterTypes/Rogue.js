/*
    Inlämningsuppgift 1 - FE23 Javascript 2
    Kristoffer Bengtsson
    Yasir Kakar

    Class: FighterType -> Rogue
    Definition of stats and skills for a player of the rogue class.
*/
import FighterType from "../FighterType.js";
import AttackSkill from "../AttackSkill.js";

// Images
import imgUrlRogue from "../../images/rogue.png";
import imgUrlSpellSkillStab from "../../images/Stab.png";
import imgUrlSpellSkillBackstab from "../../images/backstab.png";
import imgUrlSpellSkillEvasion from "../../images/evasion.png";
import imgUrlSpellSkillPotion from "../../images/potion.png";

export default class Rogue extends FighterType {

    constructor() {
        // name, health, defense, color, icon
        super('Rogue', 300, 4, "fighterclass-rogue", imgUrlRogue);

        // Create unique skills for this fighter type
        this.addSkill(new AttackSkill(
            "Stab",
            5,  // min damage
            15, // max damage
            15, // attack bonus
            -1, // uses per match (-1 = unlimited)
            "enemy", // target
            "none", // status effect
            imgUrlSpellSkillStab,  // icon
            'Stab opponent for 5-15 damage. (+15 attack)'
        ));

        this.addSkill(new AttackSkill(
            "Backstab",
            40, // min damage
            70, // max damage
            10, // attack bonus
            5, // uses per match
            "enemy", // target
            "riposte|1", // status effect | duration (retaliate against incoming attacks)
            imgUrlSpellSkillBackstab, // icon
            'Backstab opponent for 30-60 damage and riposte incoming attacks for 1 turn, retaliating for 15 damage. (+10 attack)'
        ));

        this.addSkill(new AttackSkill(
            "Evasion",
            0, // min damage
            0, // max damage
            0, // attack bonus
            3, // uses per match
            "self", // target
            "evade|3",  // status effect | duration (defense bonus)
            imgUrlSpellSkillEvasion,  // icon
            'Evade attacks for three rounds (+15 defense).'
        ));

        this.addSkill(new AttackSkill(
            "Potion",
            30, // min damage
            35, // max damage
            10, // attack bonus
            3, // uses per match
            "self", // target
            "heal|2", // status effect | duration (heal + health regen over time)
            imgUrlSpellSkillPotion, // icon
            'Heal yourself for 30-35 health and regen 10 health for 2 rounds.'
        ));
    }
}