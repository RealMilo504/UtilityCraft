// @ts-check

import * as DoriosContainer from "../../DoriosLib/containers/index.js";

/**
 * Resolves an item container at a world location.
 *
 * DoriosLib owns direct containers and generic link-node indirection. This
 * adapter exposes that resolver through DoriosCore.
 *
 * @param {import("@minecraft/server").Dimension} dimension
 * @param {import("@minecraft/server").Vector3} location
 * @returns {import("../../DoriosLib/containers/index.js").ResolvedContainer|undefined}
 */
export function resolveItemContainerAt(dimension, location) {
  return DoriosContainer.resolveAt(dimension, location);
}
