// @ts-check

import { system, world } from "@minecraft/server";
import { IO_CONFIG_PROPERTY } from "../containers/constants.js";
import { isPlainObject } from "../utils/index.js";
import {
  createLinkNodeKey,
  createLinkNodeTag,
  parseLinkNodeKey,
} from "./index.js";

export const LINK_NODE_IO_CONFIG_KEY = "linkNodes";
export const LINK_NODE_IO_VERSION = 1;
export const LINK_NODE_IO_EVENT_NAMESPACE = "dorios_link_node";
export const SET_LINK_NODE_IO_EVENT_ID = `${LINK_NODE_IO_EVENT_NAMESPACE}:set_io`;

const RESOURCES = ["items", "liquids", "gases"];
const PROPERTY_NAMES = {
  items: { input: "inputSlots", output: "outputSlots" },
  liquids: { input: "inputIndices", output: "outputIndices" },
  gases: { input: "inputIndices", output: "outputIndices" },
};
const EMPTY_ACCESS = [];

/** @typedef {"items"|"liquids"|"gases"} LinkNodeIOResource */
/** @typedef {"input"|"output"} LinkNodeIOOperation */
/** @typedef {{input: number[]|null, output: number[]|null}} LinkNodeIOSelection */
/** @typedef {{version:1,entries:Record<string,Record<string,Record<string,number[]>>>}} LinkNodeIODocument */
/** @typedef {{status:"absent"|"configured"|"invalid",revision:number,document?:LinkNodeIODocument}} LinkNodeIOCacheEntry */

/** @type {Map<string, LinkNodeIOCacheEntry>} */
const documentCache = new Map();
let nextRevision = 1;
let initialized = false;
let scriptEventListener;
let entityRemoveListener;

/** Installs the shared link-node IO update protocol. */
export function initializeLinkNodeIO() {
  if (initialized) return false;

  scriptEventListener = onScriptEvent;
  entityRemoveListener = ({ removedEntityId }) => documentCache.delete(removedEntityId);

  let scriptEventSubscribed = false;
  let entityRemoveSubscribed = false;
  try {
    system.afterEvents.scriptEventReceive.subscribe(scriptEventListener, {
      namespaces: [LINK_NODE_IO_EVENT_NAMESPACE],
    });
    scriptEventSubscribed = true;
    world.afterEvents.entityRemove.subscribe(entityRemoveListener);
    entityRemoveSubscribed = true;
  } catch (error) {
    if (scriptEventSubscribed) system.afterEvents.scriptEventReceive.unsubscribe(scriptEventListener);
    if (entityRemoveSubscribed) world.afterEvents.entityRemove.unsubscribe(entityRemoveListener);
    scriptEventListener = undefined;
    entityRemoveListener = undefined;
    throw error;
  }

  initialized = true;
  return true;
}

/** Removes the shared listeners and clears the local cache. */
export function shutdownLinkNodeIO() {
  if (!initialized) return false;
  system.afterEvents.scriptEventReceive.unsubscribe(scriptEventListener);
  world.afterEvents.entityRemove.unsubscribe(entityRemoveListener);
  scriptEventListener = undefined;
  entityRemoveListener = undefined;
  documentCache.clear();
  initialized = false;
  return true;
}

/** @returns {boolean} */
export function isLinkNodeIOInitialized() {
  return initialized;
}

/**
 * Returns one explicit access override. `undefined` means the node must use the
 * resource's ordinary no-face fallback. Invalid documents fail closed.
 *
 * @param {import("@minecraft/server").Entity} entity
 * @param {import("@minecraft/server").Vector3} location
 * @param {LinkNodeIOResource} resource
 * @param {LinkNodeIOOperation} operation
 * @returns {ReadonlyArray<number>|undefined}
 */
export function getLinkNodeIOOverride(entity, location, resource, operation) {
  if (!isResource(resource) || !isOperation(operation)) return EMPTY_ACCESS;
  let key;
  try {
    key = createLinkNodeKey(location);
  } catch {
    return EMPTY_ACCESS;
  }

  const entry = resolveCacheEntry(entity);
  if (entry.status === "invalid") return EMPTY_ACCESS;
  if (entry.status !== "configured") return undefined;

  const property = PROPERTY_NAMES[resource][operation];
  return entry.document.entries[key]?.[resource]?.[property];
}

