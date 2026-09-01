// @ts-check

import { isPlainObject } from "../utils/index.js";
import { DIRECTIONS } from "./constants.js";

export const IO_FACE_STATE_PROPERTY = "utilitycraft:io_face_states";
export const IO_FACE_STATE_VERSION = 1;

const RESOURCES = Object.freeze(["items", "liquids", "gases"]);

/** @typedef {"items"|"liquids"|"gases"} IOResource */
/** @typedef {"up"|"down"|"north"|"south"|"east"|"west"} IOFace */

/**
 * Reads the explicitly disabled faces for one IO resource.
 * Missing or legacy state means every otherwise-unconfigured face is default.
 *
 * @param {import("@minecraft/server").Entity} entity
 * @param {IOResource} resource
 * @returns {ReadonlySet<IOFace>}
 */
export function getDisabledIOFaces(entity, resource) {
  if (!RESOURCES.includes(resource)) return new Set();
  const document = readDocument(entity);
  return new Set(document[resource]);
}

/**
 * Returns whether one absolute face is explicitly disabled.
 *
 * @param {import("@minecraft/server").Entity} entity
 * @param {IOResource} resource
 * @param {string} face
 */
export function isIOFaceDisabled(entity, resource, face) {
  return DIRECTIONS.includes(face)
    && getDisabledIOFaces(entity, resource).has(/** @type {IOFace} */ (face));
}

/**
 * Replaces the disabled-face set for one resource without touching the other
 * item, liquid, or gas families stored on the same entity.
 *
 * @param {import("@minecraft/server").Entity} entity
 * @param {IOResource} resource
 * @param {Iterable<string>} faces
 */
export function setDisabledIOFaces(entity, resource, faces) {
  if (!entity?.isValid || !RESOURCES.includes(resource)) return false;

  const document = readDocument(entity);
  document[resource] = normalizeFaces([...faces]);
  writeDocument(entity, document);
  return true;
}

/**
 * Enables or disables one absolute face for one resource family.
 *
 * @param {import("@minecraft/server").Entity} entity
 * @param {IOResource} resource
 * @param {string} face
 * @param {boolean} disabled
 */
export function setIOFaceDisabled(entity, resource, face, disabled) {
  if (!DIRECTIONS.includes(face)) return false;
  const faces = new Set(getDisabledIOFaces(entity, resource));
  if (disabled) faces.add(/** @type {IOFace} */ (face));
  else faces.delete(/** @type {IOFace} */ (face));
  return setDisabledIOFaces(entity, resource, faces);
}

/** @param {import("@minecraft/server").Entity} entity */
function readDocument(entity) {
  const empty = createEmptyDocument();
  if (!entity?.isValid) return empty;

  try {
    const raw = entity.getDynamicProperty(IO_FACE_STATE_PROPERTY);
    if (typeof raw !== "string") return empty;
    const parsed = JSON.parse(raw);
    if (!isPlainObject(parsed) || parsed.version !== IO_FACE_STATE_VERSION) return empty;

    for (const resource of RESOURCES) {
      empty[resource] = normalizeFaces(parsed[resource]);
    }
  } catch {
    return createEmptyDocument();
  }

  return empty;
}

/** @param {import("@minecraft/server").Entity} entity @param {ReturnType<typeof createEmptyDocument>} document */
function writeDocument(entity, document) {
  const hasDisabledFaces = RESOURCES.some((resource) => document[resource].length > 0);
  entity.setDynamicProperty(
    IO_FACE_STATE_PROPERTY,
    hasDisabledFaces ? JSON.stringify(document) : undefined,
  );
}

/** @param {unknown} value @returns {IOFace[]} */
function normalizeFaces(value) {
  if (!Array.isArray(value)) return [];
  const faces = [];
  const seen = new Set();
  for (const face of value) {
    if (!DIRECTIONS.includes(face) || seen.has(face)) continue;
    seen.add(face);
    faces.push(/** @type {IOFace} */ (face));
  }
  return faces;
}

function createEmptyDocument() {
  return {
    version: IO_FACE_STATE_VERSION,
    items: /** @type {IOFace[]} */ ([]),
    liquids: /** @type {IOFace[]} */ ([]),
    gases: /** @type {IOFace[]} */ ([]),
  };
}
