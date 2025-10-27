import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import axios from 'axios';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
});

function App() {
  const [inputText, setInputText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCorrectSpelling = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to correct');
      return;
    }

    setLoading(true);
    setError('');
    setCorrectedText('');

    try {
      const apiUrl = import.meta.env.DEV 
        ? '/api/correct' 
        : 'https://spell-checker-backend.onrender.com/correct';
      
      const response = await axios.post(
        apiUrl,
        { text: inputText },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const corrected = response.data.corrected_text || response.data.correctedText || response.data.text || inputText;
      
      setCorrectedText(corrected);
      
      if (corrected === inputText) {
        setError('No spelling errors found!');
      }
    } catch (err) {
      setError('Error: Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setCorrectedText('');
    setError('');
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="app-container">
        <Container maxWidth="xl">
          <Paper elevation={6} className="main-paper">
            <Box className="header">
              <SpellcheckIcon sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
              <Typography variant="h3" component="h1" gutterBottom className="title">
                Spelling Correction
              </Typography>
            </Box>

            {error && (
              <Alert severity="info" onClose={() => setError('')} sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box className="three-box-layout">
              <Paper className="box input-box" elevation={3}>
                <Typography variant="h6" className="box-title">Input Text</Typography>
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
                  startIcon={loading ? <CircularProgress size={20} /> : <SpellcheckIcon />}
                  sx={{ mb: 2, height: '60px' }}
                >
                  {loading ? 'Correcting...' : 'Correct Spelling'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={handleClear}
                  sx={{ height: '60px' }}
                >
                  Clear All
                </Button>
              </Box>

              <Paper className="box output-box" elevation={3}>
                <Typography variant="h6" className="box-title">Corrected Text</Typography>
                <Paper variant="outlined" className="output-content">
                  {correctedText ? (
                    <Typography>{correctedText}</Typography>
                  ) : (
                    <Typography color="text.secondary">Corrected text will appear here...</Typography>
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
