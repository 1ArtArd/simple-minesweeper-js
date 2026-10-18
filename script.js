
const board = document.getElementById("board")
const status = document.getElementById("status")
const counter = document.getElementById("counter")
const restart = document.getElementById("restart")

let rows = 4
let columns = 20
let maxMines = 5

let remaining = maxMines
let mines = maxMines
let revealed = 0
let firstMove = true
let gameOver = false

const boardData = []
const picture = []
const tiles = []


function check(row, column) {
    if (isInside(row, column)) {
        return boardData[row][column]
    }
}

function isInside(row, column) {
    return column >= 0 && row >= 0 &&
           column < columns && row < rows
}

function updateCounter() {
    counter.textContent = 'Mines left: ' + remaining
}

function setmines(row, column) {
    let max = maxMines
    mines = maxMines

    while (max > 0) {
        let index = Math.floor(Math.random() * rows * columns)
        let r = (index / columns) | 0
        let c = index % columns

        if (boardData[r][c] != 'mine' &&
            (r != row || c != column)) {
            boardData[r][c] = 'mine'
            max--
        }
    }
}

function minesStat() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (boardData[r][c] != 'mine') {
                let count = 0

                for (let i = r - 1; i <= r + 1; i++) {
                    for (let j = c - 1; j <= c + 1; j++) {
                        if (check(i, j) == 'mine') {
                            count++
                        }
                    }
                }

                boardData[r][c] = count
            }
        }
    }
}

function reveal(row, column) {
    if (!isInside(row, column) || gameOver) return

    if (picture[row][column] != 'hidden' &&
        picture[row][column] != 'question') {
        return
    }

    if (boardData[row][column] == 'mine') return

    revealed++

    picture[row][column] = boardData[row][column]
    tiles[row][column].src =
        'img/' + boardData[row][column] + '.png'

    if (boardData[row][column] == 0) {
        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = column - 1; j <= column + 1; j++) {
                if (isInside(i, j) &&
                    check(i, j) != 'mine' &&
                    picture[i][j] == 'hidden') {
                    reveal(i, j)
                }
            }
        }
    }

    if (revealed == rows * columns - mines) {
        status.textContent = 'YOU WIN!'
        restart.textContent = 'Click here to play again'
        gameOver = true

    }
}

function lose() {
    gameOver = true
    status.textContent = 'GAME OVER'
    restart.textContent = 'Click here to play again'

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (boardData[r][c] == 'mine') {
                tiles[r][c].src = 'img/mine.png'
            } else if (picture[r][c] == 'flag') {
                tiles[r][c].src = 'img/misplaced.png'
            }
        }
    }
}

board.style.setProperty('--columns', columns)

for (let r = 0; r < rows; r++) {
    boardData[r] = []
    picture[r] = []
    tiles[r] = []

    for (let c = 0; c < columns; c++) {
        let imgElem = document.createElement('img')

        imgElem.src = 'img/hidden.png'
        imgElem.width = 30
        imgElem.height = 30
        imgElem.draggable = false
        imgElem.id = r * columns + c
        imgElem.addEventListener('mousedown', click)

        tiles[r][c] = imgElem
        picture[r][c] = 'hidden'
        boardData[r][c] = ''

        board.appendChild(imgElem)
    }
}

function click(event) {
    if (gameOver) return

    event.preventDefault()

    let id = Number(event.target.id)
    let r = (id / columns) | 0
    let c = id % columns

    if (event.button == 2) {
        if (picture[r][c] == 'hidden') {
            picture[r][c] = 'flag'
            tiles[r][c].src = 'img/flag.png'
            remaining--
        } else if (picture[r][c] == 'flag') {
            picture[r][c] = 'question'
            tiles[r][c].src = 'img/question.png'
            remaining++
        } else if (picture[r][c] == 'question') {
            picture[r][c] = 'hidden'
            tiles[r][c].src = 'img/hidden.png'
        }

        updateCounter()
        return
    }

    if (event.button == 0 && picture[r][c] != 'flag') {
        if (firstMove) {
            setmines(r, c)
            minesStat()
            firstMove = false
        }

        if (boardData[r][c] == 'mine') {
            lose()
        } else {
            reveal(r, c)
        }
    }
}

updateCounter()