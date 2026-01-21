import { useEffect, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { Container, Typography } from "@mui/material";
import { problemsColRef } from "../firebase/config";
import { addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

function ProblemList() {
  const [data, setData] = useState([]); 
  const [solved, setSolved] = useState(0);

  const columns = [
    { field: "category", headerName: "Category", width: 90 },
    { field: "problem", headerName: "Problem", width: 150, editable: true },
    { field: "difficulty", headerName: "Difficulty", width: 150, editable: true },
    {
      field: "javaSolution",
      headerName: "Java Solution",
      width: 150,
      renderCell: (params) => {
        return (
          <a target="blank" href={`${params.row.javaSolution}`}>
            link
          </a>
        );
      },
    },
  ];
  
  const fetchProblems = async () => {
    const querySnapshot = await getDocs(problemsColRef);
    const problemList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      category: doc.data().category,
      problem: doc.data().problem,
      difficulty: doc.data().difficulty,
      javaSolution: doc.data().javaSolution
    }));
    problemList.sort((a, b) => {
      if (a.category < b.category) {
        return -1;
      } else if (a.category > b.category) {
        return 1;
      } else {
        return 0;
      }
    });
    setData(problemList);
  }

  useEffect(() => {
    fetchProblems();
  }, []);

  return (
    <Container style={{ marginTop: 40 }}>
      <Typography variant="h5" gutterBottom>
        Problem List: {data.length}
      </Typography>
      <Typography variant="h5" gutterBottom>
        Problem Solved: {solved}
      </Typography>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={data}
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

export default ProblemList;
