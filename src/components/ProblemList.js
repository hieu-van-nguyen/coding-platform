import { useEffect, useMemo, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { Checkbox, Container, Typography, Box, Chip } from "@mui/material";
import { problemsColRef, auth, db } from "../firebase/config";
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

function ProblemList({ onProblemClick }) {
  const [data, setData] = useState([]);

  const [user] = useAuthState(auth);
  const userUID = user?.uid;

  const { solved, unsolved } = useMemo(() => {
    const solved = data.filter(r => r.status === "Solved").length;
    return { solved, unsolved: data.length - solved };
  }, [data]);

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
            // Don't let the click bubble up to the row's onRowClick (which opens the problem)
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleSolvedChange(
              params.row.id,
              e.target.checked
            )}
          />
        )
      }
    },
    { field: "category", headerName: "Category", width: 90 },
    { field: "problem", headerName: "Problem", width: 150 },
    { field: "difficulty", headerName: "Difficulty", width: 150 },
    {
      field: "javaSolution",
      headerName: "Java Solution",
      width: 150,
      renderCell: (params) => {
        return (
          <a className="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover" target="_blank" rel="noopener noreferrer" href={params.row.javaSolution}>
            link
          </a>
        );
      },
    },
  ];
  
  const handleSolvedChange = async (problemId, checked) => {
    if (!userUID) {
      return;
    }
    setData(prev => prev.map(row => row.id === problemId
      ? {...row, status: checked ? "Solved" : "Unsolved"}
      : row
    ));
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

  // Refetch whenever the signed-in user changes (sign-in, sign-out, account switch)
  useEffect(() => {
    let cancelled = false;

    const fetchProblems = async () => {
      const querySnapshot = await getDocs(problemsColRef);
      let solvedSet = new Set();
      if (userUID) {
        const solvedSnapshot = await getDocs(collection(db, `users/${userUID}/submissions`));
        solvedSet = new Set(solvedSnapshot.docs.map(d => d.id));
      }
      const problemList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        category: doc.data().category,
        problem: doc.data().problem,
        difficulty: doc.data().difficulty,
        javaSolution: doc.data().javaSolution,
        description: doc.data().description,
        status: solvedSet.has(doc.id) ? "Solved" : "Unsolved",
      }));
      problemList.sort((a, b) => (a.category ?? "").localeCompare(b.category ?? ""));
      // Ignore results from a fetch started for a previous user
      if (!cancelled) {
        setData(problemList);
      }
    };

    fetchProblems().catch(err => console.error(err));
    return () => { cancelled = true; };
  }, [userUID]);

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
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50]}
          onRowClick={(params) => onProblemClick(params.row)}
          sx={{
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer',
            },
          }}
        />
      </div>
    </Container>
  );
}

export default ProblemList;
