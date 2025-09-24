import { world, ItemStack } from '@minecraft/server'

//To add a new soil you need to add it on the bonsai block first as a state, if the block reduce time growth, its defined in bonus
let soils = [
    { soil: 'minecraft:dirt' },
    { soil: 'minecraft:grass_block', bonus: 10 },
    { soil: 'minecraft:sand' },
    { soil: 'minecraft:red_sand', bonus: 10 },
    { soil: 'minecraft:crimson_nylium' },
    { soil: 'minecraft:warped_nylium' },
    { soil: 'minecraft:soul_sand' },
    { soil: 'minecraft:end_stone' },
    { soil: 'twm:yellow_soil', bonus: 15 },
    { soil: 'twm:red_soil', bonus: 30 },
    { soil: 'twm:blue_soil', bonus: 30, multi: 2 }, // Double loot
    { soil: 'twm:black_soil', bonus: 50, multi: 4 } // Quadruple loot1
]

const specialSoils = ["twm:yellow_soil", "twm:red_soil", "twm:blue_soil", "twm:black_soil"]
// Base time growth of the bonsai
const timeGrowthBase = 60

//Here you neede to add the trees that you wanna add in the next order
//Sapling: the item used to plant the tree on the bonsai
//Allowed: In which of the soils defined previously is this tree supposed to grow on
//Entity: Its the entity it summons that has the appearance of the tree planted
//Loot: The name loot table on the folder 'bonsaiDrops' that the tree uses 
let bonsaiItems = [
    { sapling: 'minecraft:acacia_sapling', allowed: ['dirt', 'grass_block'], entity: 'twm:acacia_tree', loot: 'acacia' },
    { sapling: 'twm:apple_sapling', allowed: ['dirt', 'grass_block'], entity: 'twm:apple_tree', loot: 'apple_tree' },
    { sapling: 'minecraft:bamboo', allowed: ['dirt', 'grass_block'], entity: 'twm:bamboo', loot: 'bamboo' },
    { sapling: 'minecraft:beetroot_seeds', allowed: ['dirt', 'grass_block'], entity: 'twm:beetroot', loot: 'beetroot' },
    { sapling: 'minecraft:birch_sapling', allowed: ['dirt', 'grass_block'], entity: 'twm:birch_tree', loot: 'birch' },
    { sapling: 'minecraft:cactus', allowed: ['sand', 'red_sand'], entity: 'twm:cactus', loot: 'cactus' },
    { sapling: 'minecraft:carrot', allowed: ['dirt', 'grass_block'], entity: 'twm:carrot', loot: 'carrot' },
    { sapling: 'minecraft:cherry_sapling', allowed: ['dirt', 'grass_block'], entity: 'twm:cherry_tree', loot: 'cherry' },
    { sapling: 'minecraft:chorus_fruit', allowed: ['end_stone'], entity: 'twm:chorus_fruit', loot: 'chorus_fruit' },
    { sapling: 'minecraft:crimson_fungus', allowed: ['crimson_nylium'], entity: 'twm:crimson_tree', loot: 'crimson' },
    { sapling: 'minecraft:dark_oak_sapling', allowed: ['dirt', 'grass_block'], entity: 'twm:darkoak_tree', loot: 'darkoak' },
    { sapling: 'minecraft:jungle_sapling', allowed: ['dirt', 'grass_block'], entity: 'twm:jungle_tree', loot: 'jungle' },
    { sapling: 'minecraft:kelp', allowed: ['sand', 'red_sand', 'dirt', 'grass_block'], entity: 'twm:kelp', loot: 'kelp' },
    { sapling: 'minecraft:mangrove_propagule', allowed: ['dirt', 'grass_block'], entity: 'twm:mangrove_tree', loot: 'mangrove' },
    { sapling: 'minecraft:melon_seeds', allowed: ['dirt', 'grass_block'], entity: 'twm:melon', loot: 'melon' },
    { sapling: 'minecraft:red_mushroom', allowed: ['dirt', 'grass_block'], entity: 'twm:mushroom', loot: 'mushroom' },
    { sapling: 'minecraft:brown_mushroom', allowed: ['dirt', 'grass_block'], entity: 'twm:mushroom', loot: 'mushroom' },
    { sapling: 'minecraft:nether_wart', allowed: ['soul_sand'], entity: 'twm:nether_wart', loot: 'nether_wart' },
    { sapling: 'minecraft:oak_sapling', allowed: ['dirt', 'grass_block'], entity: 'twm:oak_tree', loot: 'oak' },
    { sapling: 'minecraft:pale_oak_sapling', allowed: ['dirt', 'grass_block'], entity: 'twm:pale_oak_tree', loot: 'pale_oak' },
    { sapling: 'minecraft:potato', allowed: ['dirt', 'grass_block'], entity: 'twm:potato', loot: 'potato' },
    { sapling: 'minecraft:pumpkin_seeds', allowed: ['dirt', 'grass_block'], entity: 'twm:pumpkin', loot: 'pumpkin' },
    { sapling: 'minecraft:spruce_sapling', allowed: ['dirt', 'grass_block'], entity: 'twm:spruce_tree', loot: 'spruce' },
    { sapling: 'minecraft:sugar_cane', allowed: ['dirt', 'grass_block', 'sand', 'red_sand'], entity: 'twm:sugarcane', loot: 'sugar_cane' },
    { sapling: 'minecraft:sweet_berries', allowed: ['dirt', 'grass_block'], entity: 'twm:sweet_berries', loot: 'sweet_berries' },
    { sapling: 'minecraft:warped_fungus', allowed: ['warped_nylium'], entity: 'twm:warped_tree', loot: 'warped' },
    { sapling: 'minecraft:wheat_seeds', allowed: ['dirt', 'grass_block'], entity: 'twm:wheat', loot: 'wheat' }
]

