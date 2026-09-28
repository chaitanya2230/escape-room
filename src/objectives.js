/**
 * Escape The Rooms - Dynamic Objectives Manager
 * Tracks multi-objective progression, checklists, and completion animations.
 */

class ObjectivesManager {
    constructor() {
        this.objectives = [];
        this.onObjectiveCompleted = null;
    }

    loadObjectives(list = []) {
        this.objectives = list.map((obj, idx) => ({
            id: obj.id || `obj_${idx}`,
            text: obj.text,
            completed: false,
            isCurrent: idx === 0
        }));
    }

    completeObjective(id) {
        const obj = this.objectives.find(o => o.id === id);
        if (obj && !obj.completed) {
            obj.completed = true;
            obj.isCurrent = false;

            // Find next uncompleted objective to mark current
            const nextUncompleted = this.objectives.find(o => !o.completed);
            if (nextUncompleted) {
                nextUncompleted.isCurrent = true;
            }

            if (window.gameAudio) {
                window.gameAudio.playObjectiveComplete();
            }

            if (this.onObjectiveCompleted) {
                this.onObjectiveCompleted(obj);
            }
            return true;
        }
        return false;
    }

    isCompleted(id) {
        const obj = this.objectives.find(o => o.id === id);
        return obj ? obj.completed : false;
    }

    areAllCompleted() {
        return this.objectives.every(o => o.completed);
    }

    getStats() {
        const total = this.objectives.length;
        const completed = this.objectives.filter(o => o.completed).length;
        return {
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 100,
            summary: `${completed}/${total}`
        };
    }

    getList() {
        return this.objectives;
    }
}

window.ObjectivesManager = ObjectivesManager;
