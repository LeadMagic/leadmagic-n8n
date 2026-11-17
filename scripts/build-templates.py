#!/usr/bin/env python3
"""Generate the example workflows in templates/.

Every template is built here so node versions, sticky-note conventions, and
LeadMagic parameters stay consistent. Run `python3 scripts/build-templates.py`
after changing it; `pnpm test` validates the output against the built node.

Core node versions match n8n 2.47 (the latest stable when written).
"""

import json
import uuid
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "templates"
LM = "n8n-nodes-leadmagic.leadMagic"
LM_TOOL = "n8n-nodes-leadmagic.leadMagicTool"
TESTED = "n8n 2.47 and n8n-nodes-leadmagic 1.8.0"
INSTALL = "https://github.com/LeadMagic/leadmagic-n8n#install"


class Workflow:
    def __init__(self, slug, name):
        self.slug = slug
        self.name = name
        self.nodes = []
        self.connections = {}

    def _id(self, label):
        return str(uuid.uuid5(uuid.NAMESPACE_URL, f"leadmagic-n8n/{self.slug}/{label}"))

    def node(self, name, type_, version, position, parameters=None, **extra):
        node = {
            "parameters": parameters or {},
            "id": self._id(name),
            "name": name,
            "type": type_,
            "typeVersion": version,
            "position": list(position),
        }
        node.update(extra)
        self.nodes.append(node)
        return name

    def lm(self, name, position, parameters, **extra):
        return self.node(name, LM, 1, position, parameters, **extra)

    def sticky(self, label, content, position, width, height, color=None):
        params = {"content": content, "height": height, "width": width}
        if color is not None:
            params["color"] = color
        self.node(label, "n8n-nodes-base.stickyNote", 1, position, params)

    def connect(self, source, target, output=0, kind="main", target_index=0):
        outputs = self.connections.setdefault(source, {}).setdefault(kind, [])
        while len(outputs) <= output:
            outputs.append([])
        outputs[output].append({"node": target, "type": kind, "index": target_index})

    def chain(self, *names):
        for a, b in zip(names, names[1:]):
            self.connect(a, b)

    def write(self, description):
        data = {
            "name": self.name,
            "nodes": self.nodes,
            "connections": self.connections,
            "pinData": {},
            "settings": {"executionOrder": "v1"},
            "meta": {"templateCredsSetupCompleted": False},
            "tags": [],
        }
        path = OUT / f"{self.slug}.json"
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        return {"file": path.name, "name": self.name, "description": description}


def overview(what, how, setup, customize):
    return (
        f"## {what}\n\n### How it works\n{how}\n\n### Setup\n{setup}\n\n"
        f"### Customization\n{customize}\n\n"
        f"Requires the [LeadMagic community node]({INSTALL}) (`n8n-nodes-leadmagic`). Tested with {TESTED}."
    )


def sheet(mode="url"):
    return {"__rl": True, "value": "", "mode": mode}


def cond(left, operation, right="", type_="string", single=None, cid="c1"):
    operator = {"type": type_, "operation": operation}
    if single:
        operator["singleValue"] = True
    return {"id": cid, "leftValue": left, "rightValue": right, "operator": operator}


def conditions(*items, combinator="and"):
    return {
        "conditions": {
            "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "strict", "version": 4},
            "conditions": list(items),
            "combinator": combinator,
        },
        "options": {},
    }


def assign(*fields):
    return {
        "assignments": {
            "assignments": [
                {"id": f"a{i}", "name": name, "value": value, "type": type_}
                for i, (name, value, type_) in enumerate(fields)
            ]
        },
        "options": {},
    }


catalog = []

# ---------------------------------------------------------------------------
# 1. Bulk work-email finder for Google Sheets (replaces the HTTP Request build
#    shared on the n8n community forum).
# ---------------------------------------------------------------------------
w = Workflow("bulk-email-finder-google-sheets", "Find work emails for a Google Sheet in bulk with LeadMagic")
w.sticky("Overview", overview(
    "Bulk work-email finder for Google Sheets",
    "1. Reads every row of your sheet.\n2. Skips rows that already have an email or lack a name and company.\n"
    "3. Finds each work email with LeadMagic in small, paced batches.\n"
    "4. Writes the email, status, and email provider back to the same row. Errors are written too, so nothing silently disappears.\n\n"
    "Rerun it any time: finished rows are skipped, so it resumes where it stopped.",
    "1. Sheet columns: `First Name`, `Last Name`, `Company Domain`, `Company Name`, `Email`, `Email Status`, `Email Provider`, `Checked At`.\n"
    "2. Paste the sheet URL into **Read rows** and **Write result to row**.\n3. Select your Google Sheets and LeadMagic credentials.",
    "Batch size 5 plus a 1-second wait stays under the 300 requests per minute Email Finder limit on every plan. "
    "Raise the batch size on Growth (600/min) or higher plans.",
), (-560, -320), 460, 620)
w.node("Run manually", "n8n-nodes-base.manualTrigger", 1, (0, 0))
w.node("Read rows", "n8n-nodes-base.googleSheets", 4.7, (220, 0), {
    "documentId": sheet(), "sheetName": {"__rl": True, "value": "gid=0", "mode": "list", "cachedResultName": "Sheet1"}, "options": {}})
w.node("Rows that need an email", "n8n-nodes-base.filter", 2.4, (440, 0), conditions(
    cond("={{ $json.Email }}", "empty", single=True, cid="c1"),
    cond("={{ $json['First Name'] }}", "notEmpty", single=True, cid="c2"),
    cond("={{ $json['Last Name'] }}", "notEmpty", single=True, cid="c3"),
    cond("={{ $json['Company Domain'] || $json['Company Name'] }}", "notEmpty", single=True, cid="c4"),
))
w.node("Loop in batches of 5", "n8n-nodes-base.splitInBatches", 3, (660, 0), {"batchSize": 5, "options": {}})
w.lm("Find work email", (900, 100), {
    "resource": "email", "operation": "findEmail",
    "first_name": "={{ $json['First Name'] }}", "last_name": "={{ $json['Last Name'] }}",
    "domain": "={{ $json['Company Domain'] }}", "company_name": "={{ $json['Company Name'] }}",
}, onError="continueErrorOutput")
w.node("Found or not found", "n8n-nodes-base.set", 3.5, (1140, 0), assign(
    ("row_number", "={{ $('Loop in batches of 5').item.json.row_number }}", "number"),
    ("Email", "={{ $json.email ?? '' }}", "string"),
    ("Email Status", "={{ $json.status === 'valid' ? 'valid' : 'not_found' }}", "string"),
    ("Email Provider", "={{ $json.mx_provider ?? '' }}", "string"),
    ("Checked At", "={{ $now.toISO() }}", "string"),
))
w.node("Request error", "n8n-nodes-base.set", 3.5, (1140, 200), assign(
    ("row_number", "={{ $('Loop in batches of 5').item.json.row_number }}", "number"),
    ("Email Status", "={{ 'error: ' + ($json.error ?? 'unknown') }}", "string"),
    ("Checked At", "={{ $now.toISO() }}", "string"),
))
w.node("Write result to row", "n8n-nodes-base.googleSheets", 4.7, (1380, 100), {
    "operation": "update", "documentId": sheet(),
    "sheetName": {"__rl": True, "value": "gid=0", "mode": "list", "cachedResultName": "Sheet1"},
    "columns": {"mappingMode": "autoMapInputData", "value": {}, "matchingColumns": ["row_number"], "schema": []},
    "options": {}})
