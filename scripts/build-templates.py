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
TESTED = "n8n 2.47 and n8n-nodes-leadmagic 1.7.0"
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

(OUT / "catalog.json").write_text(json.dumps(catalog, indent=2) + "\n")
print(f"Wrote {len(catalog)} templates to {OUT}")
