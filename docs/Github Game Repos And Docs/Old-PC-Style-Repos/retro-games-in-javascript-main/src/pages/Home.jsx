import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
} from "@mui/material";

const games = [
  { name: "Pong", path: "/pong", emoji: "🏓" },
  { name: "2048", path: "/2048", emoji: "🔢" },
  { name: "Snake", path: "/snake", emoji: "🐍" },
  { name: "Minesweeper", path: "/minesweeper", emoji: "💣" },
];

const Home = () => {
  return (
    <Box sx={{ flexGrow: 1, padding: 4 }}>
      <Typography variant="h3" gutterBottom fontWeight={"bold"}>
        Retro Game Simulator in JavaScript
      </Typography>
      <Grid container spacing={4}>
        {games.map((game) => (
          <Grid item xs={12} sm={6} md={3} key={game.name}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h3" component="div">
                  {game.emoji}
                </Typography>
                <Typography variant="h5" component="div">
                  {game.name}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={game.path}
                  sx={buttonStyle}
                >
                  {game.name}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const buttonStyle = {
  margin: "10px auto",
  padding: "10px 20px",
  fontSize: "16px",
  fontWeight: "bold", // Make the font bold
  cursor: "pointer",
  border: "none",
  backgroundColor: "#065535",
  color: "white",
  borderRadius: "5px",
  width: "100%", // Ensure the button width is 100% of its container
  maxWidth: "200px", // Set a maximum width for the button
  whiteSpace: "nowrap", // Prevent text from wrapping
  transition: "background-color 0.3s ease",
  "&:hover": {
    backgroundColor: "#21a1f1",
  },
};

export default Home;