w.node("Pace requests", "n8n-nodes-base.wait", 1.1, (1600, 100), {"amount": 1})
w.chain("Run manually", "Read rows", "Rows that need an email", "Loop in batches of 5")
w.connect("Loop in batches of 5", "Find work email", output=1)
w.connect("Find work email", "Found or not found", output=0)
w.connect("Find work email", "Request error", output=1)
w.connect("Found or not found", "Write result to row")
w.connect("Request error", "Write result to row")
w.chain("Write result to row", "Pace requests", "Loop in batches of 5")
w.sticky("Find section", "## Find and record\nEmail Finder only charges for a valid email. Not-found rows are free and are marked `not_found`; request errors go to the second output instead of stopping the run.", (860, -160), 700, 520, 7)
catalog.append(w.write("Bulk-fill missing work emails in a Google Sheet with paced batches, resumable reruns, and per-row status."))

# ---------------------------------------------------------------------------
# 2. ICP account list -> decision makers -> verified emails
# ---------------------------------------------------------------------------
w = Workflow("icp-accounts-to-verified-contacts", "Build an ICP account list and find decision makers' emails with LeadMagic")
w.sticky("Overview", overview(
    "ICP accounts to verified contacts",
    "1. **ICP settings** holds your ideal customer profile.\n2. Company Search discovers matching accounts.\n"
    "3. People Search finds senior people in the chosen department at each account.\n"
    "4. Email Finder looks up each person by profile URL; only valid emails are kept.\n5. Results are appended to a Google Sheet.",
    "1. Edit **ICP settings**.\n2. Paste a sheet URL into **Save contacts** (columns are created from the data).\n3. Select your LeadMagic and Google Sheets credentials.",
    "Change departments and seniority in **Find decision makers**. Search is free within fair use on Professional and Ultimate plans; "
    "other plans pay per record, so keep the limits small while testing.",
), (-560, -340), 460, 640)
w.node("Run manually", "n8n-nodes-base.manualTrigger", 1, (0, 0))
w.node("ICP settings", "n8n-nodes-base.set", 3.5, (220, 0), assign(
    ("industries", "Software Development", "string"),
    ("hq_country_codes", "US", "string"),
    ("min_employees", 50, "number"),
    ("max_employees", 500, "number"),
    ("accounts", 10, "number"),
    ("people_per_account", 3, "number"),
))
w.lm("Search companies", (440, 0), {
    "resource": "company", "operation": "searchCompanies",
    "companyFilters": {
        "industries": "={{ $json.industries }}", "country_codes": "={{ $json.hq_country_codes }}",
        "min_employees": "={{ $json.min_employees }}", "max_employees": "={{ $json.max_employees }}",
    },
    "limit": "={{ $json.accounts }}",
})
w.lm("Find decision makers", (660, 0), {
    "resource": "people", "operation": "searchPeople",
    "company_domain": "={{ $json.company_domain }}",
    "peopleFilters": {"contact_job_function": ["Sales", "Marketing"], "min_seniority": 3, "include_company": False},
    "limit": "={{ $('ICP settings').first().json.people_per_account }}",
})
w.node("One row per person", "n8n-nodes-base.removeDuplicates", 2, (880, 0), {
    "compare": "selectedFields", "fieldsToCompare": "contact_linkedin_url", "options": {}})
w.lm("Find work email", (1100, 0), {
    "resource": "email", "operation": "findEmail", "findBy": "profile",
    "profile_url": "={{ $json.contact_linkedin_url }}", "outputMode": "selected",
    "outputFields": ["email", "status"],
}, onError="continueRegularOutput")
w.node("Keep valid emails", "n8n-nodes-base.filter", 2.4, (1320, 0), conditions(
    cond("={{ $json.status }}", "equals", "valid")))
w.node("Contact row", "n8n-nodes-base.set", 3.5, (1540, 0), assign(
    ("Name", "={{ $('One row per person').item.json.contact_full_name }}", "string"),
    ("Title", "={{ $('One row per person').item.json.contact_job_title }}", "string"),
    ("Company", "={{ $('One row per person').item.json.contact_company_name }}", "string"),
    ("Domain", "={{ $('One row per person').item.json.company_domain }}", "string"),
    ("Profile URL", "={{ $('One row per person').item.json.contact_linkedin_url }}", "string"),
    ("Email", "={{ $json.email }}", "string"),
))
w.node("Save contacts", "n8n-nodes-base.googleSheets", 4.7, (1760, 0), {
    "operation": "append", "documentId": sheet(),
    "sheetName": {"__rl": True, "value": "gid=0", "mode": "list", "cachedResultName": "Sheet1"},
    "columns": {"mappingMode": "autoMapInputData", "value": {}, "matchingColumns": [], "schema": []}, "options": {}})
w.chain("Run manually", "ICP settings", "Search companies", "Find decision makers", "One row per person",
        "Find work email", "Keep valid emails", "Contact row", "Save contacts")
w.sticky("Discover section", "## Discover\nSearch returns profiles, never emails. Each company item fans out into people items automatically.", (400, -180), 680, 360, 7)
w.sticky("Verify section", "## Verify and save\nEmail Finder charges only for valid emails. Expressions read the person from **One row per person**, so item links stay correct.", (1060, -180), 900, 360, 7)
catalog.append(w.write("Discover ICP accounts with Company Search, find senior people with People Search, and save only verified work emails."))

# ---------------------------------------------------------------------------
# 3. Lookalike account expansion
# ---------------------------------------------------------------------------
w = Workflow("lookalike-account-expansion", "Expand your best customers into lookalike accounts with LeadMagic")
w.sticky("Overview", overview(
    "Lookalike account expansion",
    "1. List your best customers' domains in **Seed customers**.\n2. Find Lookalikes returns similar companies for each seed, with a similarity score.\n"
    "3. Duplicates across seeds and weak matches are removed.\n4. New accounts are appended to a Google Sheet for review.",
    "1. Edit **Seed customers** (one domain per line).\n2. Paste a sheet URL into **Save accounts**.\n3. Select your LeadMagic and Google Sheets credentials.",
    "Tighten **Strong matches only** to raise the similarity bar, or add HQ country and headcount in Company Filters. "
    "Each lookalike call costs 5 credits when it returns results and nothing when it returns none.",
), (-560, -320), 460, 620)
w.node("Run manually", "n8n-nodes-base.manualTrigger", 1, (0, 0))
w.node("Seed customers", "n8n-nodes-base.set", 3.5, (220, 0), {
    "mode": "raw",
    "jsonOutput": "{\n  \"seeds\": [\"example.com\", \"example.org\"],\n  \"min_similarity\": 0.6\n}\n",
    "options": {}})
w.node("One item per seed", "n8n-nodes-base.splitOut", 1, (440, 0), {"fieldToSplitOut": "seeds", "options": {}})
w.lm("Find lookalikes", (660, 0), {
    "resource": "company", "operation": "findLookalikes", "company_domain": "={{ $json.seeds }}",
    "companyFilters": {"country_codes": "US"}, "limit": 25,
})
w.node("Strong matches only", "n8n-nodes-base.filter", 2.4, (880, 0), conditions(
    cond("={{ Number($json.similarity) }}", "gte", "={{ $('Seed customers').first().json.min_similarity }}", type_="number")))
w.node("Remove duplicate accounts", "n8n-nodes-base.removeDuplicates", 2, (1100, 0), {
    "compare": "selectedFields", "fieldsToCompare": "company_domain", "options": {}})
w.node("Account row", "n8n-nodes-base.set", 3.5, (1320, 0), assign(
    ("Company", "={{ $json.company_name }}", "string"),
    ("Domain", "={{ $json.company_domain }}", "string"),
    ("Similarity", "={{ $json.similarity }}", "string"),
    ("Seed", "={{ $json.source_seed_domain }}", "string"),
    ("Employees", "={{ $json.employee_range }}", "string"),
    ("HQ Country", "={{ $json.hq_country }}", "string"),
))
w.node("Save accounts", "n8n-nodes-base.googleSheets", 4.7, (1540, 0), {
    "operation": "appendOrUpdate", "documentId": sheet(),
    "sheetName": {"__rl": True, "value": "gid=0", "mode": "list", "cachedResultName": "Sheet1"},
    "columns": {"mappingMode": "autoMapInputData", "value": {}, "matchingColumns": ["Domain"], "schema": []}, "options": {}})
