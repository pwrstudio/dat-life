"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Life = void 0;
const seedrandom_1 = __importDefault(require("seedrandom"));
class Life {
    constructor(width = 100, height = 100) {
        this.width = width;
        this.height = height;
        this.colors = 1;
        this.decay = false;
        this.board = this.createBoard();
        this.generation = 1;
        this.population = 0;
        this.reset();
    }
    setWidth(width) {
        this.width = width;
        this.board = this.createBoard();
        this.reset();
    }
    setHeight(height) {
        this.height = height;
        this.board = this.createBoard();
        this.reset();
    }
    setColors(colors) {
        if (colors != 1 && colors != 2 && colors != 4) {
            throw new Error("invalid number of colors");
        }
        this.colors = colors;
        this.reset();
    }
    getWidth() { return this.width; }
    getHeight() { return this.height; }
    getColors() { return this.colors; }
    createBoard() {
        return new Array(this.width * this.height);
    }
    visit(visitor) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                visitor(x, y);
            }
        }
    }
    index(x, y) {
        return x + (this.width * y);
    }
    reset() {
        this.visit((x, y) => { this.board[this.index(x, y)] = 0; });
        this.generation = 1;
        this.population = 0;
    }
    clear() {
        this.reset();
        return this.getBoard();
    }
    set(x, y, state) {
        if (x < 0 || x > this.width || y < 0 || y > this.height) {
            throw new Error("array index is out of bounds");
        }
        if (state < 0 || state > this.colors) {
            throw new Error("invalid state");
        }
        if (state) {
            this.population++;
        }
        this.board[this.index(x, y)] = state;
    }
    get(x, y) {
        if (x < 0 || x > this.width || y < 0 || y > this.height) {
            throw new Error("array index is out of bounds");
        }
        return this.board[this.index(x, y)];
    }
    setBoard(board) {
        if (board.length != this.width * this.height) {
            throw new Error('array values do not match dimensions');
        }
        this.reset();
        this.board = board.slice();
        this.board.forEach((state) => {
            if (state > this.colors) {
                throw new Error('state value out of range');
            }
            else if (state) {
                this.population++;
            }
        });
    }
    setDecay(decay) {
        this.decay = decay;
    }
    getBoard() {
        return this.board.slice();
    }
    getPopulation() {
        return this.population;
    }
    getGeneration() {
        return this.generation;
    }
    getDecay() {
        return this.decay;
    }
    randomizeFromSeed(seed) {
        let rng = seedrandom_1.default(seed.toString());
        this.population = 0;
        this.visit((x, y) => {
            // 1 in 4 whether a cell is alive; if it is, it has a random color
            const alive = Math.floor(rng() * 4) === 0;
            const color = Math.floor(rng() * this.colors) + 1;
            const state = alive ? color : 0;
            if (state) {
                this.population++;
            }
            this.board[this.index(x, y)] = state;
        });
        return this.getBoard();
    }
    randomize() {
        this.population = 0;
        this.visit((x, y) => {
            // 1 in 4 whether a cell is alive; if it is, it has a random color
            const alive = Math.floor(Math.random() * 4) === 0;
            const color = Math.floor(Math.random() * this.colors) + 1;
            const state = alive ? color : 0;
            if (state) {
                this.population++;
            }
            this.board[this.index(x, y)] = state;
        });
        return this.getBoard();
    }
    // returns a one-dimensional array selecting the neighbors around a cell
    neighbors(x, y) {
        const neighbors = new Array(8);
        neighbors[0] = (x > 0 && y > 0) ? this.get(x - 1, y - 1) : 0;
        neighbors[1] = (x > 0) ? this.get(x - 1, y) : 0;
        neighbors[2] = (x > 0 && y < this.height - 1) ? this.get(x - 1, y + 1) : 0;
        neighbors[3] = (y > 0) ? this.get(x, y - 1) : 0;
        neighbors[4] = (y < this.height - 1) ? this.get(x, y + 1) : 0;
        neighbors[5] = (x < this.width - 1 && y > 0) ? this.get(x + 1, y - 1) : 0;
        neighbors[6] = (x < this.width - 1) ? this.get(x + 1, y) : 0;
        neighbors[7] = (x < this.width - 1 && y < this.height - 1) ? this.get(x + 1, y + 1) : 0;
        return neighbors;
    }
    getColor(neighbors) {
        switch (this.colors) {
            case 1:
                return 1;
            // two colors: newborns are the majority color of the parents
            case 2: {
                const count = [0, 0];
                for (let color of neighbors) {
                    if (color && ++count[color - 1] == 2) {
                        return color;
                    }
                }
                break;
            }
            // four colors: newborns are the majority color of the parents if
            // there is a majority; otherwise its the fourth color (the color
            // that no parent has)
            case 4: {
                const count = [0, 0, 0, 0];
                for (let color of neighbors) {
                    if (color && ++count[color - 1] == 2) {
                        return color;
                    }
                }
                return count.findIndex((x) => { return x === 0; }) + 1;
            }
        }
        throw new Error('unsolved color');
    }
    diminish(current) {
        if (this.decay) {
            return current - 1;
        }
        return 0;
    }
    next() {
        const next = this.createBoard();
        this.population = 0;
        this.visit((x, y) => {
            const idx = this.index(x, y);
            const alive = this.board[idx] !== 0;
            const neighbors = this.neighbors(x, y);
            const count = neighbors.filter((x) => { return x !== 0; }).length;
            if (alive && count < 2) {
                next[idx] = this.diminish(this.board[idx]); // exposure
            }
            else if (alive && count > 3) {
                next[idx] = this.diminish(this.board[idx]); // overcrowding
            }
            else if (!alive && count === 3) {
                next[idx] = this.getColor(neighbors); // birth
            }
            else {
                next[idx] = this.board[idx];
            }
            if (next[idx]) {
                this.population++;
            }
        });
        this.board = next;
        this.generation++;
        return this.getBoard();
    }
}
exports.Life = Life;
