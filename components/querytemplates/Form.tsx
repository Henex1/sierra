import { FormApi, SubmissionErrors } from "final-form";
import { Form, FormProps as BaseFormProps } from "react-final-form";
import { TextField, Select } from "mui-rff";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";

import {ExposedQueryTemplate} from "../../lib/querytemplates";
import {parseNonnegativeInt} from "../common/form";

export type FormProps = BaseFormProps<ExposedQueryTemplate> & {
    onDelete?: () => void;
};

export default function QueryTemplateForm({ onDelete, ...rest }: FormProps) {
    const isNew = rest.initialValues?.id === undefined;
    return (
        <Form
            {...rest}
            render={({ handleSubmit, form, submitting, values }) => (
                <form onSubmit={handleSubmit}>
                    <Box pb={2}>
                        <TextField
                            label="Description"
                            name="description"
                            required={true}
                            variant="filled"
                        />
                    </Box>
                    <Box pb={2}>
                        <TextField
                            label="Project Id"
                            name="projectId"
                            required={true}
                            variant="filled"
                            fieldProps={{
                                parse: parseNonnegativeInt,
                            }}
                        />
                    </Box>
                    <Box pb={2}>
                        <TextField
                            label="Knobs"
                            name="knobs"
                            required={true}
                            variant="filled"
                        />
                    </Box>
                    <Box pb={2}>
                        <TextField
                            label="Tag"
                            name="tag"
                            required={true}
                            variant="filled"
                        />
                    </Box>
                    <Box pb={2}>
                        <TextField
                            label="Query"
                            name="query"
                            required={true}
                            variant="filled"
                        />
                    </Box>
                    <Box pb={2}>
                        <Button
                            type="submit"
                            disabled={submitting}
                            variant="contained"
                            color="primary"
                        >
                            {isNew ? "Create" : "Update"}
                        </Button>
                        {!isNew && (
                            <>
                                {" "}
                                <Button variant="contained" onClick={onDelete}>
                                    Delete
                                </Button>
                            </>
                        )}
                    </Box>
                </form>
            )}
        />
    );
}