function randomInterval(min, max) {
    const minCeiled = Math.ceil(min)
    const maxFloored = Math.floor(max)
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

let bonsaiDrops = {
    'acacia': [
        { item: 'minecraft:acacia_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:leaves2', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:acacia_sapling', min: 1, max: 1, prob: 25 }
    ],
    'apple_tree': [
        { item: 'minecraft:log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'twm:apple_sapling', min: 1, max: 1, prob: 25 },
        { item: 'minecraft:apple', min: 1, max: 4, prob: 100 },
        { item: 'minecraft:enchanted_golden_apple', min: 1, max: 1, prob: 0.0001 },
        { item: 'minecraft:golden_apple', min: 1, max: 1, prob: 0.1 }
    ],
    'bamboo': [
        { item: 'minecraft:bamboo', min: 6, max: 12, prob: 100 }
    ],
    'beetroot': [
        { item: 'minecraft:beetroot', min: 2, max: 4, prob: 100 }
    ],
    'birch': [
        { item: 'minecraft:birch_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:birch_leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:birch_sapling', min: 1, max: 1, prob: 25 }
    ],
    'cactus': [
        { item: 'minecraft:cactus', min: 2, max: 4, prob: 100 }
    ],
    'carrot': [
        { item: 'minecraft:carrot', min: 2, max: 4, prob: 100 },
        { item: 'minecraft:golden_carrot', min: 1, max: 1, prob: 0.1 }
    ],
    'cherry': [
        { item: 'minecraft:cherry_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:cherry_leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:cherry_sapling', min: 1, max: 1, prob: 25 }
    ],
    'chorus_fruit': [
        { item: 'minecraft:chorus_fruit', min: 1, max: 2, prob: 100 }
    ],
    'crimson': [
        { item: 'minecraft:crimson_stem', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:nether_wart_block', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:shroomlight', min: 1, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:crimson_fungus', min: 1, max: 1, prob: 25 }
    ],
    'darkoak': [
        { item: 'minecraft:dark_oak_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:dark_oak_leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:dark_oak_sapling', min: 1, max: 1, prob: 25 }
    ],
    'jungle': [
        { item: 'minecraft:jungle_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:jungle_leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:cocoa_beans', min: 1, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:jungle_sapling', min: 1, max: 1, prob: 25 }
    ],
    'kelp': [
        { item: 'minecraft:kelp', min: 4, max: 8, prob: 100 }
    ],
    'mangrove': [
        { item: 'minecraft:mangrove_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:mangrove_leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:mangrove_propagule', min: 1, max: 1, prob: 25 }
    ],
    'melon': [
        { item: 'minecraft:melon_slice', min: 2, max: 4, prob: 100 },
        { item: 'minecraft:melon_block', min: 1, max: 1, prob: 10 }
    ],
    'mushroom': [
        { item: 'minecraft:red_mushroom', min: 2, max: 4, prob: 100 },
        { item: 'minecraft:brown_mushroom', min: 2, max: 4, prob: 100 }
    ],
    'nether_wart': [
        { item: 'minecraft:nether_wart', min: 2, max: 4, prob: 100 }
    ],
    'oak': [
        { item: 'minecraft:log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:oak_sapling', min: 1, max: 1, prob: 25 }
    ],
    'pale_oak': [
        { item: 'minecraft:pale_oak_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:pale_oak_leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:pale_oak_sapling', min: 1, max: 1, prob: 25 }
    ],
    'potato': [
        { item: 'minecraft:potato', min: 2, max: 4, prob: 100 },
        { item: 'minecraft:poisonous_potato', min: 1, max: 1, prob: 10 }
    ],
    'pumpkin': [
        { item: 'minecraft:pumpkin', min: 2, max: 4, prob: 100 },
        { item: 'minecraft:pumpkin_pie', min: 1, max: 1, prob: 0.1 }
    ],
    'spruce': [
        { item: 'minecraft:spruce_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:spruce_leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:spruce_sapling', min: 1, max: 1, prob: 25 }
    ],
    'sugar_cane': [
        { item: 'minecraft:sugar_cane', min: 4, max: 8, prob: 100 }
    ],
    'sweet_berries': [
        { item: 'minecraft:sweet_berries', min: 2, max: 4, prob: 100 }
    ],
    'warped': [
        { item: 'minecraft:warped_stem', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:warped_wart_block', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:shroomlight', min: 1, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:warped_fungus', min: 1, max: 1, prob: 25 }
    ],
    'wheat': [
        { item: 'minecraft:wheat', min: 2, max: 4, prob: 100 },
        { item: 'minecraft:bread', min: 1, max: 1, prob: 0.1 }
    ]

}

//Borrar!!!!!!!!!!!!!!
function msg(message) {
    world.sendMessage(`${message}`)
}

function tellPerms(block) {
    msg('soil: ' + block.permutation.getState('twm:soil'))
    msg('sapling: ' + block.permutation.getState('twm:hasBonsai'))
    msg('farmed: ' + block.permutation.getState('twm:isFarm'))
}
//Borrar!!!!!!!!!!!!!!

//This function makes the code a little bit cleaner by allowing to set the state in a simpler manner
function setState(block, state, perm) {
    block.setPermutation(block.permutation.withState(state, perm))
}

//Same as last function this is mostly esthetic and this returns the state you call for a block 
function getState(block, state) {
    return block.permutation.getState(state)
}

//Here inicializes the custom components
world.beforeEvents.worldInitialize.subscribe(e => {
    e.blockComponentRegistry.registerCustomComponent('twm:newBonsais', {
        onPlayerInteract(e) {
            const { player, block } = e
            let { x, y, z } = block.location
            y += 0.172, x += 0.5, z += 0.5
            //Gets the item on the main hand of the player
            let equipment = player.getComponent('equippable')
            let equipmentItem = equipment.getEquipment('Mainhand')

            //If the item is undefined aka the bare hand
            if (player.isSneaking && !equipmentItem) {
                //Gets the entity on top of the block
                const entity = block.dimension.getEntities({ tags: ["bonsai"], maxDistance: 0.1, location: { x, y, z } })[0]
                //If entity is defined it enters
                if (entity) {
                    //Finds the entity on the 'bonsaiItems' array and returns the object
                    //This allows us to remove the sapling on the bonsai and droping it
                    let bonsaiEntity = bonsaiItems.find(item => item.entity == entity.typeId)
                    entity.addTag('despawn')
                    //block.dimension.runCommandAsync(`tag @e[x=${x},y=${y},z=${z},r=0.5] add despawn`)
                    block.dimension.spawnItem(new ItemStack(bonsaiEntity.sapling), { x, y, z })
                }
                if (getState(block, 'twm:soil') != 'empty') {
                    //This functions similar to the one before but this one also removes the soil
                    //on the bonsai
                    block.dimension.spawnItem(new ItemStack(getState(block, 'twm:soil')), { x, y, z })
                    setState(block, 'twm:soil', 'empty')
                    setState(block, "twm:isFarm", false)
                }
                setState(block, "twm:hasBonsai", false)
                setState(block, "twm:isSlimed", false)

                return;
            }

            if (!equipmentItem) return;

            //If the item isnt undefined it gets the id of the item
            let itemId = equipmentItem.typeId

            // Remove the sapling when using shears
            if (itemId == 'minecraft:shears') {
                //Gets the entity on top of the block
                const entity = block.dimension.getEntities({ tags: ["bonsai"], maxDistance: 0.1, location: { x, y, z } })[0]
                //If entity is defined it enters
                if (entity) {
                    //Finds the entity on the 'bonsaiItems' array and returns the object
                    //This allows us to remove the sapling on the bonsai and droping it
                    let bonsaiEntity = bonsaiItems.find(item => item.entity == entity.typeId)
                    entity.addTag('despawn')
                    //block.dimension.runCommandAsync(`tag @e[x=${x},y=${y},z=${z},r=0.5] add despawn`)
                    block.dimension.spawnItem(new ItemStack(bonsaiEntity.sapling), { x, y, z })
                    setState(block, "twm:hasBonsai", false)
                    setState(block, "twm:isSlimed", false)
                    player.playSound('mob.sheep.shear')
                }
                return;
            }
            if (itemId == 'minecraft:slime_ball') {
                const entity = block.dimension.getEntities({ tags: ["bonsai"], maxDistance: 0.1, location: { x, y, z } })[0]
                if (!entity) return;
                setState(block, 'twm:isSlimed', !getState(block, 'twm:isSlimed'))
                if (getState(block, 'twm:isSlimed')) {
                    entity.triggerEvent('normal')
                } else {
                    entity.triggerEvent('small')
                }
            }

            //Checks if the item is any kind of hoe, then gets the unbreaking enchantment level
            //to test if it should damage or not the hoe whenever you make the bonsai 'farmed'
            if (itemId.includes('hoe')) {
                let itemEnchantable = equipmentItem.getComponent('minecraft:enchantable')
                let unbreakingLvl = 0
                if (itemEnchantable.hasEnchantment('unbreaking')) {
                    unbreakingLvl = itemEnchantable.getEnchantment('unbreaking').level
                }
                if (!getState(block, 'twm:isFarm') && getState(block, 'twm:soil') != 'empty') {
                    setState(block, 'twm:isFarm', true)
                    let durability = equipmentItem.getComponent('minecraft:durability')
                    if ((100 / (unbreakingLvl + 1) / 100) >= Math.random()) {
                        if (equipmentItem.hasComponent('minecraft:durability') && durability.damage != durability.maxDurability) {
                            durability.damage = Math.max(durability.damage + 1)
                            equipment.setEquipment('Mainhand', equipmentItem)
                            block.dimension.playSound('step.gravel', { x, y, z })
                        } else if (durability.damage == durability.maxDurability) {
                            equipment.setEquipment('Mainhand')
                            player.playSound('random.break')
                        }
                    }
                }
                return;
            }

            //If the item isnt a hoe it checks if its on the bonsaiItems as a 'sapling' defined previously
            //then if it matches it summons the entity defined on the object where the sapling was found
            //and clears the item on the players hand, it also checks if the bonsai has or not another
            //bonsai by checking the state 'hasBonsai' defined on the block and checks if the bonsai has
            //the allowed soil thats defined on the start
            const bonsai = bonsaiItems.find(item => item.sapling == itemId)
            if (bonsai) {
                if ((specialSoils.includes(getState(block, 'twm:soil')) || bonsai.allowed.includes(getState(block, 'twm:soil').split(':')[1])) && !getState(block, 'twm:hasBonsai')) {
                    setState(block, "twm:hasBonsai", true)
                    const bonsaiEntity = block.dimension.spawnEntity(bonsai.entity, { x, y, z })
                    bonsaiEntity.addTag('bonsai')

                    // block.dimension.runCommandAsync(`tag @e[x=${x},y=${y},z=${z},r=0.5,type=!player] add bonsai`)
                    if (player.getGameMode() != 'creative') {
                        player.runCommand(`clear @s ${bonsai.sapling} 0 1`)
                    }
                }
                return;
            }

            //Same as the last one but with soils, this checks the soils array defined at the start
            const soil = soils.find(block => block.soil == itemId)
            if (soil) {
                let bonsaiSoil = getState(block, 'twm:soil')
                if (!bonsaiSoil) return;
                if (bonsaiSoil == 'empty') {
                    let newSoil = itemId
                    setState(block, 'twm:soil', newSoil)
                    if (player.getGameMode() != 'creative') {
                        player.runCommand(`clear @s ${itemId} 0 1`)
                    }
                }
                return;
            }
        },
        //Every time the function tick on the block executes it executes this
        onTick(e) {
            const { block } = e
            if (getState(block, 'twm:isSlimed')) return;

            let { x, y, z } = block.location
            y += 0.172, x += 0.5, z += 0.5
            const entity = block.dimension.getEntities({ tags: ["bonsai"], maxDistance: 0.1, location: { x, y, z } })[0]
            const soil = soils.find(blockS => blockS.soil == getState(block, 'twm:soil'))


            if (entity) {
                let bonsaiEntity = bonsaiItems.find(enty => enty.entity == entity.typeId)
                if (bonsaiEntity && soil) {
                    let timeGrowth = timeGrowthBase
                    let multi = 1

                    if (soil.bonus) timeGrowth -= soil.bonus
                    if (soil.multi) multi = soil.multi



                    if (!specialSoils.includes(soil.soil)) timeGrowth -= getState(block, 'twm:isFarm') * 10
                    entity.playAnimation(`${'animation.grow_tree_' + timeGrowth}`)


                    y -= 1.172 + 0.25
                    const blockInv = block.below(1).getComponent('minecraft:inventory')?.container;
                    const entityNext = block.dimension.getEntities({
                        families: ["dorios:container"],
                        maxDistance: 0.5,
                        location: { x, y, z }
                    })[0];

                    const entityInv = entityNext?.getComponent('minecraft:inventory')?.container;

                    const drops = bonsaiDrops[bonsaiEntity.loot]

                    const inv = (blockInv) ? blockInv : entityInv

                    drops.forEach(drop => {
                        const randomChance = Math.random() * 100;
                        if (randomChance <= drop.prob) {
                            try {
                                const amount = randomInterval(drop.min, drop.max)
                                inv.addItem(new ItemStack(drop.item, amount * multi))
                            } catch { }
                        }
                    });
                }
            }
        },
        //Checks when the player destroys the bonsai to make it drop the items used
        onPlayerDestroy(e) {
            const { destroyedBlockPermutation, block } = e
            let { x, y, z } = block.location
            y += 0.172, x += 0.5, z += 0.5
            let soil = destroyedBlockPermutation.getState('twm:soil')
            if (soil != 'empty') {
                block.dimension.spawnItem(new ItemStack(soil), { x, y, z })
            }
            let hasBonsai = destroyedBlockPermutation.getState('twm:hasBonsai')
            if (hasBonsai) {
                const entity = block.dimension.getEntities({ tags: ["bonsai"], maxDistance: 0.1, location: { x, y, z } })[0]
                if (entity) {
                    let bonsaiEntity = bonsaiItems.find(enty => enty.entity == entity.typeId)
                    block.dimension.spawnItem(new ItemStack(bonsaiEntity.sapling), { x, y, z })
                }
            }
        }
    })
})