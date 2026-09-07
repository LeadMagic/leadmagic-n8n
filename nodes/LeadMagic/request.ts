import type { IExecuteFunctions, IHttpRequestOptions } from "n8n-workflow";
import { NodeApiError } from "n8n-workflow";

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
          (error as { httpCode?: unknown }).httpCode)
        : undefined;
    const number =
      typeof candidate === "number" || typeof candidate === "string"
        ? Number(candidate)
        : NaN;
    const httpCode =
      Number.isInteger(number) && number >= 400 && number <= 599
        ? String(number)
        : undefined;
    const description =
      httpCode === "401" || httpCode === "403"
        ? "Check the LeadMagic API credential and its permissions."
        : httpCode === "429"
          ? "Reduce workflow concurrency and wait before retrying. A paid request may already have been charged."
          : "Check the service status and request outcome before retrying a paid operation.";
    // Never attach the original error: HTTP clients may retain headers, keys,
    // request bodies, and personal response data in their error objects.
    throw new NodeApiError(
      this.getNode(),
      {},
      {
        message: httpCode
          ? `LeadMagic request failed (HTTP ${httpCode})`
          : "LeadMagic request failed",
        description,
        httpCode,
        itemIndex,
      },
    );
  }
}