w.chain("Run manually", "Seed customers", "One item per seed", "Find lookalikes", "Strong matches only",
        "Remove duplicate accounts", "Account row", "Save accounts")
catalog.append(w.write("Turn a list of best-customer domains into scored lookalike accounts, deduplicated and saved to Google Sheets."))

# ---------------------------------------------------------------------------
# 4. Hiring signals -> buyer -> email -> Slack
# ---------------------------------------------------------------------------
w = Workflow("hiring-signals-to-slack", "Alert sales in Slack when target companies post relevant jobs with LeadMagic")
w.sticky("Overview", overview(
    "Hiring signals to Slack",
    "1. Every weekday morning, Job Search finds new postings that signal a need for your product.\n"
    "2. Companies already alerted in earlier runs are skipped.\n3. Find Role identifies the likely buyer at each company, and Email Finder gets their work email.\n"
    "4. A Slack message gives the rep the signal, the buyer, and the email.",
    "1. Set titles and countries in **Search new jobs**.\n2. Set the buyer title in **Find the buyer**.\n3. Pick a Slack channel in **Alert sales**.\n4. Select your LeadMagic and Slack credentials.",
    "Job Search charges per job returned, so keep the limit near your daily volume. Swap Slack for HubSpot or a sheet to log signals instead.",
), (-560, -340), 460, 640)
w.node("Weekdays at 8am", "n8n-nodes-base.scheduleTrigger", 1.4, (0, 0), {
    "rule": {"interval": [{"field": "cronExpression", "expression": "0 8 * * 1-5"}]}})
w.lm("Search new jobs", (220, 0), {
    "resource": "job", "operation": "searchJobs", "titlesInclude": "Revenue Operations, Sales Operations",
    "jobFilters": {"countries": "US", "postedWithin": 1}, "limit": 25,
})
w.node("Company domain", "n8n-nodes-base.set", 3.5, (440, 0), assign(
    ("job_title", "={{ $json.title }}", "string"),
    ("company_name", "={{ $json.company?.name }}", "string"),
    ("company_domain", "={{ ($json.company?.website_url ?? '').replace(/^https?:\\/\\/(www\\.)?/, '').split('/')[0] }}", "string"),
))
w.node("New companies only", "n8n-nodes-base.removeDuplicates", 2, (660, 0), {
    "operation": "removeItemsSeenInPreviousExecutions", "dedupeValue": "={{ $json.company_domain }}", "options": {}})
w.lm("Find the buyer", (880, 0), {
    "resource": "people", "operation": "findRole", "job_title": "VP of Sales",
    "searchMethod": "domain", "company_domain": "={{ $json.company_domain }}",
}, onError="continueRegularOutput")
w.node("Buyer found", "n8n-nodes-base.if", 2.4, (1100, 0), conditions(
    cond("={{ $json.profile_url }}", "notEmpty", single=True)))
w.lm("Find buyer email", (1320, -100), {
    "resource": "email", "operation": "findEmail", "findBy": "profile", "profile_url": "={{ $json.profile_url }}",
}, onError="continueRegularOutput")
w.node("Alert sales", "n8n-nodes-base.slack", 2.7, (1540, -100), {
    "select": "channel", "channelId": {"__rl": True, "value": "", "mode": "list"},
    "text": "=:mag: *{{ $('Company domain').item.json.company_name }}* is hiring a *{{ $('Company domain').item.json.job_title }}*.\n"
            "Buyer: {{ $('Find the buyer').item.json.name }} ({{ $('Find the buyer').item.json.profile_url }})\n"
            "Email: {{ $json.email || 'not found' }}",
    "otherOptions": {}})
w.chain("Weekdays at 8am", "Search new jobs", "Company domain", "New companies only", "Find the buyer", "Buyer found")
w.connect("Buyer found", "Find buyer email", output=0)
w.chain("Find buyer email", "Alert sales")
w.sticky("Dedupe note", "## Only new companies\n**New companies only** remembers domains across runs, so each company alerts once.", (620, -180), 220, 360, 7)
catalog.append(w.write("Daily hiring signals from Job Search, deduplicated across runs, with the buyer and their email posted to Slack."))

# ---------------------------------------------------------------------------
# 5. Local leads with validated emails
# ---------------------------------------------------------------------------
w = Workflow("local-business-leads-to-sheet", "Build a local business lead list with validated emails using LeadMagic")
w.sticky("Overview", overview(
    "Local business leads with validated emails",
    "1. **Search settings** holds the place and business category.\n2. Local Leads search returns businesses with phones, emails, and websites.\n"
    "3. Each email is validated; invalid ones are dropped and unknown ones are kept for review.\n4. Leads are saved to a Google Sheet, keyed by listing ID so reruns update rows.",
    "1. Edit **Search settings**. Use **Get Categories** in the LeadMagic node to look up exact category names.\n2. Paste a sheet URL into **Save leads**.\n3. Select your LeadMagic and Google Sheets credentials.",
    "Switch to a map search by adding Latitude, Longitude, and Radius in the Local Leads filters. "
    "Local Leads pages are free on Professional and Ultimate; validation charges only for valid or invalid results.",
), (-560, -340), 460, 640)
w.node("Run manually", "n8n-nodes-base.manualTrigger", 1, (0, 0))
w.node("Search settings", "n8n-nodes-base.set", 3.5, (220, 0), assign(
    ("country", "US", "string"), ("region_code", "TX", "string"), ("city", "Austin", "string"),
    ("category", "plumb", "string"), ("max_leads", 100, "number"),
))
w.lm("Search local leads", (440, 0), {
    "resource": "localLead", "operation": "searchLocalLeads", "country": "={{ $json.country }}",
    "category_contains": "={{ $json.category }}",
    "localFilters": {"region_code": "={{ $json.region_code }}", "city": "={{ $json.city }}", "has_email": True, "exclude_closed": True},
    "limit": "={{ $json.max_leads }}",
})
w.lm("Validate email", (660, 0), {
    "resource": "email", "operation": "validateEmail", "inputMode": "single", "email": "={{ $json.email }}",
    "outputMode": "selected", "outputFields": ["email_status", "mx_provider"],
}, onError="continueRegularOutput")
w.node("Drop invalid emails", "n8n-nodes-base.filter", 2.4, (880, 0), conditions(
    cond("={{ $json.email_status }}", "notEquals", "invalid")))
w.node("Lead row", "n8n-nodes-base.set", 3.5, (1100, 0), assign(
    ("Listing ID", "={{ $('Search local leads').item.json.id }}", "string"),
    ("Business", "={{ $('Search local leads').item.json.name }}", "string"),
    ("Category", "={{ $('Search local leads').item.json.category }}", "string"),
    ("Phone", "={{ $('Search local leads').item.json.phone }}", "string"),
    ("Email", "={{ $('Search local leads').item.json.email }}", "string"),
    ("Email Status", "={{ $json.email_status ?? 'error' }}", "string"),
    ("Website", "={{ $('Search local leads').item.json.website }}", "string"),
    ("Address", "={{ [$('Search local leads').item.json.street, $('Search local leads').item.json.city, $('Search local leads').item.json.region_code].filter(Boolean).join(', ') }}", "string"),
))
w.node("Save leads", "n8n-nodes-base.googleSheets", 4.7, (1320, 0), {
    "operation": "appendOrUpdate", "documentId": sheet(),
    "sheetName": {"__rl": True, "value": "gid=0", "mode": "list", "cachedResultName": "Sheet1"},
    "columns": {"mappingMode": "autoMapInputData", "value": {}, "matchingColumns": ["Listing ID"], "schema": []}, "options": {}})
w.chain("Run manually", "Search settings", "Search local leads", "Validate email", "Drop invalid emails", "Lead row", "Save leads")
catalog.append(w.write("Search local businesses by city and category, validate their emails, and upsert them into Google Sheets."))

