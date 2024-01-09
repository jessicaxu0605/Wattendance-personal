import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

import UserContext from './UserContext.js';



  

function ProfileClassesTable(){
  const columns = [
    { id: 'course', label: 'Course', minWidth: 170 },
    { id: 'code', label: 'Course Code', minWidth: 100 },
    {
      id: 'attendance',
      label: 'Attendance',
      minWidth: 170,
      align: 'right',
      // format: (value) => value.toLocaleString('en-US'),
    },
  ];
  
  function createData(course, code, attendance) {
    return {course, code, attendance};
  }

  const [rows, setRows] = React.useState([]);
  const [dataFetched, setDataFetched] = React.useState(false);

 

  const getCourse= async(courseID, userID)=>{
    const options = {
      mode: 'cors',
      method: 'GET',
    }
    const response = await fetch(`http://localhost:3600/overall-attendance?userID=${userID}&courseID=${courseID}`, options);
    //const response = await fetch('http://18.223.107.181:3600/get-user-course-attendance', options);
    const result = await response.json();
    return result;
  }
  const user = React.useContext(UserContext).value;
  const userID = user.id;

  const getCourses = async()=> {
    const rowsArray = [];
    for (let i = 1; i < 7; i++){
      const newRow = await getCourse(i, userID);
      rowsArray.push(newRow);
    }
    setRows(rowsArray);
    setDataFetched(true);
  }
  React.useEffect(
    ()=> {
      getCourses();
    },
    []
  )
  

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const table = <TableBody>
  {rows
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((row) => {
      return (
        <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
          {columns.map((column) => {
            const value = row[column.id];
            return (
              <TableCell key={column.id} align={column.align}>
                {column.format && typeof value === 'number'
                  ? column.format(value)
                  : value}
              </TableCell>
            );
          })}
        </TableRow>
      );
    })}
</TableBody>

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', m: 0 }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {dataFetched ? table : <div>Loading...</div>}
          
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default ProfileClassesTable;