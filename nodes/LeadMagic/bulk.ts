import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
} from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import { request } from "./request";
import { MAX_PAGES, splitList } from "./search";

const BASE_URL = "https://api.leadmagic.io";
const RESULTS_PAGE_SIZE = 100;
const JOB_ID = /^[A-Za-z0-9_-]{1,100}$/;

export function bulkJobId(ctx: IExecuteFunctions, itemIndex: number): string {
  const jobId = String(ctx.getNodeParameter("jobId", itemIndex, "")).trim();
  if (!JOB_ID.test(jobId)) {
    throw new NodeOperationError(ctx.getNode(), "Enter a valid Job ID", {
      itemIndex,
    });
  }
  return encodeURIComponent(jobId);
}

function isPlainObject(value: unknown): value is IDataObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Submit every input item (or a file URL) as one bulk job. Bulk jobs are a
 * single request for the whole input, so the output is one item linked to
 * every input item.
 */
export async function submitBulkJob(
  this: IExecuteFunctions,
  itemCount: number,
): Promise<INodeExecutionData[]> {
  const product = this.getNodeParameter("product", 0) as string;
  const rowsFrom = this.getNodeParameter("rowsFrom", 0, "items") as string;
  const options = this.getNodeParameter("bulkOptions", 0, {}) as IDataObject;
  const body: IDataObject = { product };

  if (rowsFrom === "fileUrl") {
    const fileUrl = String(this.getNodeParameter("fileUrl", 0, "")).trim();
    if (!/^https:\/\//i.test(fileUrl)) {
      throw new NodeOperationError(
        this.getNode(),
        "File URL must start with https://",
        {
          itemIndex: 0,
        },
      );
    }
    body.fileUrl = fileUrl;
    if (options.format) body.format = options.format;
  } else {
    const fields = splitList(this.getNodeParameter("rowFields", 0, ""));
    const rows = this.getInputData().map(({ json }) => {
      if (!fields.length) return { ...json };
      return Object.fromEntries(
        fields
          .filter((field) => field in json)
          .map((field) => [field, json[field]]),
      );
    });
    if (
      rows.length === 0 ||
      rows.every((row) => Object.keys(row).length === 0)
    ) {
      throw new NodeOperationError(
        this.getNode(),
        "The input items have none of the fields to send",
        { itemIndex: 0 },
      );
    }
    body.rows = rows;
  }

  const callbackUrl = String(options.callbackUrl ?? "").trim();
  if (callbackUrl) {
    if (!/^https:\/\//i.test(callbackUrl)) {
      throw new NodeOperationError(
        this.getNode(),
        "Callback URL must start with https://",
        {
          itemIndex: 0,
        },
      );
    }
    body.callback = { url: callbackUrl, events: ["completed", "failed"] };
  }
  if (options.idempotencyKey)
    body.idempotencyKey = String(options.idempotencyKey);
  if (options.fileName) body.fileName = String(options.fileName);

  const response = await request.call(
    this,
    {
      method: "POST",
      url: `${BASE_URL}/bulk/submit`,
      body,
      json: true,
      timeout: 120000,
      disableFollowRedirect: true,
    },
    0,
  );
  const json: IDataObject = isPlainObject(response)
    ? response
    : { response: response as IDataObject };
  return [
    {
      json,
      pairedItem: Array.from({ length: itemCount }, (_, item) => ({ item })),
    },
  ];
}

/** Page through a bulk job's row results by offset. */
export async function bulkResults(
  this: IExecuteFunctions,
  itemIndex: number,
  jobId: string,
  status: string,
  returnAll: boolean,
  limit: number,
): Promise<unknown[]> {
  const cancelSignal = this.getExecutionCancelSignal();
  const rows: unknown[] = [];
  for (let page = 0, offset = 0; page < MAX_PAGES; page++) {
    if (cancelSignal?.aborted) break;
    const want = returnAll
      ? RESULTS_PAGE_SIZE
      : Math.min(RESULTS_PAGE_SIZE, limit - rows.length);
    if (want <= 0) break;
    const response = (await request.call(
      this,
      {
        method: "GET",
        url: `${BASE_URL}/bulk/jobs/${jobId}/results`,
        qs: { limit: want, offset, ...(status ? { status } : {}) },
        json: true,
        timeout: 60000,
        disableFollowRedirect: true,
      },
      itemIndex,
    )) as IDataObject | undefined;
    const batch = Array.isArray(response?.rows) ? response.rows : [];
    rows.push(...batch);
    if (batch.length < want) break;
    offset += batch.length;
  }
  return rows;
}
