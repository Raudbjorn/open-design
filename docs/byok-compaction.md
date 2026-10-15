# Guarded BYOK compaction

Long agent sessions depend on compaction to preserve a usable checkpoint when the model context fills. Some OpenAI-compatible endpoints return an empty answer, unfinished reasoning, tool calls, or a truncated stream instead. An opt-in daemon policy now validates the checkpoint before OpenCode receives it.

The policy applies to UI and CLI runs through the existing BYOK OpenCode launcher. It does not modify saved provider credentials, affect unmatched endpoints/models, or change the default generation limits. It supports OpenAI-compatible **streaming chat completions**, including compatible local endpoints. Native OpenAI Responses, Anthropic, Google and Azure adapters are not covered; a matching profile for an unsupported adapter fails explicitly.

## Enable for one endpoint and model

Create `byok-token-profile.json` inside the daemon's resolved data directory. Use the same model identifier and normalized base URL as the saved provider. Do not put API keys in this file. A trailing slash is ignored; different hosts or paths do not match.

```json
{
  "model": "local-reasoner",
  "baseUrl": "http://127.0.0.1:18020/v1",
  "context": 131072,
  "maxOutput": 65536,
  "summaryOutput": 16384,
  "headroom": 20000,
  "retainRecent": 8192
}
```

These numbers demonstrate the configuration, not a recommendation for every model. Set them to limits the endpoint actually supports. `maxOutput` budgets ordinary generation; `summaryOutput` budgets the separate compaction model alias. `headroom` reserves room before compaction; `retainRecent` controls the recent-history budget.

All budgets must be positive safe integers. The profile must leave a positive trigger budget (`context - maxOutput - headroom`), summary output must fit within headroom, and retained history plus summary output must fit below that trigger. Invalid matching budgets fail before launching a run. Unreadable or malformed JSON is reported rather than silently ignored.

The daemon reads the file for each new run and writes a content-addressed standalone plugin under `<data-dir>/byok-opencode/`. The generated plugin contains no credentials or conversation. Existing credential environment variables remain the source of authentication. Remove the profile to disable the policy for subsequent runs; an already running process retains its launch configuration.

## Behavior

- Ordinary generation retains its tools and response bytes. Content-free progress notices count real content, reasoning, and tool-argument deltas as activity. Empty keepalives do not manufacture progress.
- Compaction disables tool calls and requests a plain-text checkpoint. The full response is withheld until validated, with a 4 MiB response limit.
- Acceptance requires a completed SSE stream, a `stop` finish reason, at least 100 visible characters, no tool calls, and no `<think>` markup. These are structural checks; they cannot prove that the summary retained every important fact.
- One invalid summary triggers one corrective retry. Two invalid summaries produce a non-retryable `invalid_compaction_summary` error instead of accepting an empty checkpoint. Provider HTTP errors and interrupted streams propagate without the extra summary retry.
- The checkpoint prompt preserves the objective, constraints, actual written files, remaining work, next action and any on-disk checklist. It distinguishes completed work from plans.

No global timeout extension is included. A model that stops emitting data is still subject to the existing run timeout policy.

## Compatibility and verification

Validated with OpenCode **1.18.18** using an isolated local HTTP fixture and temporary homes, without real provider credentials or user projects. The tests cover successful compaction, recovery from empty/truncated/tool-calling summaries, and explicit failure after two bad summaries. They also export the resulting session to check original messages and accepted checkpoints.

The host's installed OpenCode **2.0.29** rejects this checkout's existing `run --dir` launch syntax before reaching the plugin. This integration does not migrate the launcher to OpenCode v2. Use a runtime compatible with the current OpenDesign launcher; do not interpret the unit tests as v2 support.

Run focused checks with Node 24:

```sh
pnpm --filter @open-design/daemon exec vitest run -c vitest.config.ts \
  tests/runtimes/byok-opencode.test.ts \
  tests/runtimes/byok-reliability.test.ts \
  tests/runtimes/byok-reliability-plugin.test.ts

OD_TEST_OPENCODE_BIN=/absolute/path/to/opencode \
  pnpm --filter @open-design/daemon exec vitest run -c vitest.config.ts \
  tests/runtimes/byok-reliability-cli.test.ts
```

The real-CLI suite skips unless `OD_TEST_OPENCODE_BIN` is set. It executes that binary, so use a trusted, compatible installation. Synthetic responses verify protocol handling and retained session data; they do not measure summary quality or sustained inference on a real model.

## Provenance

Adapted from [MuhammadHaikal2005/open-design at `0eb41f1c3e5166dc21da0639a126c7520fc04e45`](https://github.com/MuhammadHaikal2005/open-design/tree/0eb41f1c3e5166dc21da0639a126c7520fc04e45), feature Y2 in the fork audit. Integration keeps the explicit runtime data root, preserves defaults for unmatched providers, removes the donor-specific legacy profile filename, limits logged provider fields, and tests the shared daemon launch path. Donor-wide provider settings and timeout changes were not adopted.
