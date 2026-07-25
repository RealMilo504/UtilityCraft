import { EnergyStorage } from "./energyStorage.js";
import { FluidStorage } from "./fluidStorage.js";
import { GasStorage } from "./gasStorage.js";
import * as Constants from "./constants.js";

export const RESOURCE_LORE_MARKERS = Object.freeze({
  energy: "§e§r",
  fluid: "§l§r",
  gas: "§g§r",
});

const MAX_LORE_LINES = 20;
const MAX_LORE_LINE_LENGTH = 50;
const VISIBLE_COLOR = "§7";

function stripFormatting(value) {
  return String(value ?? "").replace(/§./g, "").trim();
}

function formatType(type) {
  return String(type ?? "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function encodeIndex(index) {
  return String(Math.max(0, Math.floor(Number(index) || 0)))
    .split("")
    .map((digit) => `§${digit}`)
    .join("") + "§r";
}

function decodeIndex(line, marker) {
  const remainder = line.slice(marker.length);
  const match = remainder.match(/^((?:§[0-9])+?)§r/);
  if (!match) return { index: 0, content: remainder };

  const digits = [...match[1].matchAll(/§([0-9])/g)]
    .map((entry) => entry[1])
    .join("");
  return {
    index: Number(digits),
    content: remainder.slice(match[0].length),
  };
}

function makeLine(prefix, label, stored, capacity) {
  const withCapacity = `${prefix}${VISIBLE_COLOR}  ${label}: ${stored}/${capacity}`;
  if (withCapacity.length <= MAX_LORE_LINE_LENGTH) return withCapacity;

  const storedOnly = `${prefix}${VISIBLE_COLOR}  ${label}: ${stored}`;
  if (storedOnly.length <= MAX_LORE_LINE_LENGTH) return storedOnly;

  throw new RangeError(`Resource lore line exceeds ${MAX_LORE_LINE_LENGTH} characters: ${stripFormatting(storedOnly)}`);
}

export function buildEnergyLoreLine(amount, cap) {
  return makeLine(
    RESOURCE_LORE_MARKERS.energy,
    "Energy",
    EnergyStorage.formatEnergyToText(amount),
    EnergyStorage.formatEnergyToText(cap),
  );
}

export function buildFluidLoreLine(index, type, amount, cap) {
  const stored = type === "xp"
    ? `${Math.floor(amount)} mB`
    : FluidStorage.formatFluid(amount);
  return makeLine(
    `${RESOURCE_LORE_MARKERS.fluid}${encodeIndex(index)}`,
    formatType(type),
    stored,
    FluidStorage.formatFluid(cap),
  );
}

export function buildGasLoreLine(index, type, amount, cap) {
  return makeLine(
    `${RESOURCE_LORE_MARKERS.gas}${encodeIndex(index)}`,
    `Gas (${formatType(type)})`,
    GasStorage.formatGas(amount),
    GasStorage.formatGas(cap),
  );
}

function hasTypeFamily(entity, family) {
  return entity
    ?.getComponent("minecraft:type_family")
    ?.hasTypeFamily(family) === true;
}

function hasIndexedTypeTag(entity, resource) {
  const pattern = new RegExp(`^${resource}\\d+Type:`);
  return entity?.getTags?.().some((tag) => pattern.test(tag)) === true;
}

/**
 * Serializes every non-empty resource storage on an entity into stack-safe lore.
 * Resource kind and storage index are encoded with invisible formatting codes.
 */
export function createResourceLore(entity, options = {}) {
  const includeEnergy = options.energy !== false;
  const includeFluids = options.fluids
    ?? (hasTypeFamily(entity, "dorios:fluid_container") || hasIndexedTypeTag(entity, "fluid"));
  const includeGases = options.gases
    ?? (hasTypeFamily(entity, "dorios:gas_container") || hasIndexedTypeTag(entity, "gas"));
  const lore = [];

  if (includeEnergy) {
    const energy = new EnergyStorage(entity);
    const amount = energy.get();
    if (amount > 0) lore.push(buildEnergyLoreLine(amount, energy.getCap()));
  }

  if (includeFluids) {
    const count = FluidStorage.getMaxLiquids(entity);
    for (let index = 0; index < count; index++) {
      const fluid = new FluidStorage(entity, index);
      const amount = fluid.get();
      const type = fluid.getType();
      if (amount <= 0 || type === Constants.EMPTY_FLUID_TYPE) continue;
      lore.push(buildFluidLoreLine(index, type, amount, fluid.getCap()));
    }
  }

  if (includeGases) {
    const count = GasStorage.getMaxGases(entity);
    for (let index = 0; index < count; index++) {
      const gas = new GasStorage(entity, index);
      const amount = gas.get();
      const type = gas.getType();
      if (amount <= 0 || type === Constants.EMPTY_GAS_TYPE) continue;
      lore.push(buildGasLoreLine(index, type, amount, gas.getCap()));
    }
  }

  if (lore.length > MAX_LORE_LINES) {
    throw new RangeError(`Resource lore exceeds the ${MAX_LORE_LINES}-line ItemStack limit.`);
  }
  return lore;
}

function setIndexedResource(target, entry) {
  if (!Number.isInteger(entry.index) || entry.index < 0) return;
  if (!entry.type || entry.type === "empty") return;
  if (!Number.isFinite(entry.amount) || entry.amount <= 0) return;
  target.set(entry.index, entry);
}

/**
 * Reads current marked lore and the former single-resource lore format.
 */
export function parseResourceLore(lore) {
  const fluids = new Map();
  const gases = new Map();
  let energy = 0;
  let hasMarkedEnergy = false;

  for (const rawLine of Array.isArray(lore) ? lore : []) {
    const line = String(rawLine ?? "");

    if (line.startsWith(RESOURCE_LORE_MARKERS.energy)) {
      energy = EnergyStorage.getEnergyFromText(line) ?? 0;
      hasMarkedEnergy = true;
      continue;
    }

    if (line.startsWith(RESOURCE_LORE_MARKERS.fluid)) {
      const { index, content } = decodeIndex(line, RESOURCE_LORE_MARKERS.fluid);
      setIndexedResource(fluids, { index, ...FluidStorage.getFluidFromText(content) });
      continue;
    }

    if (line.startsWith(RESOURCE_LORE_MARKERS.gas)) {
      const { index, content } = decodeIndex(line, RESOURCE_LORE_MARKERS.gas);
      setIndexedResource(gases, { index, ...GasStorage.getGasFromText(content) });
      continue;
    }

    const cleaned = stripFormatting(line);
    if (!hasMarkedEnergy && /^Energy\s*:/i.test(cleaned)) {
      energy = EnergyStorage.getEnergyFromText(line) ?? 0;
      continue;
    }

    if (gases.size === 0 && /^Gas\s*\(/i.test(cleaned)) {
      setIndexedResource(gases, { index: 0, ...GasStorage.getGasFromText(line) });
      continue;
    }

    // Legacy fluid lore had no category marker. Requiring a current/capacity
    // separator avoids interpreting unrelated numeric lore as a fluid.
    if (fluids.size === 0 && cleaned.includes("/")) {
      setIndexedResource(fluids, { index: 0, ...FluidStorage.getFluidFromText(line) });
    }
  }

  return {
    energy,
    fluids: [...fluids.values()].sort((a, b) => a.index - b.index),
    gases: [...gases.values()].sort((a, b) => a.index - b.index),
  };
}

export function getResourcesFromItem(item) {
  return parseResourceLore(item?.getLore?.() ?? []);
}

function restoreIndexed(entries, managers) {
  for (const entry of entries) {
    const manager = managers[entry.index];
    if (!manager) continue;
    const cap = manager.getCap();
    const amount = cap > 0 ? Math.min(entry.amount, cap) : 0;
    if (amount <= 0) continue;
    manager.setType(entry.type);
    manager.set(amount);
  }
}

/** Restores a parsed resource snapshot into already initialized managers. */
export function restoreResourceSnapshot(snapshot, managers = {}) {
  const energyManager = managers.energy;
  if (energyManager) {
    const cap = energyManager.getCap();
    const amount = cap > 0 ? Math.min(snapshot?.energy ?? 0, cap) : 0;
    energyManager.set(Math.max(0, amount));
  }

  restoreIndexed(snapshot?.fluids ?? [], managers.fluids ?? []);
  restoreIndexed(snapshot?.gases ?? [], managers.gases ?? []);
}
