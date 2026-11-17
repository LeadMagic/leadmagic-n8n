import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

export class LeadMagicApi implements ICredentialType {
  name = "leadMagicApi";

  displayName = "LeadMagic API";

  icon: ICredentialType["icon"] = {
    light: "file:leadmagic.svg",
    dark: "file:leadmagic.dark.svg",
  };

  documentationUrl =
    "https://github.com/LeadMagic/leadmagic-n8n#authentication";

  httpRequestNode = {
    name: "LeadMagic",
    docsUrl: "https://leadmagic.io/docs/api-reference",
    apiBaseUrl: "https://api.leadmagic.io/",
  };

  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      description:
        "Your LeadMagic API key (starts with lm_). Create one in the LeadMagic app under Settings > API.",
      required: true,
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        "X-API-Key": "={{$credentials.apiKey}}",
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: "https://api.leadmagic.io",
      url: "/v1/credits",
      method: "GET",
      timeout: 30000,
      disableFollowRedirect: true,
    },
  };
}
