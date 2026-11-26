import { useEffect, useMemo, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { problemsColRef, auth, db } from "../firebase/config";
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import useUrlFilters from '../hooks/useUrlFilters';
import {
  DEFAULT_FILTERS,
  DIFFICULTIES,
  applyFilters,
  collectOptions,
  compareDifficulty,
  hasActiveFilters,
  normalizeDifficulty,
} from '../utils/problemFilters';

const DIFFICULTY_COLORS = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'error',
};

function MultiSelectFilter({ label, options, value, onChange }) {
  return (
    <Autocomplete
      multiple
      size="small"
      options={options}
      value={value}
      onChange={(_, next) => onChange(next)}
      filterSelectedOptions
      limitTags={2}
      sx={{ minWidth: 180, flex: '1 1 180px' }}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}

function ProblemList({ onProblemClick }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [user] = useAuthState(auth);
  const userUID = user?.uid;

  const { solved, unsolved } = useMemo(() => {
    const solved = data.filter(r => r.status === "Solved").length;
    return { solved, unsolved: data.length - solved };
  }, [data]);

  const [filters, setFilters] = useUrlFilters();
  const updateFilter = (key) => (value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const options = useMemo(() => collectOptions(data), [data]);
  // Status is per-user, so ignore it when nobody is signed in (e.g. a shared link).
  const filteredRows = useMemo(
    () => applyFilters(data, userUID ? filters : { ...filters, status: 'all' }),
    [data, filters, userUID]
  );
  // Only show the "Solved by" column once the Cloud Function has written counts.
  const hasSolveCounts = useMemo(
    () => data.some((row) => typeof row.solvedCount === 'number'),
    [data]
  );

  const columns = [
    {
      field: "status",
      headerName: "Status",
      width: 90,
      renderCell: (params) => {
        const solved = params.value === "Solved" ? true : false;
        return (
          <Checkbox
            checked={solved}
            disabled={!userUID}
            // Keep the click from reaching the row, which would open the problem.
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleSolvedChange(
              params.row.id,
              e.target.checked
            )}
          />
        )
      }
    },
    { field: "category", headerName: "Category", width: 120 },
    { field: "problem", headerName: "Problem", flex: 1, minWidth: 180 },
    {
      field: "difficulty",
      headerName: "Difficulty",
      width: 120,
      sortComparator: compareDifficulty,
      renderCell: (params) => {
        const difficulty = normalizeDifficulty(params.value);
        if (!difficulty) return params.value || '—';
        return (
          <Chip
            label={difficulty}
            color={DIFFICULTY_COLORS[difficulty]}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: "tags",
      headerName: "Tags",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={0.5} alignItems="center" height="100%" overflow="hidden">
          {(params.value || []).map((tag) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Box>
      ),
    },
    ...(hasSolveCounts
      ? [{
          field: "solvedCount",
          headerName: "Solved by",
          type: "number",
          width: 110,
          valueGetter: (value) => value ?? 0,
          description: "Number of users who have solved this problem",
        }]
      : []),
    {
      field: "javaSolution",
      headerName: "Java Solution",
      width: 120,
      renderCell: (params) => {
        const url = params.value;
        if (!url) {
          return null;
        }
        return (
          <a
            className="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
            target="_blank"
            rel="noopener noreferrer"
            href={url}
            // Don't let the click bubble up to the row's onRowClick (which opens the problem)
            onClick={(e) => e.stopPropagation()}
          >
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
    const ref = doc(db,`users/${userUID}/progress/${problemId}`);
    try {
      if (checked) {
        await setDoc(ref, { solvedAt: Date.now() });
      } else {
        await deleteDoc(ref);
      }
    } catch (err) {
      console.error(err);
      // Roll back the optimistic update
      setData(prev => prev.map(row => row.id === problemId
        ? {...row, status: checked ? "Unsolved" : "Solved"}
        : row
      ));
      setError("Couldn't save your progress. Please try again.");
    }
  }

  // Refetch whenever the signed-in user changes (sign-in, sign-out, account switch)
  useEffect(() => {
    let cancelled = false;

    const fetchProblems = async () => {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(problemsColRef);
      let solvedSet = new Set();
      if (userUID) {
        // Solved status lives in progress/, separate from submitted code in submissions/.
        const solvedSnapshot = await getDocs(collection(db, `users/${userUID}/progress`));
        solvedSet = new Set(solvedSnapshot.docs.map(d => d.id));
      }
      const problemList = querySnapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          category: d.category,
          problem: d.problem,
          difficulty: d.difficulty,
          tags: Array.isArray(d.tags) ? d.tags.filter((t) => typeof t === 'string') : [],
          solvedCount: d.solvedCount,
          javaSolution: d.javaSolution,
          description: d.description,
          status: solvedSet.has(doc.id) ? "Solved" : "Unsolved",
        };
      });
      problemList.sort((a, b) => (a.category ?? "").localeCompare(b.category ?? ""));
      // Ignore results from a fetch started for a previous user
      if (!cancelled) {
        setData(problemList);
      }
    };

    fetchProblems()
      .catch(err => {
        console.error(err);
        if (!cancelled) {
          setError("Couldn't load problems. Check your connection and try again.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [userUID]);

  const filtersActive = hasActiveFilters(filters);

  return (
    <Container style={{ marginTop: 40 }}>
      <Typography variant="h5" gutterBottom>
        Problem List: {data.length}
      </Typography>
      <Box display="flex" gap={2} mb={2} alignItems="center">
        <Chip label={`Solved: ${solved}`} color="success" />
        <Chip label={`Unsolved: ${unsolved}`} />
        {filtersActive && (
          <Typography variant="body2" color="text.secondary">
            Showing {filteredRows.length} of {data.length}
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" flexWrap="wrap" gap={2} mb={2} alignItems="center">
        <TextField
          size="small"
          label="Search by title"
          value={filters.q}
          onChange={(e) => updateFilter('q')(e.target.value)}
          sx={{ minWidth: 200, flex: '2 1 200px' }}
          slotProps={{
            input: {
              endAdornment: filters.q ? (
                <InputAdornment position="end">
                  <Button size="small" onClick={() => updateFilter('q')('')}>
                    Clear
                  </Button>
                </InputAdornment>
              ) : null,
            },
          }}
        />
        <MultiSelectFilter
          label="Category"
          options={options.categories}
          value={filters.category}
          onChange={updateFilter('category')}
        />
        <MultiSelectFilter
          label="Difficulty"
          options={DIFFICULTIES}
          value={filters.difficulty}
          onChange={updateFilter('difficulty')}
        />
        {options.tags.length > 0 && (
          <MultiSelectFilter
            label="Tags"
            options={options.tags}
            value={filters.tags}
            onChange={updateFilter('tags')}
          />
        )}
        <TextField
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => updateFilter('status')(e.target.value)}
          disabled={!userUID}
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="solved">Solved</MenuItem>
          <MenuItem value="unsolved">Unsolved</MenuItem>
        </TextField>
        {filtersActive && (
          <Button onClick={() => setFilters({ ...DEFAULT_FILTERS })}>
            Clear filters
          </Button>
        )}
      </Box>

      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50]}
          onRowClick={(params) => onProblemClick(params.row)}
          localeText={{ noRowsLabel: filtersActive ? 'No problems match these filters' : 'No problems' }}
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
