import './App.css';
import { DataGrid } from '@mui/x-data-grid';
import { Container, Typography } from "@mui/material";
import { rows } from "./data";

function App() {
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'category', headerName: 'Category', width: 90 },
    { field: 'problem', headerName: 'Problem', width: 150, editable: true },
    { 
      field: 'javaSolution', 
      headerName: 'Java Solution', 
      width: 150,
      renderCell: (params) => {
        return (
          <a target='blank' href={`${params.row.javaSolution}`}>link</a>
        );
      }
    },
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