# ---------------------------------------------------------------------------
# 6. Champion job-change alerts
# ---------------------------------------------------------------------------
w = Workflow("champion-job-change-alerts", "Alert sales when a customer champion changes jobs with LeadMagic")
w.sticky("Overview", overview(
    "Champion job-change alerts",
    "1. Every Monday, reads your champions (people who bought or used your product).\n2. Job Change Detector checks whether each one still works at the company you expect.\n"
    "3. When someone moved, Email Finder gets their new work email and Slack alerts the account owner.\n4. Every result is written back to the sheet with the date checked.",
    "1. Sheet columns: `Name`, `Profile URL`, `Company Domain`, `Status`, `Checked At`.\n2. Paste the sheet URL into **Read champions** and **Record status**.\n"
    "3. Pick a Slack channel in **Alert account owner**.\n4. Select your LeadMagic, Google Sheets, and Slack credentials.",
    "The detector also returns `NEVER_WORKED_THERE` and `AMBIGUOUS_CURRENT_EMPLOYMENT`; route those to a review queue if you need to clean your CRM.",
), (-560, -360), 460, 680)
w.node("Every Monday", "n8n-nodes-base.scheduleTrigger", 1.4, (0, 0), {
    "rule": {"interval": [{"field": "weeks", "triggerAtDay": [1], "triggerAtHour": 8}]}})
w.node("Read champions", "n8n-nodes-base.googleSheets", 4.7, (220, 0), {
    "documentId": sheet(), "sheetName": {"__rl": True, "value": "gid=0", "mode": "list", "cachedResultName": "Sheet1"}, "options": {}})
w.lm("Detect job change", (440, 0), {
    "resource": "people", "operation": "detectJobChange", "profile_url": "={{ $json['Profile URL'] }}",
    "companyIdentifier": "domain", "company_domain": "={{ $json['Company Domain'] }}",
}, onError="continueRegularOutput")
w.node("Record status", "n8n-nodes-base.googleSheets", 4.7, (680, 160), {
    "operation": "update", "documentId": sheet(),
    "sheetName": {"__rl": True, "value": "gid=0", "mode": "list", "cachedResultName": "Sheet1"},
    "columns": {"mappingMode": "defineBelow", "value": {
        "row_number": "={{ $('Read champions').item.json.row_number }}",
        "Status": "={{ $json.status ?? 'error' }}",
        "Checked At": "={{ $now.toISODate() }}",
    }, "matchingColumns": ["row_number"], "schema": []}, "options": {}})
w.node("Changed jobs?", "n8n-nodes-base.if", 2.4, (680, -120), conditions(
    cond("={{ $json.status }}", "equals", "JOB_CHANGE_DETECTED")))
w.lm("Find new work email", (900, -200), {
    "resource": "email", "operation": "findEmail", "findBy": "profile",
    "profile_url": "={{ $('Read champions').item.json['Profile URL'] }}", "allow_domain_mismatch": True,
}, onError="continueRegularOutput")
w.node("Alert account owner", "n8n-nodes-base.slack", 2.7, (1120, -200), {
    "select": "channel", "channelId": {"__rl": True, "value": "", "mode": "list"},
    "text": "=:wave: Champion *{{ $('Read champions').item.json.Name }}* left {{ $('Read champions').item.json['Company Domain'] }} "
            "and now works at *{{ $('Detect job change').item.json.current_company?.name ?? 'a new company' }}*.\n"
            "New email: {{ $json.email || 'not found' }}",
    "otherOptions": {}})
w.chain("Every Monday", "Read champions", "Detect job change")
w.connect("Detect job change", "Changed jobs?")
w.connect("Detect job change", "Record status")
w.connect("Changed jobs?", "Find new work email", output=0)
w.chain("Find new work email", "Alert account owner")
catalog.append(w.write("Weekly job-change checks for your champions, with the new work email posted to Slack and status written back to the sheet."))

# ---------------------------------------------------------------------------
# 7. AI research agent using LeadMagic as tools
# ---------------------------------------------------------------------------
w = Workflow("ai-account-research-agent", "Research accounts and contacts in chat with an AI agent and LeadMagic tools")
w.sticky("Overview", overview(
    "AI account research agent",
    "Chat with an AI agent that calls LeadMagic as tools: it enriches a company, searches its people, and finds a work email only when you ask for one. "
    "Tool outputs use the Simplified or Selected Fields modes to keep the context small.",
    "1. Select an Anthropic credential in **Claude** (or swap in any chat model).\n2. Select your LeadMagic credential in each tool.\n3. Open the chat and ask, for example: *Who runs sales at example.com, and what is their email?*",
    "Add more LeadMagic tools (Technographics, Find Lookalikes, Job Search) by adding the LeadMagic Tool node again with another operation. "
    "Each tool call can use credits, so the system message tells the agent to confirm before finding emails.",
), (-560, -360), 460, 660)
w.node("Chat", "@n8n/n8n-nodes-langchain.chatTrigger", 1.5, (0, 0), {"options": {}})
w.node("Research agent", "@n8n/n8n-nodes-langchain.agent", 3.1, (260, 0), {
    "options": {"systemMessage": (
        "You are a B2B research assistant. Use the LeadMagic tools to answer questions about companies and people. "
        "Prefer one Company Enrich call per company. Use People Search to find people by title or department. "
        "Only call Find Work Email when the user asks for an email. Never guess emails or invent facts; say when a tool returns nothing.")}})
w.node("Claude", "@n8n/n8n-nodes-langchain.lmChatAnthropic", 1.6, (120, 240), {
    "model": {"__rl": True, "mode": "list", "value": "claude-sonnet-4-6", "cachedResultName": "Claude Sonnet 4.6"}, "options": {}})
w.node("Memory", "@n8n/n8n-nodes-langchain.memoryBufferWindow", 1.4, (280, 240), {})
w.node("Company enrich", LM_TOOL, 1, (440, 240), {
    "toolDescription": "Get firmographics for one company from its website domain.",
    "resource": "company", "operation": "searchCompany",
    "company_domain": "={{ $fromAI('company_domain', 'Company website domain, for example example.com', 'string') }}",
    "outputMode": "simplified"})
w.node("People search", LM_TOOL, 1, (600, 240), {
    "toolDescription": "Find people at a company by title. Returns names, titles, and profile URLs, never emails.",
    "resource": "people", "operation": "searchPeople",
    "company_domain": "={{ $fromAI('company_domain', 'Company website domain', 'string') }}",
    "titles": "={{ $fromAI('titles', 'Comma-separated job titles to look for', 'string') }}",
    "limit": 10, "outputMode": "selected",
    "outputFields": ["contact_full_name", "contact_job_title", "contact_linkedin_url", "company_domain"]})
w.node("Find work email", LM_TOOL, 1, (760, 240), {
    "toolDescription": "Find a verified work email from a person's profile URL. Costs a credit when an email is found.",
    "resource": "email", "operation": "findEmail", "findBy": "profile",
    "profile_url": "={{ $fromAI('profile_url', 'The person profile URL from People Search', 'string') }}",
    "outputMode": "selected", "outputFields": ["email", "status"]})
w.connect("Chat", "Research agent")
w.connect("Claude", "Research agent", kind="ai_languageModel")
w.connect("Memory", "Research agent", kind="ai_memory")
for tool in ("Company enrich", "People search", "Find work email"):
    w.connect(tool, "Research agent", kind="ai_tool")
catalog.append(w.write("A chat agent that enriches companies, searches people, and finds emails on request with LeadMagic tools."))

