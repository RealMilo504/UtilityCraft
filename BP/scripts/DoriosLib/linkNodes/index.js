// @ts-check

/** Block capability that marks a position as an entity link endpoint. */
export const LINK_NODE_BLOCK_TAG = "dorios:link_node";

/** Prefix used by the current coordinate tag stored on linked entities. */
export const LINK_NODE_TAG_PREFIX = "dorios:link_node:[";

/** @typedef {import("@minecraft/server").Block} Block */
/** @typedef {import("@minecraft/server").Dimension} Dimension */
/** @typedef {import("@minecraft/server").Entity} Entity */
/** @typedef {import("@minecraft/server").Vector3} Vector3 */

/**
 * @typedef {object} ResolvedLinkNode
 * @property {Block} block Physical endpoint used to access the linked entity.
 * @property {Entity} entity Logical owner of the endpoint.
 */

/**
 * Builds the canonical entity tag for one link-node position.
 *
 * @param {Vector3} location
 * @returns {string}
 */
export function createLinkNodeTag(location) {
  const normalized = normalizeLocation(location);
  if (!normalized) throw new TypeError("Link-node location must contain finite coordinates");
  return `${LINK_NODE_TAG_PREFIX}${normalized.x},${normalized.y},${normalized.z}]`;
}

/**
 * Builds the canonical coordinate key used by link-node documents.
 *
 * @param {Vector3} location
 * @returns {string}
 */
export function createLinkNodeKey(location) {
  const normalized = normalizeLocation(location);
  if (!normalized) throw new TypeError("Link-node location must contain finite coordinates");
  return `${normalized.x},${normalized.y},${normalized.z}`;
}

/**
 * Parses one canonical link-node coordinate key.
 *
 * @param {string} key
 * @returns {Vector3|undefined}
 */
export function parseLinkNodeKey(key) {
  if (typeof key !== "string") return undefined;
  const match = /^(-?\d+),(-?\d+),(-?\d+)$/.exec(key);
  if (!match) return undefined;
  const coordinates = match.slice(1).map(Number);
  if (coordinates.some((coordinate) => !Number.isSafeInteger(coordinate))) return undefined;
  return { x: coordinates[0], y: coordinates[1], z: coordinates[2] };
}

/**
 * Parses a canonical link-node tag.
 *
 * @param {string} tag
 * @returns {Vector3|undefined}
 */
export function parseLinkNodeTag(tag) {
  if (typeof tag !== "string") return undefined;
  const match = /^dorios:link_node:\[(-?\d+),(-?\d+),(-?\d+)\]$/.exec(tag);
  if (!match) return undefined;
  const coordinates = match.slice(1).map(Number);
  if (coordinates.length !== 3
    || coordinates.some((coordinate) => !Number.isSafeInteger(coordinate))) return undefined;

  return { x: coordinates[0], y: coordinates[1], z: coordinates[2] };
}

/** @param {Block|undefined} block */
export function isLinkNode(block) {
  try {
    return Boolean(block?.hasTag(LINK_NODE_BLOCK_TAG));
  } catch {
    return false;
  }
}

/**
 * Returns every link-node position currently published by an entity.
 *
 * @param {Entity} entity
 * @returns {Vector3[]}
 */
export function getLinkNodeLocations(entity) {
  if (!entity?.isValid) return [];
  const locations = [];
  const seen = new Set();
  try {
    for (const tag of entity.getTags()) {
      const location = parseLinkNodeTag(tag);
      if (!location) continue;
      const key = `${location.x},${location.y},${location.z}`;
      if (seen.has(key)) continue;
      seen.add(key);
      locations.push(location);
    }
  } catch {
    return [];
  }
  return locations;
}

/**
 * Checks a cached physical-node/logical-entity pair without running a query.
 *
 * @param {Block|undefined} block
 * @param {Entity|undefined} entity
 * @returns {boolean}
 */
export function isLinkedEntity(block, entity) {
  if (!isLinkNode(block) || !entity?.isValid) return false;
  try {
    if (entity.dimension.id !== block.dimension.id) return false;
    return entity.hasTag(createLinkNodeTag(block.location));
  } catch {
    return false;
  }
}

/**
 * Resolves the unique compatible entity represented by a physical link node.
 * Ambiguous links fail closed instead of depending on entity query order.
 *
 * @param {Block} block
 * @param {(entity:Entity)=>boolean} [predicate]
 * @returns {ResolvedLinkNode|undefined}
 */
export function resolveLinkNode(block, predicate = () => true) {
  if (!isLinkNode(block)) return undefined;

  const entities = [];
  try {
    const tag = createLinkNodeTag(block.location);
    for (const entity of block.dimension.getEntities({ tags: [tag] })) {
      if (!entity?.isValid || !predicate(entity)) continue;
      entities.push(entity);
    }
  } catch {
    return undefined;
  }

  if (entities.length !== 1) return undefined;
  return { block, entity: entities[0] };
}

/**
 * Resolves a link node at one world position.
 *
 * @param {Dimension} dimension
 * @param {Vector3} location
 * @param {(entity:Entity)=>boolean} [predicate]
 * @returns {ResolvedLinkNode|undefined}
 */
export function resolveLinkNodeAt(dimension, location, predicate = () => true) {
  if (!dimension) return undefined;
  const normalized = normalizeLocation(location);
  if (!normalized) return undefined;
  try {
    const block = dimension.getBlock(normalized);
    return block ? resolveLinkNode(block, predicate) : undefined;
  } catch {
    return undefined;
  }
}

/** @param {Vector3} location @returns {Vector3|undefined} */
function normalizeLocation(location) {
  if (!location || !Number.isFinite(location.x)
    || !Number.isFinite(location.y) || !Number.isFinite(location.z)) return undefined;
  return {
    x: Math.floor(location.x),
    y: Math.floor(location.y),
    z: Math.floor(location.z),
  };
}

export * from "./io.js";
