import { Generator, Energy } from '../managers.js'

const BASE_ALTITUDE = 60
const ALTITUDE_BONUS_STEP = 20
const ALTITUDE_PENALTY_STEP = 8
const ALTITUDE_STEP_RATIO = 0.2
const MIN_ALTITUDE = 20
const MAX_ALTITUDE_MULTIPLIER = 4
const WEATHER_MULTIPLIERS = {
    rain: 1.5,
    thunder: 2.25
}

DoriosAPI.register.blockComponent('wind_turbine', {
    /**
     * Initializes the passive generator entity on placement and restores stored energy.
     *
     * @param {import('@minecraft/server').BlockComponentPlayerPlaceBeforeEvent} e
     * @param {{ params: GeneratorSettings }} ctx
     */
    beforeOnPlayerPlace(e, { params: settings }) {
        Generator.spawnGeneratorEntity(e, settings)
    },

    /**
     * Produces energy each tick based on altitude and weather efficiency.
     *
     * @param {import('@minecraft/server').BlockComponentTickEvent} e
     * @param {{ params: GeneratorSettings }} ctx
     */
    onTick(e, { params: settings }) {
        if (!worldLoaded) return

        const { block } = e
        const generator = new Generator(block, settings)
        if (!generator.entity) return

        const { energy } = generator

        const altitude = block.location.y
        const weather = block.dimension.weather ?? 'clear'
        const baseRate = generator.rate
        const altitudeRate = computeAltitudeRate(baseRate, altitude)
        const effectiveRate = applyWeather(altitudeRate, weather)
        const efficiency = baseRate > 0 ? Math.max(0, Math.floor((effectiveRate / baseRate) * 100)) : 0
        const belowMinAltitude = altitude < MIN_ALTITUDE

        if (belowMinAltitude) {
            generator.off()
            generator.displayEnergy()
            generator.energy.transferToNetwork(0)
            generator.setLabel(buildStatusLabel('Low Altitude', 'e', efficiency, energy.getPercent(), energy.cap, 0))
            return
        }

        if (effectiveRate <= 0) {
            generator.off()
            generator.displayEnergy()
            generator.energy.transferToNetwork(0)
            generator.setLabel(buildStatusLabel('Calm Winds', 'e', efficiency, energy.getPercent(), energy.cap, 0))
            return
        }

        if (energy.get() >= energy.cap) {
            generator.off()
            generator.displayEnergy()
            generator.energy.transferToNetwork(0)
            generator.setLabel(buildStatusLabel('Energy Full', 'e', efficiency, energy.getPercent(), energy.cap, 0))
            return
        }

        const produced = Math.min(effectiveRate, energy.getFreeSpace())
        energy.add(produced)
        generator.energy.transferToNetwork(produced * 4)

        generator.on()
        generator.displayEnergy()
        generator.setLabel(buildStatusLabel('Running', 'a', efficiency, energy.getPercent(), energy.cap, produced))
    },

    onPlayerBreak(e) {
        Generator.onDestroy(e)
    }
})

/**
 * Computes the energy production rate after applying altitude bonuses/penalties.
 *
 * @param {number} baseRate
 * @param {number} altitude
 * @returns {number}
 */
function computeAltitudeRate(baseRate, altitude) {
    if (baseRate <= 0 || altitude < MIN_ALTITUDE) return 0

    const bonusSteps = altitude > BASE_ALTITUDE
        ? Math.floor((altitude - BASE_ALTITUDE) / ALTITUDE_BONUS_STEP)
        : 0

    const penaltySteps = altitude < BASE_ALTITUDE
        ? Math.floor((BASE_ALTITUDE - altitude) / ALTITUDE_PENALTY_STEP)
        : 0

    const perStep = Math.max(1, Math.round(baseRate * ALTITUDE_STEP_RATIO))
    const adjusted = baseRate + perStep * (bonusSteps - penaltySteps)
    const capped = Math.min(baseRate * MAX_ALTITUDE_MULTIPLIER, adjusted)
    return Math.max(0, Math.floor(capped))
}

/**
 * Applies weather multiplier to the altitude-adjusted rate.
 *
 * @param {number} rate
 * @param {string} weather
 * @returns {number}
 */
function applyWeather(rate, weather) {
    const multiplier = WEATHER_MULTIPLIERS[weather] ?? 1
    return rate * multiplier
}

/**
 * Builds the inventory label text shown to the player.
 *
 * @param {string} header
 * @param {number} altitude
 * @param {string} weather
 * @param {number} efficiency
 * @param {number} percent
 * @param {number} rate
 * @returns {string}
 */
function buildStatusLabel(status, color, efficiency, percent, cap, transferRate = 0) {
    const clampedEfficiency = Math.max(0, Math.min(360, efficiency))
    const transferText = transferRate > 0 ? Energy.formatEnergyToText(transferRate) : '0 DE'
    const capacityLine = cap ? `\n §r§7Capacity §f${Energy.formatEnergyToText(cap)}` : ''

    return `
§r§${color ?? 'e'}${status}

§r§eInformation
 §r§aEfficiency §f${clampedEfficiency}%%${capacityLine}
 
§r§bEnergy at ${Math.floor(percent)}%%
§r§cRate ${transferText}/t
    `
}