# ---------------------------------------------------------------------------
# 8. Real-time enrichment API (webhook)
# ---------------------------------------------------------------------------
w = Workflow("realtime-enrichment-webhook", "Expose a real-time contact enrichment API with a webhook and LeadMagic")
w.sticky("Overview", overview(
    "Real-time enrichment API",
    "POST `first_name`, `last_name`, and `domain` to the webhook. The workflow finds the work email, enriches the company, and responds with one JSON object. "
    "Not found returns 404 and LeadMagic errors return 502, so callers can branch on the status code.",
    "1. Select your LeadMagic credential.\n2. Add authentication to **Enrichment request** (Header Auth is easiest) before activating.\n3. Activate the workflow and call the production URL.",
    "Add Mobile Finder or Technographics before **Success response** to return more fields. Keep the response small for forms and CRMs that wait on it.",
), (-560, -320), 460, 620)
w.node("Enrichment request", "n8n-nodes-base.webhook", 2.2, (0, 0), {
    "httpMethod": "POST", "path": "leadmagic-enrich", "responseMode": "responseNode", "options": {}})
w.lm("Find work email", (220, 0), {
    "resource": "email", "operation": "findEmail",
    "first_name": "={{ $json.body.first_name }}", "last_name": "={{ $json.body.last_name }}", "domain": "={{ $json.body.domain }}",
}, onError="continueErrorOutput")
w.node("Email found?", "n8n-nodes-base.if", 2.4, (440, -80), conditions(cond("={{ $json.status }}", "equals", "valid")))
w.lm("Enrich company", (660, -160), {
    "resource": "company", "operation": "searchCompany", "company_domain": "={{ $('Enrichment request').item.json.body.domain }}",
    "outputMode": "selected", "outputFields": ["companyName", "industry", "employeeCount", "websiteUrl"],
}, onError="continueRegularOutput")
w.node("Success response", "n8n-nodes-base.respondToWebhook", 1.5, (880, -160), {
    "respondWith": "json",
    "responseBody": "={{ { email: $('Find work email').item.json.email, status: 'valid', company: $json.error ? null : $json } }}",
    "options": {}})
w.node("Not found response", "n8n-nodes-base.respondToWebhook", 1.5, (660, 40), {
    "respondWith": "json", "responseBody": "={{ { email: null, status: 'not_found' } }}",
    "options": {"responseCode": 404}})
w.node("Error response", "n8n-nodes-base.respondToWebhook", 1.5, (440, 180), {
    "respondWith": "json", "responseBody": "={{ { error: $json.error } }}", "options": {"responseCode": 502}})
w.connect("Enrichment request", "Find work email")
w.connect("Find work email", "Email found?", output=0)
w.connect("Find work email", "Error response", output=1)
w.connect("Email found?", "Enrich company", output=0)
w.connect("Email found?", "Not found response", output=1)
w.connect("Enrich company", "Success response")
w.sticky("Security note", "## Secure the webhook\nAdd authentication to **Enrichment request** before activating. An open webhook lets anyone spend your credits.", (-60, 160), 260, 220, 3)
catalog.append(w.write("A webhook API that returns a verified work email plus company firmographics, with 404 and 502 branches."))

# ---------------------------------------------------------------------------
# 9. Inbound lead router
# ---------------------------------------------------------------------------
w = Workflow("inbound-lead-router", "Validate, enrich, and route inbound leads from a form with LeadMagic")
w.sticky("Overview", overview(
    "Inbound lead router",
    "1. A hosted n8n form collects name, work email, and company website.\n2. The email is validated; invalid addresses are dropped.\n"
    "3. The company is enriched from its website domain.\n4. Companies above your headcount threshold alert sales in Slack; everyone else goes to a nurture sheet.",
    "1. Open **Lead form** and copy its production URL (or embed it).\n2. Set the threshold in **Big enough for sales?**.\n3. Pick a Slack channel and paste a sheet URL.\n4. Select your LeadMagic, Slack, and Google Sheets credentials.",
    "Swap the form for a Webhook to accept leads from your site or ads. Add **Find Mobile** on the sales branch for fast follow-up.",
), (-560, -360), 460, 660)
w.node("Lead form", "n8n-nodes-base.formTrigger", 2.6, (0, 0), {
    "formTitle": "Talk to sales", "formDescription": "We'll get back to you within one business day.",
    "formFields": {"values": [
        {"fieldLabel": "Name", "requiredField": True},
        {"fieldLabel": "Work Email", "fieldType": "email", "requiredField": True},
        {"fieldLabel": "Company Website", "placeholder": "example.com", "requiredField": True},
    ]}, "options": {}})
w.lm("Validate email", (220, 0), {
    "resource": "email", "operation": "validateEmail", "inputMode": "single", "email": "={{ $json['Work Email'] }}",
    "outputMode": "selected", "outputFields": ["email_status"],
}, onError="continueRegularOutput")
w.node("Deliverable?", "n8n-nodes-base.filter", 2.4, (440, 0), conditions(
    cond("={{ $json.email_status }}", "notEquals", "invalid")))
w.lm("Enrich company", (660, 0), {
    "resource": "company", "operation": "searchCompany",
    "company_domain": "={{ $('Lead form').item.json['Company Website'].replace(/^https?:\\/\\/(www\\.)?/, '').split('/')[0] }}",
    "outputMode": "selected", "outputFields": ["companyName", "industry", "employeeCount", "websiteUrl"],
}, onError="continueRegularOutput")
w.node("Big enough for sales?", "n8n-nodes-base.if", 2.4, (880, 0), conditions(
    cond("={{ Number($json.employeeCount ?? 0) }}", "gte", 50, type_="number")))
w.node("Alert sales", "n8n-nodes-base.slack", 2.7, (1100, -100), {
    "select": "channel", "channelId": {"__rl": True, "value": "", "mode": "list"},
    "text": "=:fire: New inbound lead: *{{ $('Lead form').item.json.Name }}* ({{ $('Lead form').item.json['Work Email'] }})\n"
            "{{ $json.companyName }} · {{ $json.industry }} · {{ $json.employeeCount }} employees",
    "otherOptions": {}})
w.node("Add to nurture", "n8n-nodes-base.googleSheets", 4.7, (1100, 120), {
    "operation": "append", "documentId": sheet(),
    "sheetName": {"__rl": True, "value": "gid=0", "mode": "list", "cachedResultName": "Sheet1"},
    "columns": {"mappingMode": "defineBelow", "value": {
        "Name": "={{ $('Lead form').item.json.Name }}", "Email": "={{ $('Lead form').item.json['Work Email'] }}",
        "Company": "={{ $json.companyName }}", "Employees": "={{ $json.employeeCount }}",
    }, "matchingColumns": [], "schema": []}, "options": {}})
w.chain("Lead form", "Validate email", "Deliverable?", "Enrich company", "Big enough for sales?")
w.connect("Big enough for sales?", "Alert sales", output=0)
w.connect("Big enough for sales?", "Add to nurture", output=1)
catalog.append(w.write("A hosted lead form that validates the email, enriches the company, and routes big accounts to Slack and the rest to nurture."))

# ---------------------------------------------------------------------------
# 10. Tech-stack displacement
# ---------------------------------------------------------------------------
w = Workflow("tech-stack-displacement", "Find companies using a competitor's product and their decision makers with LeadMagic")
w.sticky("Overview", overview(
    "Tech-stack displacement list",
    "1. **Target settings** names the competitor technology you replace.\n2. Company Search finds companies whose recorded tech stack includes it.\n"
    "3. Technographics confirms the technology is still in use.\n4. People Search finds senior people in the owning department, and Email Finder gets verified emails.\n5. Contacts are saved to a sheet with the confirmed technology.",
    "1. Edit **Target settings**.\n2. Paste a sheet URL into **Save contacts**.\n3. Select your LeadMagic and Google Sheets credentials.",
    "Change the department in **Find owners** to match who buys your product (for example Engineering for developer tools).",
), (-560, -360), 460, 660)
w.node("Run manually", "n8n-nodes-base.manualTrigger", 1, (0, 0))
w.node("Target settings", "n8n-nodes-base.set", 3.5, (220, 0), assign(
    ("technology", "HubSpot", "string"), ("hq_country_codes", "US", "string"),
    ("min_employees", 50, "number"), ("max_employees", 1000, "number"), ("accounts", 20, "number"),
))
w.lm("Companies using it", (440, 0), {
    "resource": "company", "operation": "searchCompanies",
    "companyFilters": {"tech_stack": "={{ $json.technology }}", "country_codes": "={{ $json.hq_country_codes }}",
                       "min_employees": "={{ $json.min_employees }}", "max_employees": "={{ $json.max_employees }}"},
    "limit": "={{ $json.accounts }}",
})
w.lm("Confirm technographics", (660, 0), {
    "resource": "company", "operation": "getTechnographics", "company_domain": "={{ $json.company_domain }}",
}, onError="continueRegularOutput")
w.node("Still uses it", "n8n-nodes-base.filter", 2.4, (880, 0), conditions(
    cond("={{ ($json.data ?? []).some(t => String(t.name).toLowerCase().includes($('Target settings').first().json.technology.toLowerCase())) }}", "true", type_="boolean", single=True)))
