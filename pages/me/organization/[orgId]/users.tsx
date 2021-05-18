import {
  authenticatedPage,
  requireNumberParam,
} from "../../../../lib/pageHelpers";
import { makeStyles } from "@material-ui/core/styles";
import BreadcrumbsButtons from "../../../../components/common/BreadcrumbsButtons";
import Link from "../../../../components/common/Link";
import Typography from "@material-ui/core/Typography";
import {
  Avatar,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  Box,
  InputLabel,
  FormControl,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import React, { useState } from "react";

export const getServerSideProps = authenticatedPage(async (context) => {
  const orgId = requireNumberParam(context, "orgId");
  const users: Array<any> = [
    {
      id: "1",
      name: "A Test Admin Name",
      role: "Admin",
      email: "test@gmail.com",
    },
    {
      id: "2",
      name: "B Test Admin Name",
      role: "User",
      email: "test@gmail.com",
    },
    {
      id: "3",
      name: "C Test Admin Name",
      role: "Reviewer",
      email: "test@gmail.com",
    },
    {
      id: "4",
      name: "D Test Admin Name",
      role: "Admin",
      email: "test@gmail.com",
    },
    {
      id: "5",
      name: "E Test Admin Name",
      role: "User",
      email: "test@gmail.com",
    },
    {
      id: "6",
      name: "F Test Admin Name",
      role: "User",
      email: "test@gmail.com",
    },
    {
      id: "7",
      name: "G Test Admin Name",
      role: "Reviewer",
      email: "test@gmail.com",
    },
    {
      id: "8",
      name: "H Test Admin Name",
      role: "User",
      email: "test@gmail.com",
    },
    {
      id: "9",
      name: "I Test Admin Name",
      role: "Reviewer",
      email: "test@gmail.com",
    },
  ];

  return {
    props: {
      orgId,
      users,
    },
  };
});

const useStyles = makeStyles(() => ({
  editActions: {
    display: "flex",
    justifyContent: "flex-end",
  },
}));

type Props = {
  orgId: number;
  users: any[];
};

export default function OrganizationUsers({ orgId, users }: Props) {
  const classes = useStyles();
  const [newRoleValue, setNewRoleValue] = useState("");

  const handleRoleChange = () => {};

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/me/organization">Organization</Link>
        <Link href={`/me/organization/${orgId}`}>Organization Name</Link>
        <Typography>Organization Users</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper>
            <Box p={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6">Add user</Typography>
                </Grid>
                <Grid item xs={7}>
                  <TextField
                    fullWidth
                    label="Email address"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={7}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel>Expiration</InputLabel>
                    <Select
                      label="Expiration"
                      value={newRoleValue}
                      onChange={(
                        event: React.ChangeEvent<{ value: unknown }>
                      ) => {
                        return setNewRoleValue(event.target.value as string);
                      }}
                    >
                      <MenuItem value="Admin">Admin</MenuItem>
                      <MenuItem value="User">User</MenuItem>
                      <MenuItem value="Reviewer">Reviewer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={7}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Expiration day"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={7}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    size="medium"
                    onClick={() => {}}
                  >
                    Add user
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Organization users</Typography>
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: "75px" }} />
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Access granted</TableCell>
                  <TableCell>Access expires</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Expiration</TableCell>
                  <TableCell style={{ width: "100px" }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar>{user.name.charAt(0)}</Avatar>
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>2 weeks ago</TableCell>
                    <TableCell>No expiration set</TableCell>
                    <TableCell>
                      <Select
                        fullWidth
                        value={user.role}
                        onChange={handleRoleChange}
                        variant="outlined"
                      >
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="User">User</MenuItem>
                        <MenuItem value="Reviewer">Reviewer</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="date"
                        fullWidth
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button color="primary">Remove</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} className={classes.editActions}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            size="medium"
            onClick={() => {}}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}