/** Returns a local revision token that changes after each node-IO update. */
export function getLinkNodeIORevision(entity) {
  return resolveCacheEntry(entity).revision;
}

/** Invalidates one entity's parsed node document. */
export function invalidateLinkNodeIO(entityOrId) {
  const id = typeof entityOrId === "string" ? entityOrId : entityOrId?.id;
  return typeof id === "string" ? documentCache.delete(id) : false;
}

/**
 * Publishes complete input/output overrides for one node resource. A `null`
 * branch removes the override and restores the no-face fallback.
 *
 * @param {import("@minecraft/server").Entity} entity
 * @param {import("@minecraft/server").Vector3} location
 * @param {LinkNodeIOResource} resource
 * @param {LinkNodeIOSelection} selection
 */
export function setLinkNodeIO(entity, location, resource, selection) {
  if (!entity?.isValid) throw new TypeError("Link-node owner must be a valid entity");
  const key = createLinkNodeKey(location);
  if (!entity.hasTag(createLinkNodeTag(location))) {
    throw new RangeError(`Entity does not publish link node ${key}`);
  }

  const update = normalizeUpdate({
    version: LINK_NODE_IO_VERSION,
    node: key,
    resource,
    input: selection?.input,
    output: selection?.output,
  });
  entity.runCommand(`scriptevent ${SET_LINK_NODE_IO_EVENT_ID} ${JSON.stringify(update)}`);
  return true;
}

/**
 * Parses and validates a serialized update without applying it. This is also
 * used by network caches that only need the changed physical position.
 *
 * @param {string} message
 */
export function parseLinkNodeIOUpdate(message) {
  if (typeof message !== "string") return undefined;
  try {
    return normalizeUpdate(JSON.parse(message));
  } catch {
    return undefined;
  }
}

/** @param {import("@minecraft/server").ScriptEventCommandMessageAfterEvent} event */
function onScriptEvent(event) {
  if (event.id !== SET_LINK_NODE_IO_EVENT_ID || !event.sourceEntity?.isValid) return;
  try {
    const update = normalizeUpdate(JSON.parse(event.message));
    if (!event.sourceEntity.hasTag(createLinkNodeTag(update.location))) {
      throw new RangeError(`Entity does not publish link node ${update.node}`);
    }
    applyUpdate(event.sourceEntity, update);
  } catch (error) {
    console.warn("[DoriosLib:linkNodes] Ignored invalid IO update", error);
  }
}

/** @param {import("@minecraft/server").Entity} entity @param {ReturnType<typeof normalizeUpdate>} update */
function applyUpdate(entity, update) {
  const root = readRoot(entity);
  let document;
  try {
    document = normalizeDocument(root[LINK_NODE_IO_CONFIG_KEY]);
  } catch {
    document = createEmptyDocument();
  }

  const node = document.entries[update.node] ?? {};
  const resourceConfig = node[update.resource] ?? {};
  const properties = PROPERTY_NAMES[update.resource];

  applySelection(resourceConfig, properties.input, update.input);
  applySelection(resourceConfig, properties.output, update.output);

  if (Object.keys(resourceConfig).length > 0) node[update.resource] = resourceConfig;
  else delete node[update.resource];

  if (Object.keys(node).length > 0) document.entries[update.node] = node;
  else delete document.entries[update.node];

  if (Object.keys(document.entries).length > 0) root[LINK_NODE_IO_CONFIG_KEY] = document;
  else delete root[LINK_NODE_IO_CONFIG_KEY];

  entity.setDynamicProperty(IO_CONFIG_PROPERTY, JSON.stringify(root));
  documentCache.set(entity.id, Object.keys(document.entries).length > 0
    ? { status: "configured", revision: allocateRevision(), document }
    : { status: "absent", revision: allocateRevision() });
}

/** @param {Record<string,number[]>} target @param {string} property @param {number[]|null} value */
function applySelection(target, property, value) {
  if (value === null) delete target[property];
  else target[property] = [...value];
}

/** @param {unknown} value */
function normalizeUpdate(value) {
  if (!isPlainObject(value) || value.version !== LINK_NODE_IO_VERSION) {
    throw new TypeError("Invalid link-node IO update");
  }
  if (!isResource(value.resource)) throw new TypeError("Invalid link-node IO resource");
  const location = parseLinkNodeKey(value.node);
  if (!location) throw new TypeError("Invalid link-node IO coordinate key");
  return {
    version: LINK_NODE_IO_VERSION,
    node: createLinkNodeKey(location),
    location,
    resource: value.resource,
    input: normalizeSelection(value.input, "input"),
    output: normalizeSelection(value.output, "output"),
  };
}

