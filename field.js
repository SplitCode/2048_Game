import { Square } from "./square.js";

const fieldSize = 4;
const squaresCount = fieldSize * fieldSize;

export class Field {
    constructor(fieldItem) {
        this.squares = [];
        for (let i = 0; i < squaresCount; i += 1) {
            this.squares.push(
                new Square(fieldItem, i % fieldSize, Math.floor(i / fieldSize))
            );

        }

        this.columns = this.getSquaresColumns();
        this.reverseColumns = this.columns.map(column => [...column].reverse());
        this.rows = this.getSquaresRows();
        this.reverseRows = this.rows.map(row => [...row].reverse());
    }

    addRandomSquare() {
        const emptySquares = this.squares.filter(square => square.isEmpty());
        const randomNum = Math.floor(Math.random() * emptySquares.length);
        return emptySquares[randomNum];
    }

    getSquaresColumns() {
        return this.squares.reduce((groupedSquares, square) => {
            groupedSquares[square.x] = groupedSquares[square.x] || [];
            groupedSquares[square.x][square.y] = square;
            return groupedSquares;
        }, [])
    }

    getSquaresRows() {
        return this.squares.reduce((groupedSquares, square) => {
            groupedSquares[square.y] = groupedSquares[square.y] || [];
            groupedSquares[square.y][square.x] = square;
            return groupedSquares;
        }, [])
    }

    clear() {
        this.squares.forEach((square) => {
            if (square.linkedPlate) {
                square.linkedPlate.clear();
            }
            square.isEmpty();
        });
    }

}