w.lm("Find owners", (1100, 0), {
    "resource": "people", "operation": "searchPeople",
    "company_domain": "={{ $('Companies using it').item.json.company_domain }}",
    "peopleFilters": {"contact_job_function": ["Marketing"], "min_seniority": 3, "include_company": False}, "limit": 2,
})
w.lm("Find work email", (1320, 0), {
    "resource": "email", "operation": "findEmail", "findBy": "profile", "profile_url": "={{ $json.contact_linkedin_url }}",
    "outputMode": "selected", "outputFields": ["email", "status"],
}, onError="continueRegularOutput")
w.node("Keep valid emails", "n8n-nodes-base.filter", 2.4, (1540, 0), conditions(cond("={{ $json.status }}", "equals", "valid")))
w.node("Save contacts", "n8n-nodes-base.googleSheets", 4.7, (1760, 0), {
    "operation": "append", "documentId": sheet(),
    "sheetName": {"__rl": True, "value": "gid=0", "mode": "list", "cachedResultName": "Sheet1"},
    "columns": {"mappingMode": "defineBelow", "value": {
        "Name": "={{ $('Find owners').item.json.contact_full_name }}", "Title": "={{ $('Find owners').item.json.contact_job_title }}",
        "Company": "={{ $('Companies using it').item.json.company_name }}", "Domain": "={{ $('Companies using it').item.json.company_domain }}",
        "Email": "={{ $json.email }}", "Uses": "={{ $('Target settings').first().json.technology }}",
    }, "matchingColumns": [], "schema": []}, "options": {}})
w.chain("Run manually", "Target settings", "Companies using it", "Confirm technographics", "Still uses it", "Find owners",
        "Find work email", "Keep valid emails", "Save contacts")
catalog.append(w.write("Companies running a competitor's technology, confirmed with technographics, with verified emails for the people who own it."))

# ---------------------------------------------------------------------------
# 11. Funding signal digest
# ---------------------------------------------------------------------------
w = Workflow("funding-signal-digest", "Send a weekly digest of newly funded companies and their founders with LeadMagic")
w.sticky("Overview", overview(
    "Weekly funding signal digest",
    "1. Every Monday, Company Search finds companies in your ICP with a funding round in the last 30 days.\n"
    "2. People Search finds the CEO or founder at each company, and Email Finder gets their work email.\n3. One Slack message lists every company, round, founder, and email.",
    "1. Adjust filters in **Recently funded companies**.\n2. Pick a Slack channel in **Post digest**.\n3. Select your LeadMagic and Slack credentials.",
    "Change the titles in **Find founder** to reach a different buyer, such as Head of Sales after a Series A.",
), (-560, -360), 460, 640)
w.node("Every Monday", "n8n-nodes-base.scheduleTrigger", 1.4, (0, 0), {
    "rule": {"interval": [{"field": "weeks", "triggerAtDay": [1], "triggerAtHour": 9}]}})
w.lm("Recently funded companies", (220, 0), {
    "resource": "company", "operation": "searchCompanies",
    "companyFilters": {"has_funding": True, "country_codes": "US", "industries": "Software Development", "max_employees": 200},
    "additionalJson": "={{ JSON.stringify({ company_filters: { last_funding_after: $now.minus({ days: 30 }).toISODate() } }) }}",
    "limit": 25,
})
w.lm("Find founder", (440, 0), {
    "resource": "people", "operation": "searchPeople", "company_domain": "={{ $json.company_domain }}",
    "titles": "CEO, Founder, Co-Founder", "peopleFilters": {"include_company": False}, "limit": 1,
})
w.lm("Find work email", (660, 0), {
    "resource": "email", "operation": "findEmail", "findBy": "profile", "profile_url": "={{ $json.contact_linkedin_url }}",
    "outputMode": "selected", "outputFields": ["email", "status"],
}, onError="continueRegularOutput")
w.node("Digest line", "n8n-nodes-base.set", 3.5, (880, 0), assign(
    ("line", "=• *{{ $('Recently funded companies').item.json.company_name }}* ({{ $('Recently funded companies').item.json.company_domain }}): "
             "{{ $('Recently funded companies').item.json.last_funding_type ?? 'round' }} on {{ $('Recently funded companies').item.json.last_funding_date ?? 'n/a' }}. "
             "{{ $('Find founder').item.json.contact_full_name }}, {{ $('Find founder').item.json.contact_job_title }}: {{ $json.email || 'email not found' }}", "string"),
))
w.node("Combine lines", "n8n-nodes-base.aggregate", 1, (1100, 0), {
    "fieldsToAggregate": {"fieldToAggregate": [{"fieldToAggregate": "line"}]}, "options": {}})
w.node("Post digest", "n8n-nodes-base.slack", 2.7, (1320, 0), {
    "select": "channel", "channelId": {"__rl": True, "value": "", "mode": "list"},
    "text": "=:moneybag: *Newly funded companies this week*\n{{ $json.line.join('\\n') }}", "otherOptions": {}})
w.chain("Every Monday", "Recently funded companies", "Find founder", "Find work email", "Digest line", "Combine lines", "Post digest")
catalog.append(w.write("A weekly Slack digest of recently funded ICP companies with each founder and their verified email."))

# ---------------------------------------------------------------------------
# 12. Competitor ad intelligence with an AI summary
# ---------------------------------------------------------------------------
w = Workflow("competitor-ads-ai-digest", "Summarize competitors' Google, Meta, and B2B ads weekly with LeadMagic and AI")
w.sticky("Overview", overview(
    "Competitor ad intelligence digest",
    "1. Every Monday, collects each competitor's current Google, Meta, and B2B ads.\n2. An AI model summarizes themes, offers, and changes across competitors.\n3. The summary is posted to Slack.",
    "1. List competitor domains in **Competitors**.\n2. Select an Anthropic credential in **Claude** (or swap in any chat model).\n3. Pick a Slack channel.\n4. Select your LeadMagic credential in the three ad nodes.",
    "Ads are charged per ad returned. **Max Ads** is set to 10 per network; raise it for deeper research.",
), (-560, -360), 460, 640)
w.node("Every Monday", "n8n-nodes-base.scheduleTrigger", 1.4, (0, 0), {
    "rule": {"interval": [{"field": "weeks", "triggerAtDay": [1], "triggerAtHour": 8}]}})
w.node("Competitors", "n8n-nodes-base.set", 3.5, (220, 0), {
    "mode": "raw", "jsonOutput": "{\n  \"competitors\": [\"example.com\", \"example.org\"]\n}\n", "options": {}})
w.node("One item per competitor", "n8n-nodes-base.splitOut", 1, (440, 0), {"fieldToSplitOut": "competitors", "options": {}})
for name, op, x in (("Google ads", "searchGoogleAds", 660), ("Meta ads", "searchMetaAds", 880), ("B2B ads", "searchB2BAds", 1100)):
    w.lm(name, (x, 0), {
        "resource": "advertisement", "operation": op, "searchMethod": "domain",
        "company_domain": "={{ $('One item per competitor').item.json.competitors }}", "adsLimit": 10,
        "outputMode": "simplified"}, onError="continueRegularOutput")
