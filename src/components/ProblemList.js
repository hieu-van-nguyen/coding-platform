import { useEffect, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { Checkbox, Container, Typography, Box, Chip } from "@mui/material";
import { problemsColRef, auth, db } from "../firebase/config";
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

function ProblemList() {
  const [data, setData] = useState([]); 
  const [user] = useAuthState(auth);
  const [solved, setSolved] = useState(0);
  const [unsolved, setUnsolved] = useState(0);
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

  const reCalcCount = (data) => {
    const solved = data.filter(r => r.status === "Solved").length;
    return {
      solved,
      unsolved: data.length - solved
    };
  }

  const handleSolvedChange = async (problemId, checked) => {
    if (!userUID) {
      return;
    }
    setData(prev => {
      const updated = prev.map(row => row.id === problemId
        ? {...row, status:checked ? "Solved" : "Unsolved"}
        : row
      );
      const {solved, unsolved} = reCalcCount(updated);
      setSolved(solved);
      setUnsolved(unsolved);
      return updated;
    });
    const ref = doc(db,`users/${userUID}/submissions/${problemId}`);
    try {
      if (checked) {
        await setDoc(ref, { solvedAt: Date.now() });
      } else {
        await deleteDoc(ref);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    if (data.length) {
      const { solved, unsolved } = reCalcCount(data);
      setSolved(solved);
      setUnsolved(unsolved);
    }
  }, [data.length]);

  return (
    <Container style={{ marginTop: 40 }}>
      <Typography variant="h5" gutterBottom>
        Problem List: {data.length}
      </Typography>
      <Box display="flex" gap={2} mb={1}>
        <Chip label={`Solved: ${solved}`} color="success" />
        <Chip label={`Unsolved: ${unsolved}`} />
      </Box>

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
