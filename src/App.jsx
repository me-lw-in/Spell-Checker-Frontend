import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import axios from "axios";
import "./App.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#667eea",
    },
    secondary: {
      main: "#764ba2",
    },
  },
});

function App() {
  const [inputText, setInputText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCorrectSpelling = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to correct");
      return;
    }

    setLoading(true);
    setError("");
    setCorrectedText("");
    setDetails(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8001/correct",
        { text: inputText },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        }
      );

      const data = response.data;
      setCorrectedText(data.corrected || inputText);

      // ✅ Directly use backend response
      setDetails({
        original: data.original,
        corrected: data.corrected,
        confidence: data.confidence,
        accuracy: data.accuracy,
        usedFallback: data.used_fallback,
        timeTaken: data.time_taken_seconds, // sent from backend
      });

      if (data.corrected === inputText) {
        setError("No spelling errors found!");
      }
    } catch (err) {
      console.error(err);
      setError("Error: Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText("");
    setCorrectedText("");
    setError("");
    setDetails(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="app-container">
        <Container maxWidth="xl">
          <Paper elevation={6} className="main-paper">
            <Box className="header">
              <SpellcheckIcon sx={{ fontSize: 48, color: "#667eea", mb: 2 }} />
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                className="title"
              >
                Spelling Correction
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="info"
                onClose={() => setError("")}
                sx={{ mb: 3 }}
              >
                {error}
              </Alert>
            )}

            <Box className="three-box-layout">
              <Paper className="box input-box" elevation={3}>
                <Typography variant="h6" className="box-title">
                  Input Text
                </Typography>
                <TextField
                  multiline
                  rows={12}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your text..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </Paper>

              <Box className="box button-box">
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleCorrectSpelling}
                  disabled={loading || !inputText.trim()}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <SpellcheckIcon />
                    )
                  }
                  sx={{ mb: 2, height: "60px" }}
                >
                  {loading ? "Correcting..." : "Correct Spelling"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={handleClear}
                  sx={{ height: "60px" }}
                >
                  Clear All
                </Button>
              </Box>

              <Paper className="box output-box" elevation={3}>
                <Typography variant="h6" className="box-title">
                  Corrected Text
                </Typography>
                <Paper variant="outlined" className="output-content">
                  {correctedText ? (
                    <Box>
                      <Typography sx={{ mb: 2 }}>{correctedText}</Typography>

                      {details && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 2,
                            borderRadius: "8px",
                            backgroundColor: details.usedFallback
                              ? "#fff8e1"
                              : "#f4f4f9",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Details:
                          </Typography>

                          {details.usedFallback ? (
                            <>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                ⚙️ Gemini fallback used
                              </Typography>
                              <Typography variant="body2">
                                Time Taken: {details.timeTaken}s
                              </Typography>
                            </>
                          ) : (
                            <>
                              <Typography variant="body2">
                                Original: {details.original}
                              </Typography>
                              <Typography variant="body2">
                                Corrected: {details.corrected}
                              </Typography>
                              <Typography variant="body2">
                                Accuracy:{" "}
                                {details.accuracy !== null
                                  ? `${(details.accuracy).toFixed(2)}%`
                                  : "N/A"}
                              </Typography>
                              <Typography variant="body2">
                                Confidence:{" "}
                                {details.confidence !== null
                                  ? `${(details.confidence).toFixed(2)}%`
                                  : "N/A"}
                              </Typography>
                              <Typography variant="body2">
                                Time Taken: {details.timeTaken}s
                              </Typography>
                            </>
                          )}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">
                      Corrected text will appear here...
                    </Typography>
                  )}
                </Paper>
              </Paper>
            </Box>
          </Paper>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
