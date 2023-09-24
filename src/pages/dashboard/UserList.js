import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import {
  Card,
  Table,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// _mock_
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { UserListHead, UserListToolbar, UserMoreMenu } from '../../sections/@dashboard/user/list';

// ----------------------------------------------------------------------

/* eslint-disable camelcase */


const TABLE_HEAD = [
  { id: 'sensor_id', label: 'Sensor ID', alignRight: false },
  { id: 'deviceID', label: 'Device ID', alignRight: false },
  { id: 'sensor_type', label: 'Sensor Type', alignRight: false },
  { id: 'value_type', label: 'Values Type', alignRight: false },
  { id: 'unit', label: 'Unit', alignRight: false },
  // { id: 'isVerified', label: 'Verified', alignRight: false },
  // { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function UserList() {


  useEffect(() => {
    fetch("/api/sensorData", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json()).then((data) => {
      console.log(data);
      setUserList(data);
      return data;
    }).catch((err) => {
      console.log(err);
    })
  }, []);


  const theme = useTheme();
  const { themeStretch } = useSettings();
  const [userList, setUserList] = useState([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // const handleSelectAllClick = (checked) => {
  //   if (checked) {
  //     const newSelecteds = userList.map((n) => n.name);
  //     setSelected(newSelecteds);
  //     return;
  //   }
  //   setSelected([]);
  // };

  // const handleClick = (name) => {
  //   const selectedIndex = selected.indexOf(name);
  //   let newSelected = [];
  //   if (selectedIndex === -1) {
  //     newSelected = newSelected.concat(selected, name);
  //   } else if (selectedIndex === 0) {
  //     newSelected = newSelected.concat(selected.slice(1));
  //   } else if (selectedIndex === selected.length - 1) {
  //     newSelected = newSelected.concat(selected.slice(0, -1));
  //   } else if (selectedIndex > 0) {
  //     newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
  //   }
  //   setSelected(newSelected);
  // };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // csrftoken and sessionid from django session

  const getCookie = (name) => {
    let cookieValue = null;
    if(document.cookie && document.cookie !== ''){
      const cookies = document.cookie.split(';');
      for(let i = 0; i < cookies.length; i+=1){
        const cookie = cookies[i].trim();
        /* eslint-disable prefer-template */
        if(cookie.substring(0, name.length + 1) === (name + '=')){
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  const handleDeleteUser = async(sensor_id) => {
    const deleteUser = userList.filter((sensor) => sensor.sensor_id !== sensor_id);
    setSelected([]);
    setUserList(deleteUser);

    const csrftoken = getCookie('csrftoken');

    // fetch session id using axios and csrftoken
    const response1 = await axios.get('/api/get_session_id/', {
      headers: {
        'X-CSRFToken': csrftoken,
      },
    });

  

    
    const formData = {
      // eslint-disable-next-line object-shorthand
      sensor_id: sensor_id
    }
    const settings = {
      method: 'DELETE',
      creadentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'text/plain',
        Cookie: `sessionid=${response1.data.session_id}; csrftoken=${csrftoken}`,
      },
      body: JSON.stringify(formData),
    };
    const response = await fetch('/api/sensorData/', settings);
    if(response.status === 200){
      console.log("Sensor Deleted");
    }else{
      console.log("Sensor Not Deleted");
      alert("Sensor Not Deleted");
    }
  };

  // const handleDeleteMultiUser = (selected) => {
  //   const deleteUsers = userList.filter((user) => !selected.includes(user.name));
  //   setSelected([]);
  //   setUserList(deleteUsers);
  // };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userList.length) : 0;

  const filteredUsers = applySortFilter(userList, getComparator(order, orderBy), filterName);

  // const isNotFound = !filteredUsers.length && Boolean(filterName);

  return (
    <Page title="User: List">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="User List"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'User', href: PATH_DASHBOARD.user.root },
            { name: 'List' },
          ]}
          action={
            <Button
              variant="contained"
              component={RouterLink}
              to={PATH_DASHBOARD.user.newUser}
              startIcon={<Iconify icon={'eva:plus-fill'} />}
            >
              New User
            </Button>
          }
        />

        <Card sx={{paddingTop: 1 }}>
          {/* <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            onDeleteUsers={() => handleDeleteMultiUser(selected)}
          /> */}

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  // order={order}
                  // orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  // rowCount={userList.length}
                  // numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  // onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { sensor_id, deviceID, live_sensors_set, sensor_type, value_type, unit } = row;
                    // id, name, role,  company,  status, avatarUrl, isVerified
                    const isItemSelected = selected.indexOf(sensor_id) !== -1;

                    return (
                      <TableRow
                        hover
                        key={sensor_id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isItemSelected}
                        aria-checked={isItemSelected}
                      >
                        {/* <TableCell padding="checkbox">
                          <Checkbox checked={isItemSelected} onClick={() => handleClick(name)} />
                        </TableCell> */}
                        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                          {/* <Avatar alt={name} src={avatarUrl} sx={{ mr: 2 }} /> */}
                          <Typography variant="subtitle2" noWrap>
                            {sensor_id}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">{deviceID}</TableCell>
                        <TableCell align="left">{sensor_type}</TableCell>
                        <TableCell align="left">{value_type}</TableCell>
                        <TableCell align="left">{unit}</TableCell>
                        {/* <TableCell align="left">{isVerified ? 'Yes' : 'No'}</TableCell> */}
                        {/* <TableCell align="left">
                          <Label
                            variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                            color={(status === 'banned' && 'error') || 'success'}
                          >
                            {sentenceCase(status)}
                          </Label>
                        </TableCell> */}

                        <TableCell align="right">
                          <UserMoreMenu onDelete={() => handleDeleteUser(sensor_id)} userName={sensor_id} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {/* {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )} */}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={userList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, page) => setPage(page)}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return array.filter((_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}
