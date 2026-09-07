import type { IDataObject } from "n8n-workflow";

const preferred = [
  "id",
  "companyId",
  "profile_id",
  "status",
  "email",
  "full_name",
  "first_name",
  "last_name",
  "companyName",
  "company_name",
  "company_domain",
  "domain",
  "websiteUrl",
  "company_website",
  "industry",
  "employeeCount",
  "job_title",
  "professional_title",
  "profile_url",
  "mobile_phone",
  "credits_consumed",
  "credits",
  "total_count",
  "ads_count",
  "employees",
  "jobs",
  "ads",
  "results",
  "data",
  "message",
];
const unsafe = new Set(["__proto__", "constructor", "prototype"]);

export function projectResponse(
  value: unknown,
  mode: string,
  selected: string[] = [],
  depth = 0,
): unknown {
  if (mode === "raw" || value === null || typeof value !== "object")
    return value;
  if (depth >= 5) return null;
  if (Array.isArray(value))
    return value.map((item) =>
      projectResponse(item, mode, selected, depth + 1),
    );
  const record = value as IDataObject;
  const available = Object.keys(record).filter((key) => !unsafe.has(key));
  const keys =
    mode === "selected"
      ? [
          ...new Set([
            ...available.filter((key) => /^(?:id|.*_id|.*Id)$/.test(key)),
            ...selected,
          ]),
        ].filter((key) => available.includes(key))
      : [...new Set([...preferred, ...available])]
          .filter((key) => available.includes(key))
          .slice(0, 10);
  // Selected fields deliberately keep their values intact. Simplified output
  // limits nested records too, without recursively walking unbounded payloads.
  return Object.fromEntries(
    keys.map((key) => [
      key,
      mode === "simplified"
        ? projectResponse(record[key], mode, [], depth + 1)
        : record[key],
    ]),
  );
}
