import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const runtimeEntry = join(projectRoot, "BP", "scripts", "DoriosLib", "index.js");
const declarationEntry = join(projectRoot, "types", "DoriosLib", "index.d.ts");
const inventoryPath = join(projectRoot, "types", "DoriosLib", "API_INVENTORY.md");

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

  const source = readFileSync(normalizedPath, "utf8");
  const exports = new Map();
  const add = (name, kind, children) => exports.set(name, { kind, children });

  for (const match of source.matchAll(/export\s+\*\s+from\s+["']([^"']+)["']/g)) {
    const modulePath = resolveModule(normalizedPath, match[1]);
    if (!modulePath) continue;
    for (const [name, data] of collectRuntimeExports(modulePath, new Set(visited))) {
      exports.set(name, data);
    }
  }

  for (const match of source.matchAll(/export\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+)["']/g)) {
    const modulePath = resolveModule(normalizedPath, match[2]);
    add(match[1], "namespace", modulePath ? collectRuntimeExports(modulePath, new Set(visited)) : new Map());
  }

  for (const match of source.matchAll(/export\s*\{([\s\S]*?)\}\s*(?:from\s*["']([^"']+)["'])?\s*;/g)) {
    for (const rawSpecifier of match[1].split(",")) {
      const specifier = rawSpecifier.trim();
      if (!specifier) continue;
      const parts = specifier.split(/\s+as\s+/);
      add(parts.at(-1), "re-export");
    }
  }

  for (const match of source.matchAll(/^export\s+(?:async\s+)?(class|function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm)) {
    add(match[2], match[1] === "function" ? "function" : match[1] === "class" ? "class" : "variable");
  }

  return exports;
}

function findMatchingBrace(source, openIndex) {
  let depth = 0;
  for (let index = openIndex; index < source.length; index++) {
    if (source[index] === "{") depth++;
    else if (source[index] === "}" && --depth === 0) return index;
  }
  throw new SyntaxError(`Unclosed declaration block at character ${openIndex}`);
}

function collectNamespaceMembers(body) {
  const members = new Map();
  let depth = 0;
  let offset = 0;

  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (depth === 0) {
      const valueMatch = /^(?:export\s+)?(const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/.exec(trimmed);
      if (valueMatch) members.set(valueMatch[2], { kind: valueMatch[1] === "function" ? "function" : "variable" });

      const namespaceMatch = /^(?:export\s+)?namespace\s+([A-Za-z_$][\w$]*)\s*\{/.exec(trimmed);
      if (namespaceMatch) {
        const lineStart = offset + line.indexOf("namespace");
        const openIndex = body.indexOf("{", lineStart);
        const closeIndex = findMatchingBrace(body, openIndex);
        members.set(namespaceMatch[1], {
          kind: "namespace",
          children: collectNamespaceMembers(body.slice(openIndex + 1, closeIndex)),
        });
      }
    }

    for (const character of line) {
      if (character === "{") depth++;
      else if (character === "}") depth--;
    }
    offset += line.length + 1;
  }

  return members;
}

function collectDeclarationExports(filePath) {
  const source = readFileSync(filePath, "utf8");
  const exports = new Map();

  for (const match of source.matchAll(/^export\s+(const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)) {
    exports.set(match[2], { kind: match[1] === "function" ? "function" : "variable" });
  }

  for (const match of source.matchAll(/^export\s+namespace\s+([A-Za-z_$][\w$]*)\s*\{/gm)) {
    const openIndex = source.indexOf("{", match.index);
    const closeIndex = findMatchingBrace(source, openIndex);
    exports.set(match[1], {
      kind: "namespace",
      children: collectNamespaceMembers(source.slice(openIndex + 1, closeIndex)),
    });
  }

  return exports;
}

function flattenExports(exports, prefix = "") {
  const paths = new Set();
  for (const [name, data] of exports) {
    const path = prefix ? `${prefix}.${name}` : name;
    paths.add(path);
    if (data.children) {
      for (const child of flattenExports(data.children, path)) paths.add(child);
    }
  }
  return paths;
}

function collectTypeExports(source) {
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
  return [...source.slice(startIndex + start.length, endIndex).matchAll(/`([A-Za-z_$][\w$.]*)`/g)]
    .map((match) => match[1]);
}

function compare(expected, actualValues) {
  const actual = new Set(actualValues);
  return {
    duplicates: [...new Set(actualValues.filter((name, index) => actualValues.indexOf(name) !== index))].sort(),
    missing: [...expected].filter((name) => !actual.has(name)).sort(),
    stale: [...actual].filter((name) => !expected.has(name)).sort(),
  };
}

function reportComparison(label, comparison) {
  if (comparison.missing.length) console.log(`Missing ${label}:\n${comparison.missing.join("\n")}`);
  if (comparison.stale.length) console.log(`Stale ${label}:\n${comparison.stale.join("\n")}`);
  if (comparison.duplicates.length) console.log(`Duplicate ${label}:\n${comparison.duplicates.join("\n")}`);
}

const runtimePaths = flattenExports(collectRuntimeExports(runtimeEntry));
const declarationSource = readFileSync(declarationEntry, "utf8");
const declarationPaths = flattenExports(collectDeclarationExports(declarationEntry));
const typeExports = collectTypeExports(declarationSource);
const inventory = readFileSync(inventoryPath, "utf8");

const declarations = compare(runtimePaths, [...declarationPaths]);
const runtimeInventory = compare(runtimePaths, collectInventoryNames(inventory, "runtime-exports"));
const typeInventory = compare(typeExports, collectInventoryNames(inventory, "type-exports"));

console.log(`Runtime API paths: ${runtimePaths.size}`);
console.log(`Declared runtime API paths: ${declarationPaths.size}`);
console.log(`Declared type-only exports: ${typeExports.size}`);

if (process.argv.includes("--list")) {
  for (const path of [...runtimePaths].sort()) console.log(path);
}

reportComparison("declarations", declarations);
reportComparison("runtime inventory paths", runtimeInventory);
reportComparison("type inventory names", typeInventory);

if ([declarations, runtimeInventory, typeInventory].some((result) =>
  result.missing.length || result.stale.length || result.duplicates.length
)) process.exitCode = 1;
