import { assert } from "../../assert.js";
import { AABB } from "../../math/aabb.js";
import { Vector2D } from "../../math/vector.js";
import { GAME_HEIGHT, GAME_WIDTH, projectCoords } from "../../window.js";
import { getRow } from "../caleb/utils.js";

/**
 * @param ctx {CanvasRenderingContext2D}
 * @param text {string}
 * @param x {number}
 * @param y {number}
 */
export function renderText(ctx, text, x, y, calebY) {
    const [_x, _y] = projectCoords(ctx.canvas, x + 0.25, y + 0.5)

    if (y === calebY) {
        ctx.fillStyle = "purple";
    } else {
        ctx.fillStyle = "white";
    }

    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.fillText(text, _x, _y)
}


/** @param state {GameState}
*/
export function render(state) {
    const plats = state.level.platforms
    const ctx = state.ctx;
    const calebY = getRow(state.caleb);

    for (const p of plats) {
        ctx.fillRect(p.renderX, p.renderY, p.renderWidth, p.renderHeight);

        // lettered platform
        if ("letters" in p) {
            const {x, y} = p.physics.body.pos
            for (let i = 0; i < p.letters.length; ++i) {
                renderText(ctx, p.letters[i], x, y + i, calebY);
            }
        }
    }

}

let _id = 0;
/**
 * @param aabb {AABB}
 * @returns {Platform}
*/
export function createPlatform(aabb) {
    const id = _id++
    return {
        id,
        physics: {
            vel: new Vector2D(0, 0),
            acc: new Vector2D(0, 0),
            body: aabb,
        },
        renderX: 0,
        renderY: 0,
        renderWidth: 0,
        renderHeight: 0,
    };
}

/**
 * @param aabb {AABB}
 * @param letters {string}
 * @returns {LetteredWall}
*/
export function createLetteredWall(aabb, letters) {
    assert(aabb.width >= 1, "aabb width has to be at least 1", aabb)
    if (aabb.width === 1) {
        assert(letters.length === aabb.height, "letters.length must be equal to aabb.height", "letters", letters, "aabb", aabb);
    } else {
        assert(letters.length === aabb.height * 2, "if width of aabb is 2 or more, then letters.length === aabb.height * 2", "letters", letters, "aabb", aabb);
    }

    return {
        id: ++_id,
        physics: {
            vel: new Vector2D(0, 0),
            acc: new Vector2D(0, 0),
            body: aabb,
        },
        letters: letters,
        renderX: 0,
        renderY: 0,
        renderWidth: 0,
        renderHeight: 0,
    };
}

/**
 * @param {(Platform | LetteredWall)[]} platforms
 * @returns {(string | null)[][]}
 */
export function createLetterMap(platforms) {
    const out = [];
    for (let y = 0; y < GAME_HEIGHT; y++) {
        out.push(new Array(GAME_WIDTH).fill(null));
    }

    for (const p of platforms) {
        if (!("letters" in p)) {
            continue;
        }

        const {x, y} = p.physics.body.pos
        for (let i = 0; i < p.letters.length && y + i < GAME_HEIGHT; ++i) {
            out[y + i][x] = p.letters[i]
        }
    }

    return out;
}

/**
 * @param {GameState} state
 * @param {number} r
 * @returns {{key: string, idx: number}[]}
 */
export function getLetters(state, r) {
    // TODO this just has to create such garbage...
    return state.level.letterMap[r].map((key, idx) => ({key, idx})).filter(({key}) => key !== null)
}
