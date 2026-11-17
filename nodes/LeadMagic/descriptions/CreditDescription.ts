import type { INodeProperties } from "n8n-workflow";

export const creditOperations: INodeProperties[] = [
  {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ["credit"],
      },
    },
    options: [
      {
        name: "Get Balance",
        value: "getCredits",
        description: "Get the remaining credit balance (free)",
        action: "Get credit balance",
      },
    ],
    default: "getCredits",
  },
];
