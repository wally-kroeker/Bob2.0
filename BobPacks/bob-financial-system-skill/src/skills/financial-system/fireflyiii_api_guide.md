# Firefly III API Guide for Automated Finance Management

## Overview of Firefly III
Firefly III is a self-hosted personal finance manager that tracks expenses, income, budgets, and more. It uses a double-entry bookkeeping system. Firefly III supports features such as budgeting, tagging, saving goals (piggy banks), and recurring transactions. It provides a RESTful JSON API for programmatic access to nearly all functionalities.

### Key Capabilities:
- Manage accounts (asset, expense, revenue, liabilities)
- Full transaction lifecycle (create, read, update, delete)
- Budget creation and monitoring
- Category and tag organization
- Rule-based transaction automation
- Handle attachments, bills, and recurring transactions
- Generate reports and export data

## API Usage Requirements
- All API calls must include a Personal Access Token (PAT) in the `Authorization: Bearer <TOKEN>` header.
- The base API URL: `https://<your-firefly-instance>/api/v1/`

---

## Accounts
**Endpoints:**
- `GET /accounts` — List accounts
- `GET /accounts/{id}` — Get single account
- `POST /accounts` — Create account
- `PUT /accounts/{id}` — Update account
- `DELETE /accounts/{id}` — Delete account

**Account Types:**
- `asset`
- `expense`
- `revenue`
- `liability`

## Transactions
**Types:**
- `Withdrawal` — Asset to Expense
- `Deposit` — Revenue to Asset
- `Transfer` — Asset to Asset or Asset to Liability

**Endpoints:**
- `GET /transactions` — List all transactions
- `GET /transactions/{id}` — Get specific transaction
- `POST /transactions` — Create transaction
- `PUT /transactions/{id}` — Update transaction
- `DELETE /transactions/{id}` — Delete transaction

**Transaction Payload Example:**
```json
{
  "type": "Withdrawal",
  "date": "2025-12-01",
  "description": "Grocery shopping",
  "transactions": [
    {
      "amount": "50",
      "source_id": 10,
      "destination_id": 20,
      "description": "Groceries",
      "category_id": 5,
      "budget_id": 3
    }
  ]
}
```

---

## Categories & Tags
**Categories:** One per transaction
- `GET /categories`
- `POST /categories`
- `PUT /categories/{id}`
- `DELETE /categories/{id}`

**Tags:** Multiple per transaction
- `GET /tags`
- `POST /tags`
- `PUT /tags/{tag}`
- `DELETE /tags/{tag}`

Use `category_id` and `tags` fields in transaction payloads.

---

## Budgets
**Endpoints:**
- `GET /budgets`
- `POST /budgets`
- `PUT /budgets/{id}`
- `DELETE /budgets/{id}`

**Budget Limits:**
- `GET /budgets/{id}/limits`
- `POST /budgets/{id}/limits`
- `PUT /budgets/{id}/limits/{limitId}`
- `DELETE /budgets/{id}/limits/{limitId}`

Use `budget_id` in transaction payloads.

## Piggy Banks
**Endpoints:**
- `GET /piggy_banks`
- `POST /piggy_banks`
- `PUT /piggy_banks/{id}`
- `DELETE /piggy_banks/{id}`
- `GET /piggy_banks/{id}/events`

Simulate deposits by using transfer transactions with `source_id = destination_id` and `piggy_bank_id` field.

---

## Recurring Transactions
**Endpoints:**
- `GET /recurrences`
- `POST /recurrences`
- `PUT /recurrences/{id}`
- `DELETE /recurrences/{id}`
- `GET /recurrences/{id}/transactions`

Use to define patterns like "Monthly salary on the 1st".

---

## Bills
**Endpoints:**
- `GET /bills`
- `POST /bills`
- `PUT /bills/{id}`
- `DELETE /bills/{id}`
- `GET /bills/{id}/transactions`

Use `bill_id` in transactions to associate.

---

## Rules
**Rule Groups:**
- `GET /rule_groups`
- `POST /rule_groups`
- `PUT /rule_groups/{id}`
- `DELETE /rule_groups/{id}`

**Rules:**
- `GET /rules`
- `POST /rules`
- `PUT /rules/{id}`
- `DELETE /rules/{id}`
- `POST /rules/{id}/trigger` — Force apply rule

Each rule includes triggers (conditions) and actions (e.g., set category).

---

## Reports and Insights
**Endpoints:**
- `GET /summary/basic`
- `GET /insight/expense/category`
- `GET /insight/income/category`
- `GET /insight/expense/budget`
- `GET /insight/expense/tag`

Use date filters to scope reports. Useful for computing budget usage, category spending, etc.

---

## Data Export
**Endpoints:**
- `GET /data/export/accounts`
- `GET /data/export/transactions`
- `GET /data/export/budgets`
- `GET /data/export/tags`
- `GET /data/export/categories`

Use for snapshot backups or external analysis.

---

## Attachments
**Endpoints:**
- `POST /attachments` — Create placeholder
- `POST /attachments/{id}/upload` — Upload file
- `GET /attachments/{id}/download`

---

## Webhooks
**Endpoints:**
- `GET /webhooks`
- `POST /webhooks`
- `PUT /webhooks/{id}`
- `DELETE /webhooks/{id}`

Useful for integrating with external systems that should react to transaction events.

