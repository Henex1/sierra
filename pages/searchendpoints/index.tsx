import * as React from "react";
import { useRouter } from "next/router";

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";

import { authenticatedPage } from "../../lib/pageHelpers";
import {
  listSearchEndpoints,
  ExposedSearchEndpoint,
} from "../../lib/searchendpoints";

import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";
import { searchEndpointTypes } from "../../components/searchendpoints/Form";

export const getServerSideProps = authenticatedPage(async (context) => {
  const searchEndpoints = await listSearchEndpoints(context);
  return { props: { searchEndpoints } };
});

type Props = {
  searchEndpoints: ExposedSearchEndpoint[];
};

const useStyles = makeStyles((theme) => ({
  wrapper: {
    height: "90%",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    minHeight: "100%",
  },
  cardMedia: {
    flex: "none",
    height: 30,
    backgroundPositionX: theme.spacing(2),
    backgroundSize: "contain",
  },
  cardContent: {
    flex: 1,
    height: "100%",
    paddingBottom: 0,
  },
  cardActions: {
    flex: "none",
    paddingTop: 0,
  },
  editButton: {
    marginLeft: "auto",
  },
}));

export default function SearchEndpoints({ searchEndpoints }: Props) {
  const classes = useStyles();
  const router = useRouter();

  const handleAddNewSearchEndpoint = () => {
    router.push("/searchendpoints/create");
  };

  return (
    <div className={classes.wrapper}>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Typography>Search Endpoints</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Search Endpoints</Typography>
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="outlined"
            startIcon={<AddIcon />}
            size="medium"
            onClick={handleAddNewSearchEndpoint}
          >
            Add New Search Endpoint
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="stretch">
            {searchEndpoints.map((item) => {
              const found = searchEndpointTypes.find(
                (o) => o.value === item.type
              );
              return (
                <Grid key={item.id} item xs={3}>
                  <Card className={classes.card}>
                    <CardHeader title={item.name} />
                    <CardMedia
                      className={classes.cardMedia}
                      image={found?.imageSrc}
                      title={found?.label}
                    />
                    <CardContent className={classes.cardContent}>
                      <Typography>{item.description}</Typography>
                    </CardContent>
                    <CardActions className={classes.cardActions}>
                      <Link
                        href={`/searchendpoints/${item.id}`}
                        className={classes.editButton}
                      >
                        <IconButton aria-label="Edit">
                          <EditIcon />
                        </IconButton>
                      </Link>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
