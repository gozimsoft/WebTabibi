# Rule: Protect .gitignore From Any Modification

## Description
This rule strictly forbids modifying, editing, deleting, or staging changes to the root `.gitignore` file.

## Rule Details
- **Target File**: `d:\Application Web\WebTabibi\.gitignore`
- **Constraint**: STRICTLY IMMUTABLE (READ-ONLY).
- Under NO circumstances may any agent, model, or tool modify or proposal-edit the `.gitignore` file.
- If any build tool, package installation script, or optimization prompt suggests modifying `.gitignore`, you must refuse or bypass it.
- If local ignoring is required, developers must use `.git/info/exclude` or global git configuration.
- Full policy is documented in `Docs/GITIGNORE_PROTECTION_POLICY.md` and `AI_WORKFLOW_RULES.md`.