w.node("Competitor summary", "n8n-nodes-base.set", 3.5, (1320, 0), assign(
    ("competitor", "={{ $('One item per competitor').item.json.competitors }}", "string"),
    ("google", "={{ JSON.stringify($('Google ads').item.json.ads ?? []).slice(0, 4000) }}", "string"),
    ("meta", "={{ JSON.stringify($('Meta ads').item.json.ads ?? []).slice(0, 4000) }}", "string"),
    ("b2b", "={{ JSON.stringify($json.ads ?? []).slice(0, 4000) }}", "string"),
))
w.node("All competitors", "n8n-nodes-base.aggregate", 1, (1540, 0), {
    "aggregate": "aggregateAllItemData", "destinationFieldName": "competitors", "options": {}})
w.node("Summarize ads", "@n8n/n8n-nodes-langchain.chainLlm", 1.9, (1760, 0), {
    "promptType": "define",
    "text": "=You are a B2B marketing analyst. Summarize these competitors' current ads for a sales and marketing team.\n"
            "For each competitor: main messages, offers or CTAs, and audiences targeted. Then list 3 cross-competitor themes and 2 ideas for our positioning.\n"
            "Be concise and only use the data provided.\n\n{{ JSON.stringify($json.competitors) }}",
    "hasOutputParser": False})
w.node("Claude", "@n8n/n8n-nodes-langchain.lmChatAnthropic", 1.6, (1700, 220), {
    "model": {"__rl": True, "mode": "list", "value": "claude-sonnet-4-6", "cachedResultName": "Claude Sonnet 4.6"}, "options": {}})
w.node("Post to Slack", "n8n-nodes-base.slack", 2.7, (2000, 0), {
    "select": "channel", "channelId": {"__rl": True, "value": "", "mode": "list"},
    "text": "=:mag_right: *Competitor ads this week*\n\n{{ $json.text }}", "otherOptions": {}})
w.chain("Every Monday", "Competitors", "One item per competitor", "Google ads", "Meta ads", "B2B ads",
        "Competitor summary", "All competitors", "Summarize ads", "Post to Slack")
w.connect("Claude", "Summarize ads", kind="ai_languageModel")
catalog.append(w.write("Weekly Google, Meta, and B2B ads for each competitor, summarized by AI into themes and positioning ideas in Slack."))

# ---------------------------------------------------------------------------
# 13. Buying committee builder
# ---------------------------------------------------------------------------
w = Workflow("buying-committee-builder", "Map the buying committee at target accounts with emails and mobiles using LeadMagic")
w.sticky("Overview", overview(
    "Buying committee builder",
    "1. List target account domains in **Target accounts**.\n2. People Search finds senior people across the departments in your buying committee.\n"
    "3. Email Finder gets each verified work email; VP-level and above also get a mobile number.\n4. One row per person is saved to a sheet.",
    "1. Edit **Target accounts**.\n2. Paste a sheet URL into **Save committee**.\n3. Select your LeadMagic and Google Sheets credentials.",
    "Change departments and seniority in **Find committee**. Mobile Finder is the costliest step, so it only runs for VP and above.",
), (-560, -360), 460, 640)
w.node("Run manually", "n8n-nodes-base.manualTrigger", 1, (0, 0))
w.node("Target accounts", "n8n-nodes-base.set", 3.5, (220, 0), {
    "mode": "raw", "jsonOutput": "{\n  \"domains\": [\"example.com\", \"example.org\"]\n}\n", "options": {}})
w.node("One item per account", "n8n-nodes-base.splitOut", 1, (440, 0), {"fieldToSplitOut": "domains", "options": {}})
w.lm("Find committee", (660, 0), {
    "resource": "people", "operation": "searchPeople", "company_domain": "={{ $json.domains }}",
    "peopleFilters": {"contact_job_function": ["Sales", "Marketing", "Operations", "Information Technology"], "min_seniority": 3, "include_company": False},
    "limit": 12,
})
w.lm("Find work email", (880, 0), {
    "resource": "email", "operation": "findEmail", "findBy": "profile", "profile_url": "={{ $json.contact_linkedin_url }}",
    "outputMode": "selected", "outputFields": ["email", "status"],
}, onError="continueRegularOutput")
w.node("VP or above?", "n8n-nodes-base.if", 2.4, (1100, 0), conditions(
    cond("={{ $('Find committee').item.json.seniority_score }}", "gte", 4, type_="number")))
w.lm("Find mobile", (1320, -100), {
    "resource": "profile", "operation": "findMobile", "searchMethod": "profile",
    "profile_url": "={{ $('Find committee').item.json.contact_linkedin_url }}",
    "outputMode": "selected", "outputFields": ["mobile_number"],
}, onError="continueRegularOutput")
w.node("Committee row", "n8n-nodes-base.set", 3.5, (1540, 0), assign(
    ("Account", "={{ $('Find committee').item.json.company_domain }}", "string"),
    ("Name", "={{ $('Find committee').item.json.contact_full_name }}", "string"),
    ("Title", "={{ $('Find committee').item.json.contact_job_title }}", "string"),
    ("Department", "={{ $('Find committee').item.json.contact_job_function }}", "string"),
    ("Email", "={{ $('Find work email').item.json.status === 'valid' ? $('Find work email').item.json.email : '' }}", "string"),
    ("Mobile", "={{ $json.mobile_number ?? '' }}", "string"),
    ("Profile URL", "={{ $('Find committee').item.json.contact_linkedin_url }}", "string"),
))
w.node("Save committee", "n8n-nodes-base.googleSheets", 4.7, (1760, 0), {
    "operation": "appendOrUpdate", "documentId": sheet(),
    "sheetName": {"__rl": True, "value": "gid=0", "mode": "list", "cachedResultName": "Sheet1"},
    "columns": {"mappingMode": "autoMapInputData", "value": {}, "matchingColumns": ["Profile URL"], "schema": []}, "options": {}})
w.chain("Run manually", "Target accounts", "One item per account", "Find committee", "Find work email", "VP or above?")
w.connect("VP or above?", "Find mobile", output=0)
w.connect("VP or above?", "Committee row", output=1)
w.chain("Find mobile", "Committee row", "Save committee")
catalog.append(w.write("Senior people across your buying committee at each target account, with verified emails and mobiles for VP and above."))

# ---------------------------------------------------------------------------
# 14. HubSpot email hygiene
# ---------------------------------------------------------------------------
w = Workflow("hubspot-email-hygiene", "Validate HubSpot contact emails weekly and write the status back with LeadMagic")
w.sticky("Overview", overview(
    "HubSpot email hygiene",
    "1. Every Sunday, pulls HubSpot contacts with an email.\n2. LeadMagic validates each address.\n"
    "3. The status (`valid`, `invalid`, or `unknown`) and mail provider are written to two contact properties, so you can suppress bounces and segment by provider.",
    "1. In HubSpot, create the contact properties `leadmagic_email_status` and `leadmagic_mx_provider` (single-line text).\n"
    "2. Select a HubSpot app token credential in both HubSpot nodes.\n3. Select your LeadMagic credential.",
    "Use a HubSpot list or filter in **Get contacts** to check only new or recently changed contacts. `unknown` results (including catch-all domains) are free.",
), (-560, -360), 460, 660)
w.node("Every Sunday", "n8n-nodes-base.scheduleTrigger", 1.4, (0, 0), {
    "rule": {"interval": [{"field": "weeks", "triggerAtDay": [0], "triggerAtHour": 3}]}})
w.node("Get contacts", "n8n-nodes-base.hubspot", 2.3, (220, 0), {
    "authentication": "appToken", "operation": "search", "limit": 500,
    "additionalFields": {"properties": ["email", "firstname", "lastname"]}})
