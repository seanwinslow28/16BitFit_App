import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Grid } from "@mui/material";
import "./css/Minesweeper.css";

const Minesweeper = () => {
  const navigate = useNavigate();
  const [grid, setGrid] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);

  const handleStartGame = (rows, cols, minesPlaced) => {
    setGrid(createEmptyGrid(rows, cols, minesPlaced));
    setIsGameOver(false);
    setIsWin(false);
  };

  const handleClick = (row, col) => {
    if (isGameOver || grid[row][col].isFlagged) return;

    if (grid[row][col].isMine) {
      revealAllMines();
      setIsGameOver(true);
    } else {
      // Reveal cells recursively
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        revealCells(newGrid, row, col);
        if (checkWin(newGrid)) {
          setIsGameOver(true);
          setIsWin(true);
        }
        return newGrid;
      });
    }
  };

  const handleRightClick = (event, row, col) => {
    event.preventDefault(); // Prevent the default context menu
    if (isGameOver || grid[row][col].isRevealed) return;

    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      newGrid[row][col].isFlagged = !newGrid[row][col].isFlagged;
      return newGrid;
    });
  };

  const revealAllMines = () => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) =>
        row.map((cell) => ({
          ...cell,
          isRevealed: cell.isMine || cell.isRevealed,
        }))
      );
      return newGrid;
    });
  };

  const checkWin = (grid) => {
    for (let row of grid) {
      for (let cell of row) {
        if (!cell.isMine && !cell.isRevealed) {
          return false;
        }
      }
    }
    return true;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Button
        onClick={() => navigate("/")}
        variant="contained"
        sx={buttonStyle}
      >
        Back to Home
      </Button>
      {!grid && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Select Difficulty
          </Typography>
          <Button
            onClick={() => handleStartGame(8, 8, 10)}
            variant="contained"
            sx={buttonStyle}
          >
            Easy
          </Button>
          <Button
            onClick={() => handleStartGame(9, 9, 10)}
            variant="contained"
            sx={buttonStyle}
          >
            Medium
          </Button>
          <Button
            onClick={() => handleStartGame(10, 10, 10)}
            variant="contained"
            sx={buttonStyle}
          >
            Hard
          </Button>
        </Box>
      )}
      {grid && (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Minesweeper
          </Typography>
          <Grid container spacing={0} justifyContent="center">
            {grid.map((row, rowIndex) => (
              <Grid item key={rowIndex} container justifyContent="center">
                {row.map((cell, colIndex) => (
                  <Box
                    key={colIndex}
                    className={`cell ${cell.isRevealed ? "revealed" : ""}`}
                    sx={{
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid black",
                      cursor: "pointer",
                      backgroundColor: cell.isRevealed ? "#e0e0e0" : "#9e9e9e",
                      color: cell.isMine ? "red" : "black",
                    }}
                    onClick={() => handleClick(rowIndex, colIndex)}
                    onContextMenu={(event) =>
                      handleRightClick(event, rowIndex, colIndex)
                    }
                  >
                    {cell.isRevealed &&
                      (cell.isMine
                        ? "💣"
                        : cell.adjacentMines > 0
                        ? cell.adjacentMines
                        : "")}
                    {cell.isFlagged && !cell.isRevealed && "🚩"}
                  </Box>
                ))}
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      {(isGameOver || isWin) && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h4">
            {isWin ? "You Win!" : "Game Over"}
          </Typography>
          <Button
            onClick={() =>
              handleStartGame(
                grid.length,
                grid[0].length,
                grid.flat().filter((cell) => cell.isMine).length
              )
            }
            variant="contained"
            sx={buttonStyle}
          >
            Restart
          </Button>
          {isWin && (
            <Box>
              <Button
                onClick={() => handleStartGame(8, 8, 10)}
                variant="contained"
                sx={buttonStyle}
              >
                Try Easy
              </Button>
              <Button
                onClick={() => handleStartGame(9, 9, 10)}
                variant="contained"
                sx={buttonStyle}
              >
                Try Medium
              </Button>
              <Button
                onClick={() => handleStartGame(10, 10, 10)}
                variant="contained"
                sx={buttonStyle}
              >
                Try Hard
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

const createEmptyGrid = (rows, cols, minesCount) => {
  const grid = [];
  for (let i = 0; i < rows; i++) {
    grid.push(
      Array(cols)
        .fill()
        .map(() => ({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        }))
    );
  }

  // Randomly place mines
  let minesPlaced = 0;
  var count = 0;
  while (minesPlaced < minesCount) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    count++;
    if (!grid[row][col].isMine) {
      console.log(`bomb ${count} placed: (${col}, ${row})`);
      grid[row][col].isMine = true;
      minesPlaced++;
    }
  }

  return grid;
};

const countAdjacentMines = (grid, row, col) => {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  let count = 0;
  for (let [dx, dy] of directions) {
    const newRow = row + dx;
    const newCol = col + dy;
    if (
      newRow >= 0 &&
      newRow < grid.length &&
      newCol >= 0 &&
      newCol < grid[0].length &&
      grid[newRow][newCol].isMine
    ) {
      count++;
    }
  }

  return count;
};

const revealCells = (grid, row, col) => {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  const stack = [[row, col]];
  while (stack.length) {
    const [currentRow, currentCol] = stack.pop();
    if (grid[currentRow][currentCol].isRevealed) continue;

    grid[currentRow][currentCol].isRevealed = true;
    const adjacentMines = countAdjacentMines(grid, currentRow, currentCol);
    grid[currentRow][currentCol].adjacentMines = adjacentMines;

    if (adjacentMines === 0) {
      for (let [dx, dy] of directions) {
        const newRow = currentRow + dx;
        const newCol = currentCol + dy;
        if (
          newRow >= 0 &&
          newRow < grid.length &&
          newCol >= 0 &&
          newCol < grid[0].length &&
          !grid[newRow][newCol].isRevealed
        ) {
          stack.push([newRow, newCol]);
        }
      }
    }
  }
};

const buttonStyle = {
  margin: "10px",
  padding: "10px 20px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  border: "none",
  backgroundColor: "#065535",
  color: "white",
  borderRadius: "5px",
  transition: "background-color 0.3s ease",
  "&:hover": {
    backgroundColor: "#21a1f1",
  },
};

export default Minesweeper;
