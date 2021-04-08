import * as React from "react";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import {DateTimePicker} from "mui-rff/src/DateTimePicker";
import {DateRange} from "@material-ui/icons";
import {TextField} from "@material-ui/core";

interface DateFilter {
    start?: Date | null,
    end?: Date | null
}

export default function MockRulesetConditionEditor() {
    const [fields, setFields] = React.useState<DateFilter[]>([]);
    return (
        <>
            <Box pb={2}>
                <Divider />
            </Box>
            <Box pb={2}>
                <Typography>Instructions</Typography>
            </Box>
            <Box display="flex" flexDirection="column" style={{width: "100%"}}>
                {
                    fields.map((field, i) => (
                        <Box key={Math.random()*i} display="flex" mb={2} alignItems="center" justifyContent="space-around">
                            <Typography>Date instruction</Typography>
                            <TextField label="Start" type="datetime-local" value={field.start}/>
                            <TextField label="End" type="datetime-local" value={field.end}/>
                        </Box>
                    ))
                }
            </Box>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setFields(prev=> [...prev, { start: null, end: null }])}
            >
                Add instruction
            </Button>
        </>
    )
}
