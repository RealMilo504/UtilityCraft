// @ts-check

import { ModalFormData } from "@minecraft/server-ui";
import {
  getLinkNodeIOOverride,
  resolveLinkNode,
  setLinkNodeIO,
} from "../../DoriosLib/linkNodes/index.js";
import { isPlainObject } from "../../DoriosLib/utils/index.js";
import { FluidStorage } from "../machinery/fluidStorage.js";
import { GasStorage } from "../machinery/gasStorage.js";
import { tryGetBlockFromEntity } from "../utils/entity.js";
import { registerIOInterface } from "./IOInterface.js";

const RESOURCE_METADATA = {
  items: {
    tag: "dorios:item",
    title: "Items",
    anyInput: "anyInputSlots",
    anyOutput: "anyOutputSlots",
    modeInput: "inputSlots",
    modeOutput: "outputSlots",
  },
  liquids: {
    tag: "dorios:fluid",
    title: "Liquids",
    anyInput: "anyInputIndices",
    anyOutput: "anyOutputIndices",
    modeInput: "inputIndices",
    modeOutput: "outputIndices",
  },
  gases: {
    tag: "dorios:gas",
    title: "Gases",
    anyInput: "anyInputIndices",
    anyOutput: "anyOutputIndices",
    modeInput: "inputIndices",
    modeOutput: "outputIndices",
  },
};

/** @typedef {"items"|"liquids"|"gases"} LinkNodeResource */
/** @typedef {{id:string,label:string,color:string,values:number[]}} LinkNodeIOGroup */
/** @typedef {{anyInput:number[],anyOutput:number[],inputs:LinkNodeIOGroup[],outputs:LinkNodeIOGroup[]}} LinkNodeResourceDefinition */
/** @typedef {Partial<Record<LinkNodeResource,LinkNodeResourceDefinition>>} LinkNodeIODefinition */

/** @type {Map<string, LinkNodeIODefinition>} */
const definitions = new Map();

/**
 * Registers the logical groups exposed by link nodes for one machine block.
 * The same declaration also installs the machine's face-independent defaults
 * in the ordinary item/liquid/gas IO backend.
 *
 * @param {string} blockTypeId
 * @param {unknown} value
 */
export function registerLinkNodeIO(blockTypeId, value) {
  if (typeof blockTypeId !== "string" || blockTypeId.length === 0) {
    throw new TypeError("blockTypeId must be a non-empty string");
  }
  if (!isPlainObject(value)) throw new TypeError("Link-node IO definition must be an object");

  /** @type {LinkNodeIODefinition} */
  const definition = {};
  const backend = {};
  for (const resource of Object.keys(RESOURCE_METADATA)) {
    if (!Object.prototype.hasOwnProperty.call(value, resource)) continue;
    const normalized = normalizeResourceDefinition(value[resource], resource);
    definition[resource] = normalized;
    backend[resource] = createBackendDefinition(resource, normalized);
  }
  if (Object.keys(definition).length === 0) {
    throw new TypeError("Link-node IO definition must declare at least one resource");
  }

  registerIOInterface(blockTypeId, backend);
  definitions.set(blockTypeId, cloneDefinition(definition));
  return true;
}

/** @param {string} blockTypeId @returns {LinkNodeIODefinition|undefined} */
export function getLinkNodeIODefinition(blockTypeId) {
  const definition = definitions.get(blockTypeId);
  return definition ? cloneDefinition(definition) : undefined;
}

/**
 * Opens the resource-specific node routing form for one physical link node.
 *
 * @param {import("@minecraft/server").Block} block
 * @param {import("@minecraft/server").Player} player
 */
