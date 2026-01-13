import logo from './logo.svg';
import './App.css';
import {app} from "./firebase/config";

function App() {
  return (
    <div className="App">
      <p>{app._options.projectId}</p>
    </div>
  );
}

export default App;