w.node("Has an email", "n8n-nodes-base.filter", 2.4, (440, 0), conditions(
    cond("={{ $json.properties?.email }}", "notEmpty", single=True)))
w.lm("Validate email", (660, 0), {
    "resource": "email", "operation": "validateEmail", "inputMode": "single", "email": "={{ $json.properties.email }}",
    "outputMode": "selected", "outputFields": ["email_status", "mx_provider"],
}, onError="continueRegularOutput")
w.node("Update contact", "n8n-nodes-base.hubspot", 2.3, (880, 0), {
    "authentication": "appToken", "email": "={{ $('Has an email').item.json.properties.email }}",
    "additionalFields": {"customPropertiesUi": {"customPropertiesValues": [
        {"property": "leadmagic_email_status", "value": "={{ $json.email_status ?? 'error' }}"},
        {"property": "leadmagic_mx_provider", "value": "={{ $json.mx_provider ?? '' }}"},
    ]}}, "options": {}})
w.chain("Every Sunday", "Get contacts", "Has an email", "Validate email", "Update contact")
catalog.append(w.write("Weekly HubSpot email validation that writes the status and mail provider back to each contact."))

# ---------------------------------------------------------------------------
# 15. Bulk job for large lists
# ---------------------------------------------------------------------------
w = Workflow("bulk-job-large-lists", "Enrich tens of thousands of rows with a LeadMagic bulk job")
w.sticky("Overview", overview(
    "Large-list enrichment with a bulk job",
    "1. Reads every row from a Google Sheet.\n2. Submits them as one asynchronous LeadMagic bulk job (up to 500,000 rows).\n"
    "3. Checks the job every 2 minutes until it finishes.\n4. Pulls the results and appends one row per input to a results sheet.",
    "1. Source sheet columns must match the product's inputs: `first_name`, `last_name`, `domain` for Find Work Email.\n"
    "2. Paste the source and results sheet URLs.\n3. Select your LeadMagic and Google Sheets credentials.",
    "Change **Product** in **Submit bulk job** to validate emails, find mobiles, or enrich profiles instead. "
    "For very large jobs, set a Callback URL to an n8n Webhook instead of polling.",
), (-560, -360), 460, 660)
w.node("Run manually", "n8n-nodes-base.manualTrigger", 1, (0, 0))
w.node("Read rows", "n8n-nodes-base.googleSheets", 4.7, (220, 0), {
    "documentId": sheet(), "sheetName": {"__rl": True, "value": "gid=0", "mode": "list", "cachedResultName": "Sheet1"}, "options": {}})
w.lm("Submit bulk job", (440, 0), {
    "resource": "bulkJob", "operation": "submitBulkJob", "product": "email_finder", "rowsFrom": "items",
    "rowFields": "first_name, last_name, domain",
    "bulkOptions": {"idempotencyKey": "={{ $execution.id }}", "fileName": "n8n bulk email finder"}})
w.node("Wait 2 minutes", "n8n-nodes-base.wait", 1.1, (660, 0), {"amount": 2, "unit": "minutes"})
w.lm("Check status", (880, 0), {
    "resource": "bulkJob", "operation": "getBulkStatus", "jobId": "={{ $('Submit bulk job').first().json.jobId }}"})
w.node("Job state", "n8n-nodes-base.switch", 3.5, (1100, 0), {
    "rules": {"values": [
        {"conditions": conditions(cond("={{ $json.status }}", "equals", "completed"))["conditions"], "renameOutput": True, "outputKey": "Completed"},
        {"conditions": conditions(cond("={{ ['failed', 'canceled'].includes($json.status) }}", "true", type_="boolean", single=True))["conditions"], "renameOutput": True, "outputKey": "Failed"},
    ]},
    "options": {"fallbackOutput": "extra", "renameFallbackOutput": "Still running"}})
w.lm("Get results", (1320, -100), {
    "resource": "bulkJob", "operation": "getBulkResults", "jobId": "={{ $('Submit bulk job').first().json.jobId }}", "returnAll": True})
w.node("Result row", "n8n-nodes-base.set", 3.5, (1540, -100), assign(
    ("first_name", "={{ $json.lm_input?.first_name }}", "string"),
    ("last_name", "={{ $json.lm_input?.last_name }}", "string"),
    ("domain", "={{ $json.lm_input?.domain }}", "string"),
    ("email", "={{ $json.lm_output?.email ?? '' }}", "string"),
    ("email_status", "={{ $json.lm_output?.status ?? $json.status }}", "string"),
))
w.node("Save results", "n8n-nodes-base.googleSheets", 4.7, (1760, -100), {
    "operation": "append", "documentId": sheet(),
    "sheetName": {"__rl": True, "value": "gid=0", "mode": "list", "cachedResultName": "Sheet1"},
    "columns": {"mappingMode": "autoMapInputData", "value": {}, "matchingColumns": [], "schema": []}, "options": {}})
w.node("Job failed", "n8n-nodes-base.stopAndError", 1, (1320, 100), {
    "errorMessage": "=LeadMagic bulk job {{ $json.jobId ?? '' }} ended with status {{ $json.status }}"})
w.chain("Run manually", "Read rows", "Submit bulk job", "Wait 2 minutes", "Check status", "Job state")
w.connect("Job state", "Get results", output=0)
w.connect("Job state", "Job failed", output=1)
w.connect("Job state", "Wait 2 minutes", output=2)
w.chain("Get results", "Result row", "Save results")
w.sticky("Poll note", "## Poll until done\nThe fallback output loops back to the Wait node, so the workflow checks again every 2 minutes until the job completes or fails.", (620, -200), 640, 380, 7)
catalog.append(w.write("Submit a whole sheet as one asynchronous bulk job, poll until it finishes, and write every result back."))

# ---------------------------------------------------------------------------
# 16. Low credit alert
# ---------------------------------------------------------------------------
w = Workflow("low-credit-alert", "Alert in Slack when LeadMagic credits run low")
w.sticky("Overview", overview(
    "Low credit alert",
    "Every morning, checks your LeadMagic credit balance and last 7 days of usage (both free) and posts to Slack when the balance drops below your threshold, "
    "so scheduled workflows don't stop with `402 insufficient_credits`.",
    "1. Set the threshold in **Below threshold?**.\n2. Pick a Slack channel.\n3. Select your LeadMagic and Slack credentials.",
    "Point this at an email or PagerDuty node instead of Slack, or add it as the error workflow for your other LeadMagic workflows.",
), (-560, -300), 420, 520)
w.node("Every morning", "n8n-nodes-base.scheduleTrigger", 1.4, (0, 0), {
    "rule": {"interval": [{"field": "days", "triggerAtHour": 8}]}})
w.lm("Get balance", (220, 0), {"resource": "credit", "operation": "getCredits"})
w.lm("Get 7-day usage", (440, 0), {"resource": "credit", "operation": "getUsage", "days": 7})
w.node("Below threshold?", "n8n-nodes-base.if", 2.4, (660, 0), conditions(
    cond("={{ Number($('Get balance').item.json.credits) }}", "lt", 5000, type_="number")))
w.node("Alert", "n8n-nodes-base.slack", 2.7, (880, -80), {
    "select": "channel", "channelId": {"__rl": True, "value": "", "mode": "list"},
    "text": "=:warning: LeadMagic credits are low: *{{ $('Get balance').item.json.credits }}* left.\n"
            "Last 7 days: {{ JSON.stringify($json.summary ?? {}) }}\nTop up at https://app.leadmagic.io",
    "otherOptions": {}})
w.chain("Every morning", "Get balance", "Get 7-day usage", "Below threshold?")
w.connect("Below threshold?", "Alert", output=0)
catalog.append(w.write("A daily check of credit balance and usage that alerts Slack before scheduled workflows run out of credits."))

(OUT / "catalog.json").write_text(json.dumps(catalog, indent=2) + "\n")
print(f"Wrote {len(catalog)} templates to {OUT}")
