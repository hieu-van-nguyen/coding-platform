import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const LANGUAGE_TEMPLATES = {
  'Java': `class Solution {\n    public void solve() {\n        // Your code here\n    }\n}`,
  'JavaScript': `/**\n * @return {}\n */\nvar solve = function() {\n    // Your code here\n};`,
  'Python': `class Solution:\n    def solve(self):\n        # Your code here\n        pass`,
  'C++': `class Solution {\npublic:\n    void solve() {\n        // Your code here\n    }\n};`
};

function ProblemDetail({ problem, onBack }) {
  const [solution, setSolution] = useState('');
  const [language, setLanguage] = useState('Java');
  const [submitting, setSubmitting] = useState(false);
  const [leftWidth, setLeftWidth] = useState(400); // Initial width of the description panel

  useEffect(() => {
    setSolution(LANGUAGE_TEMPLATES[language] || '');
  }, [language]);

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Please login to submit your solution.');
      return;
    }

    setSubmitting(true);
    try {
      const ref = doc(db, `users/${user.uid}/submissions/${problem.id}`);
      await setDoc(ref, {
        solution: solution,
        language: language,
        submittedAt: Date.now(),
        problemId: problem.id,
        problemName: problem.problem
      }, { merge: true });
      alert('Solution submitted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit solution: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Resizing logic
  const startResizing = useCallback((e) => {
    const startX = e.clientX;
    const startWidth = leftWidth;

    const onMouseMove = (moveEvent) => {
      const currentX = moveEvent.clientX;
      const diff = currentX - startX;
      setLeftWidth(Math.max(200, Math.min(startWidth + diff, 800))); // Constrain width
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [leftWidth]);

  return (
    <Box sx={{ width: '100%', mt: 2, px: 2 }}>
      <Button onClick={onBack} style={{ marginBottom: 20 }}>
        Back to List
      </Button>
      <Typography variant="h4" gutterBottom>
        {problem.problem}
      </Typography>

      <Box
        display="flex"
        style={{
          height: 'calc(100vh - 150px)',
          border: '1px solid #ddd',
          borderRadius: 8,
          overflow: 'hidden'
        }}
      >
        {/* Left Panel: Description */}
        <Paper
          elevation={0}
          style={{
            width: leftWidth,
            height: '100%',
            overflowY: 'auto',
            borderRight: '1px solid #ddd',
            padding: 20,
            backgroundColor: '#f9f9f9'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
            {problem.description || 'No description available for this problem.'}
          </Typography>
        </Paper>

        {/* Resizer Handle */}
        <Box
          onMouseDown={startResizing}
          sx={{
            width: 8,
            cursor: 'col-resize',
            backgroundColor: '#eee',
            transition: 'background-color 0.2s',
            '&:hover': { backgroundColor: '#ccc' }
          }}
        />

        {/* Right Panel: Solution */}
        <Paper
          elevation={0}
          style={{
            flexGrow: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 20,
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Your Solution
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                label="Language"
                onChange={(e) => setLanguage(e.target.value)}
              >
                <MenuItem value="Java">Java</MenuItem>
                <MenuItem value="JavaScript">JavaScript</MenuItem>
                <MenuItem value="Python">Python</MenuItem>
                <MenuItem value="C++">C++</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            mb: 2,
            minHeight: 0 // Important for flex children to shrink
          }}>
            <TextField
              fullWidth
              multiline
              variant="outlined"
              placeholder="Enter your solution here..."
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  overflowY: 'auto'
                }
              }}
            />
          </Box>
          <Box display="flex" justifyContent="flex-end" sx={{ pb: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Solution'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default ProblemDetail;
