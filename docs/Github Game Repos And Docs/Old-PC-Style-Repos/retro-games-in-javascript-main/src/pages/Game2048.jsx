import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import "./css/Game2048.css";

const Game2048 = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const gridSize = 4;
  const cellSize = 100;

  const [grid, setGrid] = useState(
    Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null))
  );
  const [initialized, setInitialized] = useState(false);

  const getRandomEmptyCell = (grid) => {
    const emptyCells = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }
    if (emptyCells.length === 0) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  const initializeGrid = () => {
    const newGrid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null));

    let cell = getRandomEmptyCell(newGrid);
    if (cell) newGrid[cell.row][cell.col] = 2;

    cell = getRandomEmptyCell(newGrid);
    if (cell) newGrid[cell.row][cell.col] = Math.random() < 0.9 ? 2 : 4;

    setGrid(newGrid);
    setInitialized(true);
  };

  const addNewTile = (grid) => {
    const newGrid = grid.map((row) => [...row]);
    const cell = getRandomEmptyCell(newGrid);
    if (cell) newGrid[cell.row][cell.col] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  };

  const drawGrid = (context) => {
    const canvasWidth = gridSize * cellSize;
    const canvasHeight = gridSize * cellSize;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.strokeStyle = "white";
    for (let i = 0; i <= gridSize; i++) {
      context.beginPath();
      context.moveTo(i * cellSize, 0);
      context.lineTo(i * cellSize, canvasHeight);
      context.stroke();
      context.beginPath();
      context.moveTo(0, i * cellSize);
      context.lineTo(canvasWidth, i * cellSize);
      context.stroke();
    }
  };

  const drawGridAndNumbers = (context) => {
    drawGrid(context);
    context.fillStyle = "white";
    context.font = "30px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col] !== null) {
          context.fillStyle = "white";
          context.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
          context.fillStyle = "black";
          context.fillText(
            grid[row][col],
            col * cellSize + cellSize / 2,
            row * cellSize + cellSize / 2
          );
        }
      }
    }
  };

  const handleKeyDown = (event) => {
    let moved = false;
    const newGrid = grid.map((row) => [...row]);

    const slide = (row) => {
      const newRow = row.filter((val) => val !== null);
      for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
          newRow[i] *= 2;
          newRow[i + 1] = null;
        }
      }
      return newRow
        .filter((val) => val !== null)
        .concat(
          Array(gridSize - newRow.filter((val) => val !== null).length).fill(
            null
          )
        );
    };

    switch (event.key) {
      case "w":
        for (let col = 0; col < gridSize; col++) {
          const column = newGrid.map((row) => row[col]);
          const newColumn = slide(column);
          for (let row = 0; row < gridSize; row++) {
            if (newGrid[row][col] !== newColumn[row]) {
              newGrid[row][col] = newColumn[row];
              moved = true;
            }
          }
        }
        break;
      case "s":
        for (let col = 0; col < gridSize; col++) {
          const column = newGrid.map((row) => row[col]).reverse();
          const newColumn = slide(column).reverse();
          for (let row = 0; row < gridSize; row++) {
            if (newGrid[row][col] !== newColumn[row]) {
              newGrid[row][col] = newColumn[row];
              moved = true;
            }
          }
        }
        break;
      case "a":
        for (let row = 0; row < gridSize; row++) {
          const newRow = slide(newGrid[row]);
          if (newGrid[row].some((val, index) => val !== newRow[index])) {
            newGrid[row] = newRow;
            moved = true;
          }
        }
        break;
      case "d":
        for (let row = 0; row < gridSize; row++) {
          const newRow = slide(newGrid[row].reverse()).reverse();
          if (newGrid[row].some((val, index) => val !== newRow[index])) {
            newGrid[row] = newRow;
            moved = true;
          }
        }
        break;
      default:
        break;
    }

    if (moved) {
      setGrid(addNewTile(newGrid));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Initialize the grid with two random tiles
    if (!initialized) {
      initializeGrid();
    }

    // Draw the initial grid and numbers
    drawGridAndNumbers(context);

    // Redraw the grid and numbers whenever the grid changes
    const draw = () => {
      drawGridAndNumbers(context);
    };

    draw();

    // Add event listener for keydown
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [grid, initialized]);

  return (
    <Box sx={{ p: 4, textAlign: "center", fontFamily: "Arial, sans-serif" }}>
      <Typography variant="h4" fontWeight={"bold"}>
        2048
      </Typography>
      <canvas
        ref={canvasRef}
        width={gridSize * cellSize}
        height={gridSize * cellSize}
        style={{ border: "1px solid white" }}
      />
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button onClick={() => navigate("/")} sx={buttonStyle}>
          Back to Home
        </Button>
      </Box>
    </Box>
  );
};

const buttonStyle = {
  margin: "10px",
  padding: "10px 20px",
  fontSize: "16px",
  fontWeight: "bold", // Make the font bold
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

export default Game2048;
