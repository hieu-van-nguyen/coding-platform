import logo from './logo.svg';
import './App.css';
import {app} from "./firebase/config";
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { Container, Typography } from "@mui/material";

function App() {
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'problem', headerName: 'Problem', width: 150, editable: true },
    { field: 'javaSolution', headerName: 'Java Solution', width: 150, editable: true },
  ];

  const rows = [
    { id: 1, problem: 'Snow', javaSolution: 'Jon'},
    { id: 2, problem: 'Lannister', javaSolution: 'Cersei'},
    { id: 3, problem: 'Lannister', javaSolution: 'Jaime' },
    { id: 4, problem: 'Stark', javaSolution: 'Arya' },
    { id: 5, problem: 'Targaryen', javaSolution: 'Daenerys' },
  ];

  return (
    <Container style={{ marginTop: 40 }}>
      <Typography variant="h5" gutterBottom>
        Problem List
      </Typography>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </div>
    </Container>
  );
}

export default App;
