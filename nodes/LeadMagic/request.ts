import type { IExecuteFunctions, IHttpRequestOptions } from "n8n-workflow";
import { NodeApiError } from "n8n-workflow";

const SAFE_TEXT = /^[\w .,:;()'"/%$&+\-[\]#@?!]{1,300}$/;

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function safe(value: unknown): string | undefined {
  return typeof value === "string" && SAFE_TEXT.test(value) ? value : undefined;
}

/**
 * Read LeadMagic's documented error envelope
 * ({ errors: [{ code, title, detail, action }], meta: { request_id } })
 * from wherever the HTTP client stored the response body.
 */
export function leadMagicErrorBody(error: unknown): {
  code?: string;
  detail?: string;
  action?: string;
  requestId?: string;
} {
  const err = record(error) ?? {};
  const response = record(err.response) ?? {};
  const cause = record(err.cause) ?? {};
  const causeResponse = record(cause.response) ?? {};
  const candidates = [
    response.body,
    response.data,
    causeResponse.body,
    causeResponse.data,
    err.error,
  ];
  for (const candidate of candidates) {
    let body: unknown = candidate;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        continue;
      }
    }
    const parsed = record(body);
    const first = Array.isArray(parsed?.errors)
      ? record(parsed?.errors[0])
      : undefined;
    if (!first) continue;
    return {
      code: safe(first.code),
      detail: safe(first.detail) ?? safe(first.title),
      action: safe(first.action),
      requestId: safe(record(parsed?.meta)?.request_id),
    };
  }
  return {};
}

const HINTS: Record<string, string> = {
  "400": "Check the node parameters for this item.",
  "401":
    "Check the LeadMagic API credential. Repeated invalid keys are temporarily locked out.",
  "402":
    "The LeadMagic account is out of credits or paused. Add credits in the LeadMagic dashboard, then rerun.",
  "403": "Check the LeadMagic API credential and its permissions.",
  "404": "No record was found for this input.",
  "410": "The search cursor expired. Rerun the search from the first page.",
  "429":
    "Rate limit reached; no credits were charged. Lower workflow concurrency or add a Wait node, then retry.",
};

export async function request(
  this: IExecuteFunctions,
  options: IHttpRequestOptions,
  itemIndex: number,
): Promise<unknown> {
  try {
    return await this.helpers.httpRequestWithAuthentication.call(
      this,
      "leadMagicApi",
      options,
    );
  } catch (error) {
    const candidate =
      typeof error === "object" && error !== null
        ? ((error as { statusCode?: unknown; httpCode?: unknown }).statusCode ??
          (error as { httpCode?: unknown }).httpCode ??
          record((error as { response?: unknown }).response)?.status)
        : undefined;
    const number =
      typeof candidate === "number" || typeof candidate === "string"
        ? Number(candidate)
        : NaN;
    const httpCode =
      Number.isInteger(number) && number >= 400 && number <= 599
        ? String(number)
        : undefined;
    const body = leadMagicErrorBody(error);
    const description = [
      body.detail,
      body.action ??
        (httpCode ? HINTS[httpCode] : undefined) ??
        "Check the request outcome in LeadMagic before retrying a paid operation.",
      body.requestId ? `Request ID: ${body.requestId}` : undefined,
    ]
      .filter(Boolean)
      .join(" ");
    // Never attach the original error: HTTP clients may retain headers, keys,
    // request bodies, and personal response data in their error objects.
    throw new NodeApiError(
      this.getNode(),
      {},
      {
        message: [
          "LeadMagic request failed",
          httpCode
            ? `(HTTP ${httpCode}` + (body.code ? `, ${body.code})` : ")")
            : "",
        ]
          .filter(Boolean)
          .join(" "),
        description,
        httpCode,
        itemIndex,
      },
    );
  }
}