/** @param {unknown} value @param {string} path @returns {number[]|null} */
function normalizeSelection(value, path) {
  if (value === null) return null;
  if (!Array.isArray(value)) throw new TypeError(`${path} must be an array or null`);
  const result = [];
  const seen = new Set();
  for (const index of value) {
    if (!Number.isInteger(index) || index < 0 || index > 255) {
      throw new RangeError(`${path} contains invalid index ${String(index)}`);
    }
    if (seen.has(index)) continue;
    seen.add(index);
    result.push(index);
  }
  return result;
}

/** @param {import("@minecraft/server").Entity} entity @returns {LinkNodeIOCacheEntry} */
function resolveCacheEntry(entity) {
  if (!entity?.isValid || typeof entity.id !== "string") {
    return { status: "invalid", revision: 0 };
  }
  const cached = documentCache.get(entity.id);
  if (cached) return cached;

  const root = readRoot(entity);
  if (!Object.prototype.hasOwnProperty.call(root, LINK_NODE_IO_CONFIG_KEY)) {
    const entry = { status: "absent", revision: allocateRevision() };
    documentCache.set(entity.id, entry);
    return entry;
  }

  try {
    const document = normalizeDocument(root[LINK_NODE_IO_CONFIG_KEY]);
    const entry = { status: "configured", revision: allocateRevision(), document };
    documentCache.set(entity.id, entry);
    return entry;
  } catch {
    const entry = { status: "invalid", revision: allocateRevision() };
    documentCache.set(entity.id, entry);
    return entry;
  }
}

/** @param {unknown} value @returns {LinkNodeIODocument} */
function normalizeDocument(value) {
  if (!isPlainObject(value) || value.version !== LINK_NODE_IO_VERSION || !isPlainObject(value.entries)) {
    throw new TypeError("Invalid link-node IO document");
  }
  const document = createEmptyDocument();
  for (const [rawKey, rawNode] of Object.entries(value.entries)) {
    const location = parseLinkNodeKey(rawKey);
    if (!location || !isPlainObject(rawNode)) throw new TypeError("Invalid link-node entry");
    const key = createLinkNodeKey(location);
    const node = {};
    for (const resource of RESOURCES) {
      if (!Object.prototype.hasOwnProperty.call(rawNode, resource)) continue;
      const rawConfig = rawNode[resource];
      if (!isPlainObject(rawConfig)) throw new TypeError(`Invalid ${resource} node config`);
      const config = {};
      const properties = PROPERTY_NAMES[resource];
      for (const operation of ["input", "output"]) {
        const property = properties[operation];
        if (!Object.prototype.hasOwnProperty.call(rawConfig, property)) continue;
        const selection = normalizeSelection(rawConfig[property], `${resource}.${property}`);
        if (selection === null) throw new TypeError(`${resource}.${property} cannot be null`);
        config[property] = selection;
      }
      if (Object.keys(config).length > 0) node[resource] = config;
    }
    if (Object.keys(node).length > 0) document.entries[key] = node;
  }
  return document;
}

/** @returns {LinkNodeIODocument} */
function createEmptyDocument() {
  return { version: LINK_NODE_IO_VERSION, entries: {} };
}

/** @param {import("@minecraft/server").Entity} entity */
function readRoot(entity) {
  const raw = entity.getDynamicProperty(IO_CONFIG_PROPERTY);
  if (typeof raw !== "string" || raw.length === 0) return {};
  try {
    const value = JSON.parse(raw);
    return isPlainObject(value) ? value : {};
  } catch {
    return {};
  }
}

function allocateRevision() {
  const revision = nextRevision;
  nextRevision = nextRevision >= Number.MAX_SAFE_INTEGER ? 1 : nextRevision + 1;
  return revision;
}

/** @param {unknown} value @returns {value is LinkNodeIOResource} */
function isResource(value) {
  return RESOURCES.includes(value);
}

/** @param {unknown} value @returns {value is LinkNodeIOOperation} */
function isOperation(value) {
  return value === "input" || value === "output";
}
