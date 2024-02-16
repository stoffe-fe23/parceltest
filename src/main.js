/*
    Inlämningsuppgift 1 - FE23 Javascript 2
    Kristoffer Bengtsson
    Yasir Kakar

    Main javascript file.
*/

import gameInterface from "./modules/GameInterface.js";

// Start a new game 
try {
    gameInterface.newGame();
}
catch (error) {
    console.error(error);
    gameInterface.showError(error);
}
