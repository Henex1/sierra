import Container from "@material-ui/core/Container";
import { useRouter } from "next/router";

import { ExposedQueryTemplate } from "../../lib/querytemplates";
import { authenticatedPage } from "../../lib/auth";
import Form from "../../components/querytemplates/Form";

export const getServerSideProps = authenticatedPage();

export default function CreateRuleset() {
    const router = useRouter();
    async function onSubmit(values: ExposedQueryTemplate) {
        const response = await fetch(`/api/querytemplates/create`, {
            method: "POST",
            body: JSON.stringify(values),
            headers: {
                "Content-Type": "application/json",
            },
        });
        const body = await response.json();
        if (!response.ok) {
            // XXX - do something about this
            throw new Error(JSON.stringify(body));
        }
        router.push("/querytemplates");
        // Keep the form stuck as pending
        return new Promise(() => {});
    }

    return (
        <Container maxWidth="sm">
            <Form onSubmit={onSubmit} />
        </Container>
    );
}
