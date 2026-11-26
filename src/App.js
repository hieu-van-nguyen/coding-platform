import './App.css';
import AuthWrapper from './components/AuthWrapper';
import NavBar, { NAV_ITEMS } from './components/NavBar';
import ProblemList from './components/ProblemList';
import ProblemDetail from './components/ProblemDetail';
import { Container, Typography } from '@mui/material';
import { useState } from 'react';

function ComingSoon({ title }) {
  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>{title}</Typography>
      <Typography color="text.secondary">This page is coming soon.</Typography>
    </Container>
  );
}

function App() {
  const [page, setPage] = useState('problems');
  const [selectedProblem, setSelectedProblem] = useState(null);

  const navigate = (key) => {
    setPage(key);
    setSelectedProblem(null);
  };

  let content;
  if (page !== 'problems') {
    content = <ComingSoon title={NAV_ITEMS.find((item) => item.key === page).label} />;
  } else if (selectedProblem) {
    content = (
      <ProblemDetail
        problem={selectedProblem}
        onBack={() => setSelectedProblem(null)}
      />
    );
  } else {
    content = <ProblemList onProblemClick={setSelectedProblem} />;
  }

  return (
    <div>
      <NavBar activeKey={page} onNavigate={navigate} />
      <AuthWrapper>{content}</AuthWrapper>
    </div>
  );
}

export default App;
