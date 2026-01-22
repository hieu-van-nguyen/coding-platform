import { useEffect, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { Checkbox, Container, Typography } from "@mui/material";
import { problemsColRef, auth, db } from "../firebase/config";
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

function ProblemList() {
  const [data, setData] = useState([]); 
  const [user] = useAuthState(auth);
  const [solved, setSolved] = useState(0);
  const userUID = user?.uid;

  const columns = [
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const solved = params.value === "Solved" ? true : false;
        return (
          <Checkbox
            checked={solved}
            disabled={!userUID}
            onChange={(e) => handleSolvedChange(
              params.row.id,
              e.target.checked
            )}
          />
        )
      }
    },
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
    let solvedSet = new Set();
    if (userUID) {
      const solvedSnapshot = await getDocs(collection(db, `users/${userUID}/submissions`));
      solvedSet = new Set(solvedSnapshot.docs.map(d => d.id));
      setSolved(solvedSet.size);
    }
    const problemList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      category: doc.data().category,
      problem: doc.data().problem,
      difficulty: doc.data().difficulty,
      javaSolution: doc.data().javaSolution,
      status: userUID 
        ? solvedSet.has(doc.id) ? "Solved" : "Unsolved"
        : "Unsolved"
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

  const handleSolvedChange = async (problemId, checked) => {
    if (!userUID) {
      return;
    }
    setData(prev => prev.map(
      row => row.id === problemId
      ? {...row, status:checked ? "Solved" : "Unsolved"}
      : row
    ));
    const ref = doc(db,`users/${userUID}/submissions/${problemId}`);
    if (checked) {
      await setDoc(ref, { solvedAt: Date.now() });
    } else {
      await deleteDoc(ref);
    }
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
          disableRowSelectionOnClick
        />
      </div>
    </Container>
  );
}

export default ProblemList;
