import type { SearchEndpoint } from "../../schema";
import type { SearchEndpoint as PrismaSearchEndpoint } from "../../prisma";

export interface ExposedSearchEndpoint
  extends Pick<
    SearchEndpoint,
    | "id"
    | "orgId"
    | "name"
    | "description"
    | "resultId"
    | "displayFields"
    | "type"
    | "info"
  > {
  hasCredentials: boolean;
  testConnection?: boolean | null;
}

export function fromPrismaSearchEndpoint(
  val: PrismaSearchEndpoint
): ExposedSearchEndpoint {
  const ese: ExposedSearchEndpoint = {
    id: val.id,
    orgId: val.orgId,
    info: val.info as ExposedSearchEndpoint["info"],
    name: val.name,
    type: val.type,
    description: val.description,
    resultId: val.resultId,
    displayFields: val.displayFields,
    hasCredentials: !!val.credentials,
  };
  switch (ese.type) {
    case "ELASTICSEARCH":
    case "OPEN_SEARCH":
    case "SOLR":
      delete (ese.info as any).password;
      break;
    default:
      // How do we delete the password from this search type?
      throw new Error(`unsupported SearchEndpoint type ${ese.type}`);
  }
  return ese;
}