export async function openLinkNodeIOForm(block, player) {
  const linked = resolveLinkNode(block);
  if (!linked) {
    showMessage(player, "This link node is not connected to one active machine.");
    return false;
  }

  const controllerBlock = tryGetBlockFromEntity(linked.entity);
  const definition = controllerBlock ? definitions.get(controllerBlock.typeId) : undefined;
  if (!definition) {
    showMessage(player, "This machine does not define link-node IO groups.");
    return false;
  }

  const sections = [];
  for (const resource of Object.keys(RESOURCE_METADATA)) {
    const resourceDefinition = definition[resource];
    const metadata = RESOURCE_METADATA[resource];
    if (!resourceDefinition || !block.hasTag(metadata.tag)) continue;
    sections.push({ resource, definition: resourceDefinition, metadata });
  }
  if (sections.length === 0) {
    showMessage(player, "This node has no configurable IO resource.");
    return false;
  }

  const form = new ModalFormData().title("Link Node IO");
  for (const section of sections) {
    const prefix = sections.length > 1 ? `${section.metadata.title} - ` : "";
    form.dropdown(
      `${prefix}Input to`,
      ["§8Disabled§r", ...section.definition.inputs.map((group) => `${group.color}${group.label}§r`)],
      {
        defaultValueIndex: getSelectedIndex(linked.entity, block.location, section, "input"),
        tooltip: `${section.metadata.title} entering through this node will be routed to the selected input group.`,
      },
    );
    form.dropdown(
      `${prefix}Output from`,
      ["§8Disabled§r", ...section.definition.outputs.map((group) => `${group.color}${group.label}§r`)],
      {
        defaultValueIndex: getSelectedIndex(linked.entity, block.location, section, "output"),
        tooltip: `${section.metadata.title} leaving through this node will be taken from the selected output group.`,
      },
    );
  }
  form.submitButton("Save");

  try {
    const result = await form.show(player);
    if (result.canceled) return false;
    const values = Array.isArray(result.formValues) ? result.formValues : [];
    let cursor = 0;
    for (const section of sections) {
      const inputIndex = normalizeDropdownIndex(values[cursor++]);
      const outputIndex = normalizeDropdownIndex(values[cursor++]);
      const input = inputIndex === 0
        ? []
        : section.definition.inputs[inputIndex - 1]?.values;
      const output = outputIndex === 0
        ? []
        : section.definition.outputs[outputIndex - 1]?.values;
      if (!input || !output) throw new RangeError("Invalid link-node IO selection");

      const capacity = getResourceCapacity(linked.entity, section.resource);
      if (!isWithinCapacity(input, capacity) || !isWithinCapacity(output, capacity)) {
        throw new RangeError(`${section.resource} selection exceeds the machine capacity`);
      }

      setLinkNodeIO(linked.entity, block.location, section.resource, {
        input: arraysEqual(input, section.definition.anyInput) ? null : input,
        output: arraysEqual(output, section.definition.anyOutput) ? null : output,
      });
    }
    showMessage(player, "Link node IO updated.");
    return true;
  } catch (error) {
    console.warn("[DoriosCore:linkNodeIO] Failed to update node IO", error);
    showMessage(player, "Unable to update this link node.");
    return false;
  }
}

/** @param {unknown} value @param {LinkNodeResource} resource */
function normalizeResourceDefinition(value, resource) {
  if (!isPlainObject(value)) throw new TypeError(`${resource} definition must be an object`);
  const metadata = RESOURCE_METADATA[resource];
  const inputs = normalizeGroups(value.inputs, `${resource}.inputs`, "§9");
  const outputs = normalizeGroups(value.outputs, `${resource}.outputs`, "§c");
  const anyInput = normalizeValues(value[metadata.anyInput], `${resource}.${metadata.anyInput}`);
  const anyOutput = normalizeValues(value[metadata.anyOutput], `${resource}.${metadata.anyOutput}`);

  assertDefaultRepresentable(anyInput, inputs, `${resource}.${metadata.anyInput}`);
  assertDefaultRepresentable(anyOutput, outputs, `${resource}.${metadata.anyOutput}`);
  return { anyInput, anyOutput, inputs, outputs };
}

/** @param {unknown} value @param {string} path @param {string} defaultColor @returns {LinkNodeIOGroup[]} */
function normalizeGroups(value, path, defaultColor) {
  if (!Array.isArray(value)) throw new TypeError(`${path} must be an array`);
  const groups = [];
  const ids = new Set();
  const signatures = new Set();
  for (const [index, entry] of value.entries()) {
    if (!isPlainObject(entry)) throw new TypeError(`${path}[${index}] must be an object`);
    if (typeof entry.id !== "string" || entry.id.length === 0 || entry.id === "disabled") {
      throw new TypeError(`${path}[${index}].id must be a valid non-empty ID`);
    }
    if (ids.has(entry.id)) throw new RangeError(`${path} contains duplicate ID ${entry.id}`);
    if (entry.color !== undefined && (typeof entry.color !== "string" || !/^§[0-9a-v]$/.test(entry.color))) {
      throw new TypeError(`${path}[${index}].color must be one Minecraft color code`);
    }
    const values = normalizeValues(entry.slots ?? entry.indices, `${path}[${index}]`);
    if (values.length === 0) throw new RangeError(`${path}[${index}] cannot be empty`);
    const signature = values.join(",");
    if (signatures.has(signature)) throw new RangeError(`${path} contains duplicate groups`);
    ids.add(entry.id);
    signatures.add(signature);
    groups.push({
      id: entry.id,
      label: typeof entry.label === "string" && entry.label.length > 0 ? entry.label : entry.id,
      color: entry.color ?? defaultColor,
      values,
    });
  }
  return groups;
}

