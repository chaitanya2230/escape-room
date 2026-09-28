/**
 * Escape The Rooms - Entrypoint
 */

window.addEventListener('DOMContentLoaded', () => {
    // Instantiate game engine
    const game = new window.GameEngine();
    window.gameInstance = game;

    // Start rendering loop
    game.start();

    // Default to main menu
    game.ui.showMainMenu();

    console.log("Escape The Rooms initialized successfully!");
});
