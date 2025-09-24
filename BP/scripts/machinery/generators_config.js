export const tierMultis = {
    basic: 1, advanced: 4, expert: 16, ultimate: 100
}

const solidFuels = [
    { id: 'compressed_coal_block_4', de: 800000000 },
    { id: 'compressed_coal_block_3', de: 80000000 },
    { id: 'compressed_coal_block_2', de: 8000000 },
    { id: 'compressed_coal_block', de: 800000 },
    { id: 'coal_block', de: 80000 },
    { id: 'coal', de: 8000 },
    { id: 'charcoal', de: 8000 },
    { id: 'plank', de: 1500 },
    { id: 'stair', de: 1500 },
    { id: 'fence', de: 1500 },
    { id: 'stick', de: 500 },
    { id: 'door', de: 1000 },
    { id: 'ladder', de: 750 },
    { id: 'scaffolding', de: 250 },
    { id: 'log', de: 1500 },
    { id: '_wood', de: 1500 },
    { id: 'stem', de: 1500 },
    { id: 'hyphae', de: 1500 },
    { id: 'sapling', de: 500 },
    { id: 'dried_kelp_block', de: 20000 },
    { id: 'lava_ball', de: 100000 },
    { id: 'blaze_rod', de: 12000 },
    { id: 'boat', de: 6000 },
    { id: 'button', de: 500 },
    { id: 'wooden', de: 1000 },
    { id: 'banner', de: 1500 },
    { id: 'chest', de: 3000 },
    { id: 'leaves', de: 500 }
]

export const battery = { burnSpeedBase: 100, energyCapBase: 256000, nameTag: 'entity.twm:battery.name', entity: 'twm:battery' }
export const furnator = { burnSpeedBase: 40, energyCapBase: 64000, nameTag: 'entity.twm:furnator.name', entity: 'twm:furnator', fuels: solidFuels }
export const magmator = { burnSpeedBase: 50, energyCapBase: 80000, liquidCapBase: 8000, nameTag: 'entity.twm:magmator.name', entity: 'twm:magmator' }
export const solarPanel = { burnSpeedBase: 8, energyCapBase: 25600, nameTag: 'entity.twm:solar_panel.name', entity: 'twm:solar_panel' }
export const thermoGen = { burnSpeedBase: 20, energyCapBase: 32000, liquidCapBase: 2000, nameTag: 'entity.twm:thermo_generator.name', entity: 'twm:thermo_generator' }

export const heatSources = {
    'twm:blaze_block': 1.5,
    'minecraft:lava': 1,
    'minecraft:flowing_lava': 1,
    'minecraft:soul_fire': 0.75,
    'minecraft:soul_torch': 0.75,
    'minecraft:soul_campfire': 0.75,
    'minecraft:fire': 0.5,
    'minecraft:campfire': 0.5,
    'minecraft:magma': 0.5,
    'minecraft:torch': 0.25
}

export const itemLiquidContainers = {
    'minecraft:lava_bucket': { amount: 1000, type: 'lava', output: 'minecraft:bucket' },
    'twm:lava_ball': { amount: 1000, type: 'lava' },
    'minecraft:water_bucket': { amount: 1000, type: 'water', output: 'minecraft:bucket' },
    'twm:water_ball': { amount: 1000, type: 'water' }
}