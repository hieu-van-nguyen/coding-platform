import './App.css';
import AuthWrapper from './components/AuthWrapper';
import ProblemList from './components/ProblemList';
import ProblemDetail from './components/ProblemDetail';
import { auth } from './firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useState } from 'react';

function App() {
  const [user] = useAuthState(auth);
  const [selectedProblem, setSelectedProblem] = useState(null);

  return (
    <div>
      <AuthWrapper>
        {selectedProblem ? (
          <ProblemDetail
            problem={selectedProblem}
            onBack={() => setSelectedProblem(null)}
          />
        ) : (
          <ProblemList onProblemClick={setSelectedProblem} />
        )}
      </AuthWrapper>
    </div>
  );
}

export default App;
