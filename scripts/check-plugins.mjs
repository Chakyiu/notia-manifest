#!/usr/bin/env node
// Checks community-plugins.json against the plugin repositories it names.
//
//   node scripts/check-plugins.mjs
//
// Every entry must resolve: its repository must have a manifest.json on the
// branch listed, and that manifest's id must be the entry's id (Notia installs
// by that id, so a mismatch breaks the install). The check also lists the
// repositories of each owner and fails when a repository named after a plugin
// holds a manifest whose id is not in the list, so a newly added plugin cannot
// sit outside the catalog unnoticed.
//
// Needs Node 18 or newer; no dependencies. Set GITHUB_TOKEN to list
// repositories above the unauthenticated rate limit (the workflow passes one).

import { readFile } from "node:fs/promises";

const LIST = new URL("../community-plugins.json", import.meta.url);
const RAW = "https://raw.githubusercontent.com";
const API = "https://api.github.com";
const headers = {
  accept: "application/vnd.github+json",
  "user-agent": "notia-manifest-check",
  ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

const failures = [];
const warnings = [];
const fail = (message) => failures.push(message);
const warn = (message) => warnings.push(message);

async function manifest(repo, branch) {
  const res = await fetch(`${RAW}/${repo}/${branch}/manifest.json`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${repo}@${branch}: HTTP ${res.status}`);
  return res.json();
}

async function repositories(owner) {
  const all = [];
  for (let page = 1; ; page++) {
    const res = await fetch(
      `${API}/users/${owner}/repos?per_page=100&page=${page}&type=owner`,
      { headers },
    );
    if (!res.ok) throw new Error(`listing ${owner}'s repositories: HTTP ${res.status}${res.status === 403 ? " (rate limit; set GITHUB_TOKEN)" : ""}`);
    const repos = await res.json();
    all.push(...repos);
    if (repos.length < 100) return all;
  }
}

const entries = JSON.parse(await readFile(LIST, "utf8"));
if (!Array.isArray(entries)) fail("community-plugins.json is not a JSON array");

const ids = new Set();
for (const [index, entry] of (Array.isArray(entries) ? entries : []).entries()) {
  const where = `entry ${index} (${entry?.id ?? "no id"})`;
  for (const field of ["id", "name", "repo"]) {
    if (!entry?.[field]) fail(`${where}: missing "${field}"`);
  }
  if (entry?.id && !/^[A-Za-z0-9_-]+$/.test(entry.id)) {
    fail(`${where}: id may only use letters, digits, dashes, and underscores`);
  }
  if (entry?.repo && !/^[\w.-]+\/[\w.-]+$/.test(entry.repo)) {
    fail(`${where}: repo must be "owner/name"`);
  }
  if (ids.has(entry?.id)) fail(`${where}: duplicate id`);
  ids.add(entry?.id);
}

for (const entry of Array.isArray(entries) ? entries : []) {
  if (!entry?.id || !entry.repo) continue;
  const branch = entry.branch ?? "main";
  const plugin = await manifest(entry.repo, branch);
  if (!plugin) {
    fail(`${entry.id}: ${entry.repo}@${branch} has no manifest.json, so the install would fail`);
    continue;
  }
  if (plugin.id !== entry.id) {
    fail(`${entry.id}: ${entry.repo}'s manifest id is "${plugin.id}", so the install would land under the wrong folder`);
  }
  if (plugin.name && plugin.name !== entry.name) {
    warn(`${entry.id}: name "${entry.name}" differs from the plugin's "${plugin.name}"`);
  }
  if (plugin.description && entry.description && plugin.description !== entry.description) {
    warn(`${entry.id}: description differs from the plugin's own`);
  }
  console.log(`ok   ${entry.id}  ${entry.repo}@${branch}`);
}

for (const owner of new Set((Array.isArray(entries) ? entries : []).map((e) => e?.repo?.split("/")[0]).filter(Boolean))) {
  let repos;
  try {
    repos = await repositories(owner);
  } catch (error) {
    fail(error.message);
    continue;
  }
  for (const repo of repos) {
    if (!repo.name.toLowerCase().startsWith("notia-") || repo.name === "notia-manifest") continue;
    const plugin = await manifest(repo.full_name, repo.default_branch).catch(() => null);
    if (!plugin?.id || ids.has(plugin.id)) continue;
    fail(`unlisted plugin "${plugin.id}" in ${repo.full_name}@${repo.default_branch} — add it to community-plugins.json and to the table in README.md`);
  }
}

for (const message of warnings) console.warn(`warn ${message}`);
for (const message of failures) console.error(`fail ${message}`);
console.log(`\n${ids.size} entries, ${failures.length} failures, ${warnings.length} warnings`);
process.exitCode = failures.length ? 1 : 0;
