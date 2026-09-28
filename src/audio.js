/**
 * Escape The Rooms - Audio Engine (SILENT MODE)
 * All sound effects and music are disabled.
 * API is preserved so no gameplay code breaks.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = true;          // Always muted
        this.musicEnabled = false;    // Music always off
        this.sfxVolume = 0;
        this.musicVolume = 0;
        this.isMusicPlaying = false;
        this.musicInterval = null;
        this.footstepCooldown = false;
    }

    init() { /* silent */ }
    setMuted(muted) { this.isMuted = true; }
    toggleMute() { return true; }
    setMusicEnabled(enabled) { this.musicEnabled = false; }

    // All sound methods are no-ops
    playFootstep() {}
    playKeyCollect() {}
    playDoorOpen() {}
    playPressurePlate() {}
    playSpikeTrap() {}
    playDamage() {}
    playEnemyAlert() {}
    playPuzzleNote(index) {}
    playPuzzleSuccess() {}
    playPuzzleFail() {}
    playLevelComplete() {}
    playObjectiveComplete() {}
    playSwitchFlip() {}
    playCheckpoint() {}
    playFinalVictoryFanfare() {}
    playGameOver() {}
    playUiClick() {}
    playUiHover() {}
    startMusic() {}
    stopMusic() {}
    _playAmbientLoop() {}
}

// Global audio singleton
window.gameAudio = new SoundEngine();
