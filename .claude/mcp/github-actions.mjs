#!/usr/bin/env node
/**
 * MCP Server: GitHub Actions Workflow Tools
 * Tools: trigger_publish, trigger_repull, get_workflow_runs, watch_workflow_run
 */

import { execSync, spawnSync } from "child_process";

const REPO = "bipprojectbali/desa-darmasaba";

// --- MCP Protocol Helpers ---

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

function respond(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function respondError(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

// --- Shell Helper ---

function runCmd(cmd) {
  const r = spawnSync("sh", ["-c", cmd], { encoding: "utf-8" });
  if (r.error) return { ok: false, out: r.error.message };
  if (r.status !== 0) return { ok: false, out: (r.stderr || r.stdout || "").trim() };
  return { ok: true, out: (r.stdout || "").trim() };
}

function getLatestRunId(workflow, delaySecs = 3) {
  const r = runCmd(
    `sleep ${delaySecs} && gh run list --workflow=${workflow} --repo ${REPO} --limit 1 --json databaseId -q '.[0].databaseId'`
  );
  return r.ok ? r.out.trim() : null;
}

// --- Tool Definitions ---

const TOOLS = [
  {
    name: "trigger_publish",
    description:
      "Trigger publish.yml workflow: build & push Docker image to GHCR. Returns run ID.",
    inputSchema: {
      type: "object",
      properties: {
        stack_env: {
          type: "string",
          enum: ["dev", "stg", "prod"],
          description: "Target environment (branch dengan nama ini akan di-checkout)",
        },
        tag: {
          type: "string",
          description: "Image tag, biasanya versi dari package.json (e.g. 0.1.25)",
        },
      },
      required: ["stack_env", "tag"],
    },
  },
  {
    name: "trigger_repull",
    description:
      "Trigger re-pull.yml workflow: redeploy stack di Portainer. Hanya jalankan setelah publish berhasil.",
    inputSchema: {
      type: "object",
      properties: {
        stack_name: {
          type: "string",
          description: "Nama stack (e.g. desa-darmasaba). Stack yang di-deploy: <stack_name>-<stack_env>",
        },
        stack_env: {
          type: "string",
          enum: ["dev", "stg", "prod"],
          description: "Target environment",
        },
      },
      required: ["stack_name", "stack_env"],
    },
  },
  {
    name: "get_workflow_runs",
    description: "List run terbaru dari suatu workflow beserta status dan conclusion-nya.",
    inputSchema: {
      type: "object",
      properties: {
        workflow: {
          type: "string",
          description: "Nama file workflow (e.g. publish.yml, re-pull.yml)",
        },
        limit: {
          type: "number",
          description: "Jumlah run yang ditampilkan (default: 5)",
        },
      },
      required: ["workflow"],
    },
  },
  {
    name: "watch_workflow_run",
    description:
      "Lihat status detail sebuah workflow run: apakah in_progress, success, atau failure.",
    inputSchema: {
      type: "object",
      properties: {
        run_id: {
          type: "number",
          description: "ID workflow run (dapat dari get_workflow_runs)",
        },
      },
      required: ["run_id"],
    },
  },
];

// --- Tool Handlers ---

function handleTriggerPublish(args) {
  const { stack_env, tag } = args;
  const triggerCmd = `gh workflow run publish.yml --repo ${REPO} --ref ${stack_env} -f stack_env=${stack_env} -f tag=${tag}`;
  const r = runCmd(triggerCmd);
  if (!r.ok) return { ok: false, error: r.out };

  const runId = getLatestRunId("publish.yml");
  return {
    ok: true,
    message: `Workflow publish.yml berhasil di-trigger (env=${stack_env}, tag=${tag})`,
    run_id: runId ? Number(runId) : null,
    monitor_hint: runId
      ? `Gunakan watch_workflow_run dengan run_id: ${runId}`
      : "Gunakan get_workflow_runs untuk mendapatkan run_id terbaru",
  };
}

function handleTriggerRepull(args) {
  const { stack_name, stack_env } = args;
  const triggerCmd = `gh workflow run re-pull.yml --repo ${REPO} --ref main -f stack_name=${stack_name} -f stack_env=${stack_env}`;
  const r = runCmd(triggerCmd);
  if (!r.ok) return { ok: false, error: r.out };

  const runId = getLatestRunId("re-pull.yml");
  return {
    ok: true,
    message: `Workflow re-pull.yml berhasil di-trigger (stack=${stack_name}-${stack_env})`,
    run_id: runId ? Number(runId) : null,
    monitor_hint: runId
      ? `Gunakan watch_workflow_run dengan run_id: ${runId}`
      : "Gunakan get_workflow_runs untuk mendapatkan run_id terbaru",
  };
}

function handleGetWorkflowRuns(args) {
  const limit = args.limit || 5;
  const r = runCmd(
    `gh run list --workflow=${args.workflow} --repo ${REPO} --limit ${limit} --json databaseId,status,conclusion,displayTitle,createdAt,headBranch`
  );
  if (!r.ok) return { ok: false, error: r.out };
  try {
    return { ok: true, runs: JSON.parse(r.out) };
  } catch {
    return { ok: false, error: "Gagal parse output", raw: r.out };
  }
}

function handleWatchWorkflowRun(args) {
  const r = runCmd(
    `gh run view ${args.run_id} --repo ${REPO} --json status,conclusion,displayTitle,headBranch,createdAt,updatedAt,jobs`
  );
  if (!r.ok) return { ok: false, error: r.out };
  try {
    const data = JSON.parse(r.out);
    return {
      ok: true,
      run_id: args.run_id,
      status: data.status,
      conclusion: data.conclusion,
      title: data.displayTitle,
      branch: data.headBranch,
      jobs: (data.jobs || []).map((j) => ({
        name: j.name,
        status: j.status,
        conclusion: j.conclusion,
      })),
    };
  } catch {
    return { ok: false, error: "Gagal parse output", raw: r.out };
  }
}

// --- Request Router ---

function handleMessage(msg) {
  const { id, method, params } = msg;

  if (method === "initialize") {
    respond(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "github-actions", version: "1.0.0" },
    });
    return;
  }

  if (method === "notifications/initialized") return;

  if (method === "ping") {
    respond(id, {});
    return;
  }

  if (method === "tools/list") {
    respond(id, { tools: TOOLS });
    return;
  }

  if (method === "tools/call") {
    const { name, arguments: args = {} } = params;
    let result;

    if (name === "trigger_publish") result = handleTriggerPublish(args);
    else if (name === "trigger_repull") result = handleTriggerRepull(args);
    else if (name === "get_workflow_runs") result = handleGetWorkflowRuns(args);
    else if (name === "watch_workflow_run") result = handleWatchWorkflowRun(args);
    else {
      respondError(id, -32601, `Tool tidak ditemukan: ${name}`);
      return;
    }

    respond(id, {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    });
    return;
  }

  respondError(id, -32601, `Method tidak dikenal: ${method}`);
}

// --- Stdin Loop ---

let buf = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => {
  buf += chunk;
  const lines = buf.split("\n");
  buf = lines.pop();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      handleMessage(JSON.parse(trimmed));
    } catch {
      // ignore malformed JSON
    }
  }
});
