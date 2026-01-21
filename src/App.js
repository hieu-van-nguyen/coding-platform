import './App.css';
import AuthWrapper from './components/AuthWrapper';
import ProblemList from './components/ProblemList';
import { auth } from './firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

function App() {
  const [user] = useAuthState(auth);

  return (
    <div>
      <AuthWrapper>
        <ProblemList />
      </AuthWrapper>
    </div>
  );
}

export default App;
