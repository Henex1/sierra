import React, { ChangeEvent, useState } from "react";
import useSWR from "swr";
import { makeStyles } from "@material-ui/core/styles";
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
import { authenticatedPage, requireParam } from "../../../../lib/pageHelpers";
import { apiRequest } from "../../../../lib/api";
import { getOrgUserRole } from "../../../../lib/org";
import BreadcrumbsButtons from "../../../../components/common/BreadcrumbsButtons";
import { OrgUser, User, UserOrgRole } from ".prisma/client";
import { useAlertsContext } from "../../../../utils/react/hooks/useAlertsContext";

export const getServerSideProps = authenticatedPage(async (context) => {
  const orgId = requireParam(context, "orgId");
  const orgUserRole = (await getOrgUserRole(context.user, orgId)) ?? "";

  return {
    props: {
      orgId,
      orgUserRole,
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
  orgId: string;
  orgUserRole: UserOrgRole;
};

export default function OrganizationUsers({ orgId, orgUserRole }: Props) {
  const classes = useStyles();

  const { addErrorAlert, addSuccessAlert } = useAlertsContext();

  const { data: orgUsers, mutate } = useSWR<
    (OrgUser & {
      user: User;
    })[]
  >(`/api/organization/getusers/${orgId}`);

  const [newUserData, setNewUserData] = useState({ email: "", role: "" });

  const isAdmin = orgUserRole === "ADMIN";

  const handleChange = (key: string) => (
    e: ChangeEvent<{ value: unknown }>
  ) => {
    setNewUserData((newUserData) => ({
      ...newUserData,
      [key]: e.target.value,
    }));
  };

  const handleAddUser = async () => {
    if (!newUserData.email.trim() || !newUserData.role.trim()) {
      return;
    }

    try {
      const response = await apiRequest(
        `/api/organization/adduser/${orgId}`,
        newUserData
      );
      await mutate();
      response.message && addSuccessAlert(response.message);
    } catch (err: any) {
      addErrorAlert(err);
    }
  };

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/me/organization">Organization</Link>
        <Link href={`/me/organization/${orgId}`}>Organization Name</Link>
        <Typography>Organization Users</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        {isAdmin && (
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
                      value={newUserData.email}
                      onChange={handleChange("email")}
                    />
                  </Grid>
                  <Grid item xs={7}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        label="Role"
                        value={newUserData.role}
                        onChange={handleChange("role")}
                      >
                        <MenuItem value={UserOrgRole.ADMIN}>Admin</MenuItem>
                        <MenuItem value={UserOrgRole.USER}>User</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={7}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      size="medium"
                      onClick={handleAddUser}
                    >
                      Add user
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        )}
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
                  <TableCell>Role</TableCell>
                  <TableCell style={{ width: "100px" }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {orgUsers?.map((orgUser) => (
                  <TableRow key={orgUser.id}>
                    <TableCell>
                      <Avatar>{orgUser.user.name?.charAt(0)}</Avatar>
                    </TableCell>
                    <TableCell>{orgUser.user.name}</TableCell>
                    <TableCell>{orgUser.user.email}</TableCell>
                    <TableCell>{formatDate(orgUser.createdAt)}</TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Select
                          fullWidth
                          value={orgUser.role}
                          variant="outlined"
                        >
                          <MenuItem value={UserOrgRole.ADMIN}>Admin</MenuItem>
                          <MenuItem value={UserOrgRole.USER}>User</MenuItem>
                        </Select>
                      ) : (
                        orgUser.role
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button color="primary">Remove</Button>
                      </TableCell>
                    )}
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

const formatDate = (strDate: Date): string => {
  const todayMs = new Date().getTime();
  const dateMs = new Date(strDate).getTime();

  const secondsDif = todayMs / 1000 - dateMs / 1000;

  const getOutput = (str: string, seconds: number): string => {
    return `${Math.floor(secondsDif / seconds)} ${
      str + (secondsDif > 2 * seconds ? "s" : "")
    } ago`;
  };

  // less than a minute
  if (secondsDif < 60) {
    return "Now";
  }

  // less than an hour
  if (secondsDif < 3600) {
    return getOutput("minute", 60);
  }

  // less than a day
  if (secondsDif < 86400) {
    return getOutput("hour", 3600);
  }

  // less than a week
  if (secondsDif < 604800) {
    return getOutput("day", 86400);
  }

  // less than a month
  if (secondsDif < 2592000) {
    return getOutput("week", 604800);
  }

  // less than an year
  if (secondsDif < 31536000) {
    return getOutput("month", 2592000);
  }

  return getOutput("year", 31536000);
};
