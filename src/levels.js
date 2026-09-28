/**
 * Escape The Rooms - Level Definitions
 * Handcrafted 18x12 isometric stone chambers inspired by the original design concept.
 * Grid: 18 columns x 12 rows (Tile size: 48px). Canvas: 864px x 576px.
 */

const TILE_SIZE = 48;

// Tile types:
// 0: Floor
// 1: Stone Wall (solid block)
// 2: Start Tile (green glowing pad)
// 3: Pit / Void

const LEVELS_DATA = [
    // =================================================================
    // ROOM 1: FIND THE KEY (Tutorial & Navigation)
    // =================================================================
    {
        id: 1,
        title: "Room 1 - Find the Key",
        subtitle: "Navigate the stone chambers, find the golden key, and unlock the exit door.",
        hint: "Collect the key to unlock the heavy door at the top.",
        difficulty: "TUTORIAL",
        gridWidth: 18,
        gridHeight: 12,
        playerStart: { x: 2.5 * TILE_SIZE, y: 9.5 * TILE_SIZE },
        starTimes: { three: 25, two: 50 },
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1],
            [1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        exit: {
            x: 10 * TILE_SIZE,
            y: 0.85 * TILE_SIZE,
            w: 64,
            h: 48,
            requiredKeys: 1
        },
        keys: [
            { x: 6.5 * TILE_SIZE, y: 9.5 * TILE_SIZE, id: 1 }
        ],
        crates: [
            { x: 4 * TILE_SIZE, y: 4 * TILE_SIZE },
            { x: 13 * TILE_SIZE, y: 8 * TILE_SIZE }
        ],
        torches: [
            { x: 3 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 8 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 15 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 1 * TILE_SIZE, y: 6 * TILE_SIZE },
            { x: 16 * TILE_SIZE, y: 6 * TILE_SIZE }
        ]
    },

    // =================================================================
    // ROOM 2: MOVING OBSTACLES (Rotating Spiked Maces & Lava)
    // =================================================================
    {
        id: 2,
        title: "Room 2 - Moving Obstacles",
        subtitle: "Time your moves past spinning spiked maces and avoid the molten chasms.",
        hint: "Study the rotation rhythm before crossing the central hall.",
        difficulty: "EASY",
        gridWidth: 18,
        gridHeight: 12,
        playerStart: { x: 2.5 * TILE_SIZE, y: 9.5 * TILE_SIZE },
        starTimes: { three: 30, two: 60 },
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        exit: {
            x: 15 * TILE_SIZE,
            y: 0.85 * TILE_SIZE,
            w: 64,
            h: 48,
            requiredKeys: 1
        },
        keys: [
            { x: 15.5 * TILE_SIZE, y: 9.5 * TILE_SIZE, id: 1 }
        ],
        lavaPits: [
            { x: 3 * TILE_SIZE, y: 5 * TILE_SIZE, w: 2 * TILE_SIZE, h: 3 * TILE_SIZE },
            { x: 14 * TILE_SIZE, y: 3 * TILE_SIZE, w: 2 * TILE_SIZE, h: 3 * TILE_SIZE }
        ],
        rotatingMaces: [
            { cx: 9.5 * TILE_SIZE, cy: 5.5 * TILE_SIZE, armLength: 125, arms: 4, speed: 1.25 }
        ],
        crates: [
            { x: 5 * TILE_SIZE, y: 2 * TILE_SIZE },
            { x: 13 * TILE_SIZE, y: 9 * TILE_SIZE }
        ],
        torches: [
            { x: 1 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 16 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 9.5 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 1 * TILE_SIZE, y: 10 * TILE_SIZE },
            { x: 16 * TILE_SIZE, y: 10 * TILE_SIZE }
        ]
    },

    // =================================================================
    // ROOM 3: TRAPS (Spike Traps & Pressure Plates)
    // =================================================================
    {
        id: 3,
        title: "Room 3 - Traps",
        subtitle: "Navigate rhythmic spike fields and trigger pressure plates to survive.",
        hint: "Red plates disarm nearby spikes. Step carefully!",
        difficulty: "MEDIUM",
        gridWidth: 18,
        gridHeight: 12,
        playerStart: { x: 2.5 * TILE_SIZE, y: 9.5 * TILE_SIZE },
        starTimes: { three: 35, two: 70 },
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        exit: {
            x: 8.5 * TILE_SIZE,
            y: 0.85 * TILE_SIZE,
            w: 64,
            h: 48,
            requiredKeys: 1
        },
        keys: [
            { x: 13.5 * TILE_SIZE, y: 6.5 * TILE_SIZE, id: 1 }
        ],
        checkpoints: [
            { x: 8.5 * TILE_SIZE, y: 6.5 * TILE_SIZE }
        ],
        spikes: [
            { x: 4 * TILE_SIZE, y: 3 * TILE_SIZE, cycleOffset: 0, cycleTime: 2.2 },
            { x: 5 * TILE_SIZE, y: 3 * TILE_SIZE, cycleOffset: 0.4, cycleTime: 2.2 },
            { x: 8 * TILE_SIZE, y: 4 * TILE_SIZE, cycleOffset: 0, cycleTime: 2.0 },
            { x: 9 * TILE_SIZE, y: 4 * TILE_SIZE, cycleOffset: 0.3, cycleTime: 2.0 },
            { x: 8 * TILE_SIZE, y: 8 * TILE_SIZE, cycleOffset: 0.6, cycleTime: 2.0 },
            { x: 9 * TILE_SIZE, y: 8 * TILE_SIZE, cycleOffset: 0.9, cycleTime: 2.0 },
            { x: 12 * TILE_SIZE, y: 7 * TILE_SIZE, cycleOffset: 0, cycleTime: 2.4 },
            { x: 13 * TILE_SIZE, y: 7 * TILE_SIZE, cycleOffset: 0.4, cycleTime: 2.4 },
            { x: 12 * TILE_SIZE, y: 8 * TILE_SIZE, cycleOffset: 0.8, cycleTime: 2.4 },
            { x: 13 * TILE_SIZE, y: 8 * TILE_SIZE, cycleOffset: 1.2, cycleTime: 2.4 }
        ],
        pressurePlates: [
            { x: 4.2 * TILE_SIZE, y: 4.2 * TILE_SIZE, id: 'plate1', disarmsSpikes: [0, 1] }
        ],
        crates: [
            { x: 3 * TILE_SIZE, y: 8 * TILE_SIZE }
        ],
        torches: [
            { x: 2 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 15 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 8 * TILE_SIZE, y: 5 * TILE_SIZE },
            { x: 10 * TILE_SIZE, y: 5 * TILE_SIZE }
        ]
    },

    // =================================================================
    // ROOM 4: PUZZLE (Ancient Rune Sequence)
    // =================================================================
    {
        id: 4,
        title: "Room 4 - Puzzle",
        subtitle: "Memorize the sequence plate on the wall and step on the pedestals in order.",
        hint: "Step on: ▲ Red → ◆ Blue → ● Green → ★ Yellow.",
        difficulty: "MEDIUM",
        gridWidth: 18,
        gridHeight: 12,
        playerStart: { x: 8.5 * TILE_SIZE, y: 9.5 * TILE_SIZE },
        starTimes: { three: 25, two: 50 },
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        exit: {
            x: 8.5 * TILE_SIZE,
            y: 0.85 * TILE_SIZE,
            w: 64,
            h: 48,
            requiredKeys: 0
        },
        puzzle: {
            targetSequence: [0, 1, 2, 3],
            pedestals: [
                { index: 0, symbol: 'triangle', color: '#ef4444', x: 4.5 * TILE_SIZE, y: 6.5 * TILE_SIZE },
                { index: 1, symbol: 'diamond', color: '#3b82f6', x: 7.2 * TILE_SIZE, y: 6.5 * TILE_SIZE },
                { index: 2, symbol: 'circle', color: '#22c55e', x: 9.8 * TILE_SIZE, y: 6.5 * TILE_SIZE },
                { index: 3, symbol: 'star', color: '#eab308', x: 12.5 * TILE_SIZE, y: 6.5 * TILE_SIZE }
            ]
        },
        torches: [
            { x: 3 * TILE_SIZE, y: 2 * TILE_SIZE },
            { x: 14 * TILE_SIZE, y: 2 * TILE_SIZE },
            { x: 1 * TILE_SIZE, y: 6 * TILE_SIZE },
            { x: 16 * TILE_SIZE, y: 6 * TILE_SIZE }
        ]
    },

    // =================================================================
    // ROOM 5: ENEMY (Avoid Detection & Stealth)
    // =================================================================
    {
        id: 5,
        title: "Room 5 - Enemy (Avoid Detection)",
        subtitle: "A cybernetic sentinel patrols the dark room. Hide behind crates to evade detection!",
        hint: "Crates block the sentinel's vision cone. Sneak when it turns away.",
        difficulty: "HARD",
        gridWidth: 18,
        gridHeight: 12,
        playerStart: { x: 2.5 * TILE_SIZE, y: 9.5 * TILE_SIZE },
        starTimes: { three: 35, two: 65 },
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        exit: {
            x: 2.5 * TILE_SIZE,
            y: 0.85 * TILE_SIZE,
            w: 64,
            h: 48,
            requiredKeys: 1
        },
        keys: [
            { x: 15.5 * TILE_SIZE, y: 2.5 * TILE_SIZE, id: 1 }
        ],
        crates: [
            { x: 5 * TILE_SIZE, y: 5 * TILE_SIZE },
            { x: 5 * TILE_SIZE, y: 6 * TILE_SIZE },
            { x: 10 * TILE_SIZE, y: 5 * TILE_SIZE },
            { x: 10 * TILE_SIZE, y: 6 * TILE_SIZE },
            { x: 14 * TILE_SIZE, y: 5 * TILE_SIZE }
        ],
        enemies: [
            {
                x: 9.5 * TILE_SIZE,
                y: 2.5 * TILE_SIZE,
                waypoints: [
                    { x: 9.5 * TILE_SIZE, y: 2.5 * TILE_SIZE },
                    { x: 14.5 * TILE_SIZE, y: 2.5 * TILE_SIZE },
                    { x: 14.5 * TILE_SIZE, y: 8.5 * TILE_SIZE },
                    { x: 8.5 * TILE_SIZE, y: 8.5 * TILE_SIZE }
                ],
                visionRange: 180,
                fov: Math.PI / 2.3
            }
        ],
        torches: [
            { x: 1 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 16 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 16 * TILE_SIZE, y: 10 * TILE_SIZE }
        ]
    },

    // =================================================================
    // ROOM 6: FINAL ESCAPE (The Ultimate Trial)
    // =================================================================
    {
        id: 6,
        title: "Room 6 - Final Room",
        subtitle: "The master escape challenge! Lasers, spikes, moving maces, and 2 keys to unlock the exit.",
        hint: "Step on pressure plates to deactivate lasers and time your path through spikes.",
        difficulty: "EXPERT",
        gridWidth: 18,
        gridHeight: 12,
        playerStart: { x: 2.5 * TILE_SIZE, y: 9.5 * TILE_SIZE },
        starTimes: { three: 45, two: 90 },
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1],
            [1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        exit: {
            x: 13.5 * TILE_SIZE,
            y: 0.85 * TILE_SIZE,
            w: 64,
            h: 48,
            requiredKeys: 2
        },
        keys: [
            { x: 3.5 * TILE_SIZE, y: 2.5 * TILE_SIZE, id: 1 },
            { x: 15.5 * TILE_SIZE, y: 8.5 * TILE_SIZE, id: 2 }
        ],
        checkpoints: [
            { x: 8.5 * TILE_SIZE, y: 6.5 * TILE_SIZE }
        ],
        spikes: [
            { x: 2 * TILE_SIZE, y: 6 * TILE_SIZE, cycleOffset: 0, cycleTime: 2.0 },
            { x: 3 * TILE_SIZE, y: 6 * TILE_SIZE, cycleOffset: 0.5, cycleTime: 2.0 },
            { x: 2 * TILE_SIZE, y: 7 * TILE_SIZE, cycleOffset: 1.0, cycleTime: 2.0 },
            { x: 3 * TILE_SIZE, y: 7 * TILE_SIZE, cycleOffset: 1.5, cycleTime: 2.0 }
        ],
        lasers: [
            { x1: 7 * TILE_SIZE, y1: 4.5 * TILE_SIZE, x2: 11 * TILE_SIZE, y2: 4.5 * TILE_SIZE, isActive: true },
            { x1: 12 * TILE_SIZE, y1: 8.5 * TILE_SIZE, x2: 17 * TILE_SIZE, y2: 8.5 * TILE_SIZE, isActive: true }
        ],
        pressurePlates: [
            { x: 8.5 * TILE_SIZE, y: 2.5 * TILE_SIZE, id: 'plate_laser1', togglesLaser: 0 },
            { x: 14.5 * TILE_SIZE, y: 4.5 * TILE_SIZE, id: 'plate_laser2', togglesLaser: 1 }
        ],
        crates: [
            { x: 6 * TILE_SIZE, y: 9 * TILE_SIZE },
            { x: 12 * TILE_SIZE, y: 6 * TILE_SIZE }
        ],
        rotatingMaces: [
            { cx: 9.5 * TILE_SIZE, cy: 7.5 * TILE_SIZE, armLength: 75, arms: 2, speed: 1.6 }
        ],
        torches: [
            { x: 1 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 12 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 16 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 1 * TILE_SIZE, y: 10 * TILE_SIZE }
        ]
    },

    // =================================================================
    // ROOM 7: TWIN SENTINELS & LASER GRID
    // =================================================================
    {
        id: 7,
        title: "Room 7 - Twin Sentinels",
        subtitle: "Two patrol sentinels guard the laser corridors. Sneak behind crates to disarm the grid.",
        hint: "Step on the plates in the alcoves to deactivate the lasers and sneak past the guards.",
        difficulty: "EXPERT",
        gridWidth: 18,
        gridHeight: 12,
        playerStart: { x: 2.5 * TILE_SIZE, y: 9.5 * TILE_SIZE },
        starTimes: { three: 45, two: 90 },
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1],
            [1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
            [1, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        exit: {
            x: 8.5 * TILE_SIZE,
            y: 0.85 * TILE_SIZE,
            w: 64,
            h: 48,
            requiredKeys: 2
        },
        keys: [
            { x: 4.5 * TILE_SIZE, y: 1.5 * TILE_SIZE, id: 1 },
            { x: 13.5 * TILE_SIZE, y: 1.5 * TILE_SIZE, id: 2 }
        ],
        lasers: [
            { x1: 2 * TILE_SIZE, y1: 5.5 * TILE_SIZE, x2: 6 * TILE_SIZE, y2: 5.5 * TILE_SIZE, isActive: true },
            { x1: 12 * TILE_SIZE, y1: 5.5 * TILE_SIZE, x2: 16 * TILE_SIZE, y2: 5.5 * TILE_SIZE, isActive: true }
        ],
        pressurePlates: [
            { x: 3.5 * TILE_SIZE, y: 7.5 * TILE_SIZE, id: 'plate_l1', togglesLaser: 0 },
            { x: 14.5 * TILE_SIZE, y: 7.5 * TILE_SIZE, id: 'plate_l2', togglesLaser: 1 }
        ],
        crates: [
            { x: 4 * TILE_SIZE, y: 3 * TILE_SIZE },
            { x: 13 * TILE_SIZE, y: 3 * TILE_SIZE }
        ],
        enemies: [
            {
                x: 4.5 * TILE_SIZE,
                y: 2.5 * TILE_SIZE,
                waypoints: [
                    { x: 4.5 * TILE_SIZE, y: 2.5 * TILE_SIZE },
                    { x: 7.5 * TILE_SIZE, y: 2.5 * TILE_SIZE },
                    { x: 7.5 * TILE_SIZE, y: 6.5 * TILE_SIZE },
                    { x: 4.5 * TILE_SIZE, y: 6.5 * TILE_SIZE }
                ],
                visionRange: 160,
                fov: Math.PI / 2.4
            },
            {
                x: 13.5 * TILE_SIZE,
                y: 2.5 * TILE_SIZE,
                waypoints: [
                    { x: 13.5 * TILE_SIZE, y: 2.5 * TILE_SIZE },
                    { x: 10.5 * TILE_SIZE, y: 2.5 * TILE_SIZE },
                    { x: 10.5 * TILE_SIZE, y: 6.5 * TILE_SIZE },
                    { x: 13.5 * TILE_SIZE, y: 6.5 * TILE_SIZE }
                ],
                visionRange: 160,
                fov: Math.PI / 2.4
            }
        ],
        torches: [
            { x: 1 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 16 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 8.5 * TILE_SIZE, y: 6 * TILE_SIZE }
        ]
    },

    // =================================================================
    // ROOM 8: THE MOLTEN LABYRINTH
    // =================================================================
    {
        id: 8,
        title: "Room 8 - Molten Labyrinth",
        subtitle: "Cross narrow stone bridges suspended above bubbling lava while avoiding spinning maces.",
        hint: "Cross the bridges when the mace arms rotate away.",
        difficulty: "MASTER",
        gridWidth: 18,
        gridHeight: 12,
        playerStart: { x: 2.5 * TILE_SIZE, y: 9.5 * TILE_SIZE },
        starTimes: { three: 40, two: 80 },
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1],
            [1, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        exit: {
            x: 8.5 * TILE_SIZE,
            y: 0.85 * TILE_SIZE,
            w: 64,
            h: 48,
            requiredKeys: 2
        },
        keys: [
            { x: 3.5 * TILE_SIZE, y: 2.5 * TILE_SIZE, id: 1 },
            { x: 14.5 * TILE_SIZE, y: 2.5 * TILE_SIZE, id: 2 }
        ],
        lavaPits: [
            { x: 2 * TILE_SIZE, y: 4 * TILE_SIZE, w: 3 * TILE_SIZE, h: 2 * TILE_SIZE },
            { x: 13 * TILE_SIZE, y: 4 * TILE_SIZE, w: 3 * TILE_SIZE, h: 2 * TILE_SIZE },
            { x: 7 * TILE_SIZE, y: 5 * TILE_SIZE, w: 4 * TILE_SIZE, h: 2 * TILE_SIZE }
        ],
        rotatingMaces: [
            { cx: 5.5 * TILE_SIZE, cy: 3.5 * TILE_SIZE, armLength: 85, arms: 3, speed: 1.3 },
            { cx: 12.5 * TILE_SIZE, cy: 3.5 * TILE_SIZE, armLength: 85, arms: 3, speed: -1.3 }
        ],
        checkpoints: [
            { x: 8.5 * TILE_SIZE, y: 9.5 * TILE_SIZE }
        ],
        torches: [
            { x: 1 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 16 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 8.5 * TILE_SIZE, y: 3 * TILE_SIZE }
        ]
    },

    // =================================================================
    // ROOM 9: THE RUNIC GAUNTLET
    // =================================================================
    {
        id: 9,
        title: "Room 9 - Runic Gauntlet",
        subtitle: "Solve the ancient 4-rune sequence under the pressure of rhythmic spike traps.",
        hint: "Step on the pressure plate to disarm spikes before walking to each pedestal.",
        difficulty: "MASTER",
        gridWidth: 18,
        gridHeight: 12,
        playerStart: { x: 8.5 * TILE_SIZE, y: 9.5 * TILE_SIZE },
        starTimes: { three: 35, two: 70 },
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        exit: {
            x: 8.5 * TILE_SIZE,
            y: 0.85 * TILE_SIZE,
            w: 64,
            h: 48,
            requiredKeys: 0
        },
        puzzle: {
            targetSequence: [1, 3, 0, 2],
            pedestals: [
                { index: 0, symbol: 'triangle', color: '#ef4444', x: 4.5 * TILE_SIZE, y: 6.5 * TILE_SIZE },
                { index: 1, symbol: 'diamond', color: '#3b82f6', x: 7.2 * TILE_SIZE, y: 6.5 * TILE_SIZE },
                { index: 2, symbol: 'circle', color: '#22c55e', x: 9.8 * TILE_SIZE, y: 6.5 * TILE_SIZE },
                { index: 3, symbol: 'star', color: '#eab308', x: 12.5 * TILE_SIZE, y: 6.5 * TILE_SIZE }
            ]
        },
        spikes: [
            { x: 4.5 * TILE_SIZE, y: 5 * TILE_SIZE, cycleOffset: 0, cycleTime: 2.2 },
            { x: 7.2 * TILE_SIZE, y: 5 * TILE_SIZE, cycleOffset: 0.5, cycleTime: 2.2 },
            { x: 9.8 * TILE_SIZE, y: 5 * TILE_SIZE, cycleOffset: 1.0, cycleTime: 2.2 },
            { x: 12.5 * TILE_SIZE, y: 5 * TILE_SIZE, cycleOffset: 1.5, cycleTime: 2.2 }
        ],
        pressurePlates: [
            { x: 8.5 * TILE_SIZE, y: 8.5 * TILE_SIZE, id: 'plate_spikes', disarmsSpikes: [0, 1, 2, 3] }
        ],
        torches: [
            { x: 2 * TILE_SIZE, y: 2 * TILE_SIZE },
            { x: 15 * TILE_SIZE, y: 2 * TILE_SIZE },
            { x: 8.5 * TILE_SIZE, y: 5 * TILE_SIZE }
        ]
    },

    // =================================================================
    // ROOM 10: GRAND CITADEL ESCAPE (The Ultimate Finale)
    // =================================================================
    {
        id: 10,
        title: "Room 10 - Grand Citadel",
        subtitle: "The ultimate trial! 3 Vault Keys, security lasers, patrol sentinel, and spinning maces.",
        hint: "Coordinate crate cover, disarm the defense lasers, and claim the 3 Citadel Keys.",
        difficulty: "GRAND FINALE",
        gridWidth: 18,
        gridHeight: 12,
        playerStart: { x: 2.5 * TILE_SIZE, y: 9.5 * TILE_SIZE },
        starTimes: { three: 55, two: 110 },
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        exit: {
            x: 8.5 * TILE_SIZE,
            y: 0.85 * TILE_SIZE,
            w: 64,
            h: 48,
            requiredKeys: 3
        },
        keys: [
            { x: 3.5 * TILE_SIZE, y: 2.5 * TILE_SIZE, id: 1 },
            { x: 14.5 * TILE_SIZE, y: 2.5 * TILE_SIZE, id: 2 },
            { x: 15.5 * TILE_SIZE, y: 9.5 * TILE_SIZE, id: 3 }
        ],
        checkpoints: [
            { x: 8.5 * TILE_SIZE, y: 6.5 * TILE_SIZE }
        ],
        lasers: [
            { x1: 6 * TILE_SIZE, y1: 4.5 * TILE_SIZE, x2: 12 * TILE_SIZE, y2: 4.5 * TILE_SIZE, isActive: true }
        ],
        pressurePlates: [
            { x: 8.5 * TILE_SIZE, y: 2.5 * TILE_SIZE, id: 'plate_final_laser', togglesLaser: 0 }
        ],
        rotatingMaces: [
            { cx: 8.5 * TILE_SIZE, cy: 7.5 * TILE_SIZE, armLength: 85, arms: 4, speed: 1.4 }
        ],
        crates: [
            { x: 6 * TILE_SIZE, y: 9 * TILE_SIZE },
            { x: 11 * TILE_SIZE, y: 9 * TILE_SIZE }
        ],
        enemies: [
            {
                x: 8.5 * TILE_SIZE,
                y: 3.5 * TILE_SIZE,
                waypoints: [
                    { x: 6.5 * TILE_SIZE, y: 3.5 * TILE_SIZE },
                    { x: 11.5 * TILE_SIZE, y: 3.5 * TILE_SIZE }
                ],
                visionRange: 160,
                fov: Math.PI / 2.2
            }
        ],
        torches: [
            { x: 1 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 16 * TILE_SIZE, y: 1 * TILE_SIZE },
            { x: 1 * TILE_SIZE, y: 10 * TILE_SIZE },
            { x: 16 * TILE_SIZE, y: 10 * TILE_SIZE }
        ]
    }
];

window.LEVELS_DATA = LEVELS_DATA;
window.TILE_SIZE = TILE_SIZE;
