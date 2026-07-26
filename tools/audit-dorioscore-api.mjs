import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const runtimeEntry = join(projectRoot, "BP", "scripts", "DoriosCore", "index.js");
const declarationEntry = join(projectRoot, "types", "DoriosCore", "index.d.ts");
const inventoryPath = join(projectRoot, "types", "DoriosCore", "API_INVENTORY.md");

function resolveModule(fromFile, specifier) {
  if (!specifier.startsWith(".")) return undefined;
  const candidate = resolve(dirname(fromFile), specifier);
  if (existsSync(candidate)) return candidate;
  if (existsSync(`${candidate}.js`)) return `${candidate}.js`;
  return undefined;
}

function collectRuntimeExports(filePath, visited = new Set()) {
  const normalizedPath = resolve(filePath);
  if (visited.has(normalizedPath)) return new Map();
  visited.add(normalizedPath);

  const exports = new Map();
  const source = readFileSync(normalizedPath, "utf8");
  const add = (name, kind, origin = normalizedPath) => exports.set(name, { kind, origin });

  for (const match of source.matchAll(/export\s+\*\s+from\s+["']([^"']+)["']/g)) {
    const modulePath = resolveModule(normalizedPath, match[1]);
    if (!modulePath) continue;
    for (const [name, data] of collectRuntimeExports(modulePath, visited)) exports.set(name, data);
  }

  for (const match of source.matchAll(/export\s*\{([\s\S]*?)\}\s*from\s*["']([^"']+)["']/g)) {
    const modulePath = resolveModule(normalizedPath, match[2]);
    for (const rawSpecifier of match[1].split(",")) {
      const specifier = rawSpecifier.trim();
      if (!specifier) continue;
      const parts = specifier.split(/\s+as\s+/);
      add(parts.at(-1), "re-export", modulePath ?? normalizedPath);
    }
  }

  for (const match of source.matchAll(/^export\s+(?:async\s+)?(class|function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm)) {
    add(match[2], match[1] === "class" ? "class" : match[1] === "function" ? "function" : "variable");
  }

  return exports;
}

function collectDeclarationRuntimeExports(filePath) {
  const exports = new Map();
  const source = readFileSync(filePath, "utf8");
  for (const match of source.matchAll(/^export\s+(?:declare\s+)?(class|function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm)) {
    exports.set(match[2], match[1] === "class" ? "class" : match[1] === "function" ? "function" : "variable");
  }
  return exports;
}

function collectDeclarationTypeExports(filePath) {
  const source = readFileSync(filePath, "utf8");
  return new Set(
    [...source.matchAll(/^export\s+(?:interface|type)\s+([A-Za-z_$][\w$]*)/gm)]
      .map((match) => match[1]),
  );
}

function collectInventoryNames(source, marker) {
  const start = `<!-- ${marker}:start -->`;
  const end = `<!-- ${marker}:end -->`;
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end);
  if (startIndex < 0 || endIndex < startIndex) return [];
  const section = source.slice(startIndex + start.length, endIndex);
  return [...section.matchAll(/`([A-Za-z_$][\w$]*)`/g)].map((match) => match[1]);
}

function compareInventory(expected, listed) {
  const listedSet = new Set(listed);
  return {
    duplicates: [...new Set(listed.filter((name, index) => listed.indexOf(name) !== index))].sort(),
    missing: [...expected].filter((name) => !listedSet.has(name)).sort(),
    stale: [...listedSet].filter((name) => !expected.has(name)).sort(),
  };
}

const runtimeExports = collectRuntimeExports(runtimeEntry);
const declarationExports = collectDeclarationRuntimeExports(declarationEntry);
const declarationTypeExports = collectDeclarationTypeExports(declarationEntry);
const missingDeclarations = [...runtimeExports.keys()].filter((name) => !declarationExports.has(name)).sort();
const staleDeclarations = [...declarationExports.keys()].filter((name) => !runtimeExports.has(name)).sort();
const inventory = readFileSync(inventoryPath, "utf8");
const runtimeInventory = compareInventory(new Set(runtimeExports.keys()), collectInventoryNames(inventory, "runtime-exports"));
const typeInventory = compareInventory(declarationTypeExports, collectInventoryNames(inventory, "type-exports"));

console.log(`Runtime exports: ${runtimeExports.size}`);
console.log(`Declared runtime exports: ${declarationExports.size}`);
console.log(`Declared type-only exports: ${declarationTypeExports.size}`);
if (process.argv.includes("--list")) {
  for (const [name, data] of [...runtimeExports].sort(([left], [right]) => left.localeCompare(right))) {
    const origin = data.origin.slice(projectRoot.length + 1).replaceAll("\\", "/");
    console.log(`${name}\t${data.kind}\t${origin}`);
  }
}
if (missingDeclarations.length) console.log(`Missing declarations:\n${missingDeclarations.join("\n")}`);
if (staleDeclarations.length) console.log(`Stale declarations:\n${staleDeclarations.join("\n")}`);
for (const [label, result] of [["runtime inventory", runtimeInventory], ["type inventory", typeInventory]]) {
  if (result.missing.length) console.log(`Missing ${label} names:\n${result.missing.join("\n")}`);
  if (result.stale.length) console.log(`Stale ${label} names:\n${result.stale.join("\n")}`);
  if (result.duplicates.length) console.log(`Duplicate ${label} names:\n${result.duplicates.join("\n")}`);
}

if (
  missingDeclarations.length
  || staleDeclarations.length
  || runtimeInventory.missing.length
  || runtimeInventory.stale.length
  || runtimeInventory.duplicates.length
  || typeInventory.missing.length
  || typeInventory.stale.length
  || typeInventory.duplicates.length
) process.exitCode = 1;
