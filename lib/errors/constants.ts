export enum ErrorMessage {
  NotFound = "Not found",
  ConnectionToSearchEndpointFailed = "Sierra couldn't connect to your search endpoint.",
  SearchConfigurationNotFound = "Search configuration was not found",
  QueryTemplateNotFound = "Query template was not found",
  RulesetsNotFound = "No rulesets were found",
  RulesetNotFound = "Ruleset was not found",
  ProjectNotFound = "Project was not found",
  SearchEndpointNotFound = "Search endpoint was not found",
  JudgementNotFound = "Judgement was not found",
  SearchPhraseExecutionNotFound = "Search phrase execution was not found",
  ExecutionNotFound = "Execution was not found",
  OrganisationNotFound = "Organisation was not found",
  FailedToCreateExecution = "Failed to create an execution",
  FailedToExpandQuery = "Failed to expand query",
  UnsupportedSearchEndpointType = "You attempted to execute an unsupported search enpoint type",
}