import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { generateUniqueId } from "../../../lib/common";
import { ErrorAlert, SuccessAlert } from "../../../components/Alerts";

export const AlertsContext = React.createContext(undefined as any);

interface IAlert {
  id: string;
  body: React.ReactElement;
}

type Props = {
  children: React.ReactNode;
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: 350,
    position: "fixed",
    bottom: 20,
    right: 20,
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

export const AlertsProvider = ({ children }: Props) => {
  const classes = useStyles();
  const [alerts, setAlerts] = React.useState<Array<IAlert>>([]);

  const addAlert = (body: React.ReactElement): void => {
    setAlerts((prevState) => [{ id: generateUniqueId(), body }, ...prevState]);
  };

  const removeAlert = (id: string): void => {
    setAlerts((prevState) => prevState.filter((alert) => alert.id !== id));
  };

  const addErrorAlert = (err: { message: string }): void => {
    const { error } = JSON.parse(err.message);
    addAlert(<ErrorAlert message={error} />);
  };

  const addSuccessAlert = (message: string): void => {
    addAlert(<SuccessAlert message={message} />);
  };

  return (
    <AlertsContext.Provider
      value={{ addAlert, removeAlert, addErrorAlert, addSuccessAlert }}
    >
      {children}
      <div className={classes.root}>
        {alerts.map((alert) =>
          React.cloneElement(alert.body, {
            key: alert.id,
            onClose: () => removeAlert(alert.id),
          })
        )}
      </div>
    </AlertsContext.Provider>
  );
};
