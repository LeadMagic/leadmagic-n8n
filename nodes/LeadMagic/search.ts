import type {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestOptions,
} from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import { request } from "./request";

const BASE_URL = "https://api.leadmagic.io";

/** Safety stop for Return All so a mistaken filter can't loop forever. */
export const MAX_PAGES = 200;

type Paging = "cursor" | "fixedCursor" | "offset";

export interface SearchSpec {
  path: string;
  recordsKey: string;
  paging: Paging;
  maxPageSize: number;
  body: IDataObject;
}

export interface SearchResult {
  pages: IDataObject[];
  records: unknown[];
}

const LIST_KEYS = new Set([
  "titles",
  "roles",
  "contact_job_level",
  "contact_country_code",
  "country_codes",
  "industries",
  "tech_stack",
]);

export function splitList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Drop empty values; turn comma-separated list fields into arrays. */
export function clean(input: IDataObject): IDataObject {
  const output: IDataObject = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === "" || value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (LIST_KEYS.has(key)) {
      const list = splitList(value);
      if (list.length) output[key] = list;
      continue;
    }
    output[key] = value;
  }
  return output;
}

function isPlainObject(value: unknown): value is IDataObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Merge two request bodies; nested filter objects are merged one level deep. */
export function mergeBody(base: IDataObject, extra: IDataObject): IDataObject {
  const merged: IDataObject = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    const current = merged[key];
    merged[key] =
      isPlainObject(current) && isPlainObject(value)
        ? { ...current, ...value }
        : value;
  }
  return merged;
}

export function parseAdditionalJson(
  this: IExecuteFunctions,
  itemIndex: number,
): IDataObject {
  const raw = this.getNodeParameter("additionalJson", itemIndex, "{}");
  if (isPlainObject(raw)) return raw;
  if (typeof raw !== "string" || raw.trim() === "") return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new NodeOperationError(
      this.getNode(),
      "Additional Request Fields (JSON) is not valid JSON",
      { itemIndex },
    );
  }
  if (!isPlainObject(parsed)) {
    throw new NodeOperationError(
      this.getNode(),
      "Additional Request Fields (JSON) must be a JSON object",
      { itemIndex },
    );
  }
  return parsed;
}

function nextPage(
  response: IDataObject,
  paging: Paging,
): { cursor?: string; offset?: number } | undefined {
  if (paging === "offset") {
    const metadata = isPlainObject(response.metadata) ? response.metadata : {};
    const offset = metadata.next_offset;
    return metadata.has_more === true && typeof offset === "number"
      ? { offset }
      : undefined;
  }
  const pagination = isPlainObject(response.pagination)
    ? response.pagination
    : {};
  if (response.has_more === false || pagination.has_more === false)
    return undefined;
  const cursor = response.next_cursor ?? pagination.next_cursor;
  return typeof cursor === "string" && cursor !== "" ? { cursor } : undefined;
}

/**
 * Run a V3 search and follow its pagination until the limit is reached,
 * the API reports no more pages, or MAX_PAGES is hit.
 */
export async function runSearch(
  this: IExecuteFunctions,
  itemIndex: number,
  spec: SearchSpec,
  returnAll: boolean,
  limit: number,
): Promise<SearchResult> {
  if (!returnAll && (!Number.isInteger(limit) || limit < 1)) {
    throw new NodeOperationError(
      this.getNode(),
      "Limit must be a whole number of at least 1",
      { itemIndex },
    );
  }
  const cancelSignal = this.getExecutionCancelSignal();
  const pages: IDataObject[] = [];
  const records: unknown[] = [];
  let page: { cursor?: string; offset?: number } | undefined = {};

  for (let count = 0; page && count < MAX_PAGES; count++) {
    if (cancelSignal?.aborted) break;
    const remaining = returnAll ? spec.maxPageSize : limit - records.length;
    if (remaining <= 0) break;

    const body: IDataObject = { ...spec.body };
    if (spec.paging !== "fixedCursor") {
      body.limit = Math.min(spec.maxPageSize, remaining);
    }
    if (page.cursor) body.cursor = page.cursor;
    if (page.offset !== undefined) body.offset = page.offset;

    const options: IHttpRequestOptions = {
      method: "POST",
      url: `${BASE_URL}${spec.path}`,
      body,
      json: true,
      timeout: 60000,
      disableFollowRedirect: true,
    };
    const response = (await request.call(this, options, itemIndex)) as
      IDataObject | undefined;
    if (!isPlainObject(response)) break;
    pages.push(response);

    const batch = response[spec.recordsKey];
    if (Array.isArray(batch)) {
      const room = returnAll ? batch.length : limit - records.length;
      records.push(...batch.slice(0, room));
      if (batch.length === 0) break;
    }
    page = nextPage(response, spec.paging);
  }

  return { pages, records };
}
