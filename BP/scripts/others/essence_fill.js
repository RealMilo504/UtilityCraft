import { world, ItemStack } from '@minecraft/server'

//Obtains the identifier and capitalizes each word
function capitalize(str) {
    let name = str.split(':')[1]
    let result = name.charAt(0).toUpperCase() + name.slice(1)
    if (result.indexOf('_') == -1) return result

    let temp = result.split('_').map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(' ')
    return temp
}

//Generates a random number between num1 and num2
function randomNumber(num1, num2) {
    return Math.floor(Math.random() * (num2 - num1 + 1)) + num1
}

//Sums a 
function sumKills(str) {
    let num = parseInt(str.split('§r§7  ')[1].split(' %')[0])
    num += randomNumber(1, 5)
    return num
}

function mobName(str) {
    let res = str.split('§r§7  ')[1].toLowerCase()
    res = res.split(' ')
    let len = res.length
    if (len == 2) return 'twm:' + res[1] + '_essence'
    let longRes = 'twm:' + res[1]
    for (let i = 2; i < len; i++) {
        longRes += '_' + res[i]
    }
    return longRes + '_essence'
}

world.afterEvents.entityDie.subscribe(e => {
    const { deadEntity, damageSource } = e

    if (damageSource.damagingEntity == undefined) return
    if (damageSource.damagingEntity.typeId != 'minecraft:player') return

    const player = damageSource.damagingEntity
    const equippable = player.getComponent('equippable')
    const offHand = equippable.getEquipment('Offhand')

    if (offHand != undefined) {
        let offHandItem = offHand.typeId
        if (offHandItem == 'twm:essence_vessel') {
            let mob = offHand.getLore()[0].split(': ')[1]
            if (mob == capitalize(deadEntity.typeId)) {
                let kills = sumKills(offHand.getLore()[1])
                if (kills > 99) {
                    const newEssence = new ItemStack(mobName(offHand.getLore()[0]))
                    player.runCommand(`replaceitem entity @s slot.weapon.offhand 0 ${newEssence.typeId} 1`)
                    return
                }
                player.runCommand(`title @s actionbar ${kills}%`)
                offHand.setLore([
                    `${offHand.getLore()[0]}`,
                    `§r§7  ${kills} %`
                ])
                equippable.setEquipment('Offhand', offHand)

            }
        }
    }
})