/** @param {unknown} value @param {string} path */
function normalizeValues(value, path) {
  if (!Array.isArray(value)) throw new TypeError(`${path} must contain an array`);
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

/** @param {number[]} fallback @param {LinkNodeIOGroup[]} groups @param {string} path */
function assertDefaultRepresentable(fallback, groups, path) {
  if (fallback.length === 0 || groups.some((group) => arraysEqual(group.values, fallback))) return;
  throw new RangeError(`${path} must be empty or match exactly one declared group`);
}

/** @param {LinkNodeResource} resource @param {LinkNodeResourceDefinition} definition */
function createBackendDefinition(resource, definition) {
  const metadata = RESOURCE_METADATA[resource];
  const modes = [
    ...definition.inputs.map((group) => ({
      id: `link_node_input:${group.id}`,
      [metadata.modeInput]: [...group.values],
    })),
    ...definition.outputs.map((group) => ({
      id: `link_node_output:${group.id}`,
      [metadata.modeOutput]: [...group.values],
    })),
  ];
  return {
    [metadata.anyInput]: [...definition.anyInput],
    [metadata.anyOutput]: [...definition.anyOutput],
    modes,
  };
}

/** @param {import("@minecraft/server").Entity} entity @param {import("@minecraft/server").Vector3} location @param {any} section @param {"input"|"output"} operation */
function getSelectedIndex(entity, location, section, operation) {
  const override = getLinkNodeIOOverride(entity, location, section.resource, operation);
  const fallback = operation === "input" ? section.definition.anyInput : section.definition.anyOutput;
  const values = override ?? fallback;
  if (values.length === 0) return 0;
  const groups = operation === "input" ? section.definition.inputs : section.definition.outputs;
  const index = groups.findIndex((group) => arraysEqual(group.values, values));
  return index < 0 ? 0 : index + 1;
}

/** @param {import("@minecraft/server").Entity} entity @param {LinkNodeResource} resource */
function getResourceCapacity(entity, resource) {
  if (resource === "items") {
    try {
      return entity.getComponent("minecraft:inventory")?.container?.size ?? 0;
    } catch {
      return 0;
    }
  }
  return resource === "liquids"
    ? FluidStorage.getMaxLiquids(entity)
    : GasStorage.getMaxGases(entity);
}

/** @param {ReadonlyArray<number>} values @param {number} capacity */
function isWithinCapacity(values, capacity) {
  return Number.isInteger(capacity) && capacity >= 0
    && values.every((value) => value >= 0 && value < capacity);
}

/** @param {unknown} value */
function normalizeDropdownIndex(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

/** @param {ReadonlyArray<number>} left @param {ReadonlyArray<number>} right */
function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

/** @param {LinkNodeIODefinition} definition @returns {LinkNodeIODefinition} */
function cloneDefinition(definition) {
  const clone = {};
  for (const resource of Object.keys(RESOURCE_METADATA)) {
    const entry = definition[resource];
    if (!entry) continue;
    clone[resource] = {
      anyInput: [...entry.anyInput],
      anyOutput: [...entry.anyOutput],
      inputs: entry.inputs.map(cloneGroup),
      outputs: entry.outputs.map(cloneGroup),
    };
  }
  return clone;
}

/** @param {LinkNodeIOGroup} group */
function cloneGroup(group) {
  return { id: group.id, label: group.label, color: group.color, values: [...group.values] };
}

/** @param {import("@minecraft/server").Player} player @param {string} message */
function showMessage(player, message) {
  try {
    player?.onScreenDisplay?.setActionBar(message);
  } catch {}
}
