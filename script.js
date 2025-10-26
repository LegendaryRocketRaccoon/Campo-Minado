let gameActive = false;      // Controla se o jogo está ativo
let rows, cols, mineCount;   // Dimensões do tabuleiro e quantidade de minas
let board = [];              // Matriz que representa o tabuleiro
let revealedCount = 0;       // Contador de células reveladas
let flagCount = 0;           // Contador de bandeiras colocadas
let timerInterval;           // Intervalo do cronômetro
let seconds = 0;             // Segundos decorridos


$(document).ready(function() {
    $('#startBtn').on('click', initGame);
});


function initGame() {

    rows = parseInt($('#rows').val());
    cols = parseInt($('#cols').val());
    mineCount = parseInt($('#mines').val());


    if (rows < 5 || rows > 20 || cols < 5 || cols > 20) {
        alert('As dimensões devem estar entre 5 e 20!');
        return;
    }

    if (mineCount < 1 || mineCount >= (rows * cols)) {
        alert('A quantidade de minas deve ser menor que o total de células!');
        return;
    }


    gameActive = true;
    revealedCount = 0;
    flagCount = 0;
    seconds = 0;
    board = [];


    $('#message').hide().removeClass('win lose');
    $('#gameInfo').show();
    $('#mineCount').text(mineCount);
    $('#flags').text('0 / ' + mineCount);
    $('#timer').text(0);


    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);


    createBoard();
    placeMines();
    calculateNumbers();
    renderBoard();
}


function createBoard() {
    board = [];
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < cols; j++) {
            board[i][j] = {
                hasMine: false,
                revealed: false,
                flagged: false,
                nearbyMines: 0
            };
        }
    }
}


function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * cols);
        
        if (!board[r][c].hasMine) {
            board[r][c].hasMine = true;
            minesPlaced++;
        }
    }
}


function calculateNumbers() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!board[i][j].hasMine) {
                let count = 0;
                

                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        let ni = i + di;
                        let nj = j + dj;
                        
                        if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                            if (board[ni][nj].hasMine) count++;
                        }
                    }
                }
                
                board[i][j].nearbyMines = count;
            }
        }
    }
}


function renderBoard() {
    const $board = $('#board');
    $board.empty();
    

    $board.css('grid-template-columns', `repeat(${cols}, 30px)`);
    

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const $cell = $('<div>')
                .addClass('cell')
                .attr('data-row', i)
                .attr('data-col', j)
                .attr('data-mine', board[i][j].hasMine)
                .attr('data-nearby', board[i][j].nearbyMines);
            
            // Adicionar eventos
            $cell.on('click', handleLeftClick);
            $cell.on('contextmenu', handleRightClick);
            
            $board.append($cell);
        }
    }
}


function handleLeftClick(e) {
    if (!gameActive) return;
    
    const $cell = $(e.currentTarget);
    const row = parseInt($cell.attr('data-row'));
    const col = parseInt($cell.attr('data-col'));
    
    if (board[row][col].revealed || board[row][col].flagged) return;
    
    revealCell(row, col);
}

function handleRightClick(e) {
    e.preventDefault();
    if (!gameActive) return;
    
    const $cell = $(e.currentTarget);
    const row = parseInt($cell.attr('data-row'));
    const col = parseInt($cell.attr('data-col'));
    
    if (board[row][col].revealed) return;
    

    if (board[row][col].flagged) {
        board[row][col].flagged = false;
        $cell.removeClass('flagged');
        flagCount--;
    } else {
        board[row][col].flagged = true;
        $cell.addClass('flagged');
        flagCount++;
    }
    
    $('#flags').text(flagCount + ' / ' + mineCount);
    checkWin();
}


function revealCell(row, col) {

    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    if (board[row][col].revealed || board[row][col].flagged) return;
    
    const $cell = $(`.cell[data-row="${row}"][data-col="${col}"]`);
    

    board[row][col].revealed = true;
    $cell.addClass('revealed');
    revealedCount++;
    

    if (board[row][col].hasMine) {
        $cell.addClass('mine');
        gameOver(false);
        return;
    }
    

    if (board[row][col].nearbyMines > 0) {
        $cell.text(board[row][col].nearbyMines);
    } else {

        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                if (di === 0 && dj === 0) continue;
                revealCell(row + di, col + dj);
            }
        }
    }
    
    checkWin();
}


function checkWin() {
    const totalCells = rows * cols;
    const safeCells = totalCells - mineCount;
    
    if (revealedCount === safeCells) {
        gameOver(true);
    }
}


function gameOver(won) {
    gameActive = false;
    clearInterval(timerInterval);
    

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j].hasMine) {
                const $cell = $(`.cell[data-row="${i}"][data-col="${j}"]`);
                $cell.addClass('mine revealed');
            }
        }
    }
    

    const $message = $('#message');
    if (won) {
        $message.addClass('win').text('🎉 Parabéns. Você venceu 🎉');
    } else {
        $message.addClass('lose').text('💥 Você perdeu 💥');
    }
    $message.show();
}


function updateTimer() {
    seconds++;
    $('#timer').text(seconds);
}