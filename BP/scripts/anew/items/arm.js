import { BlockPermutation, world } from '@minecraft/server'

const ARM_OFFHAND_IDS = new Set([
	'utilitycraft:bionic_arm',
])

const FACE_OFFSETS = {
	North: { x: 0, y: 0, z: -1 },
	South: { x: 0, y: 0, z: 1 },
	East: { x: 1, y: 0, z: 0 },
	West: { x: -1, y: 0, z: 0 },
	Up: { x: 0, y: 1, z: 0 },
	Down: { x: 0, y: -1, z: 0 }
}

const MIN_RANGE = 5
const MAX_RANGE = 16

world.afterEvents.itemUse.subscribe(event => {
	const { source, itemStack } = event
	if (!source || source.typeId !== 'minecraft:player') return
	if (!itemStack) return

	const player = source
	const offhand = player.getEquipment?.('Offhand') ?? player.getComponent?.('equippable')?.getEquipment('Offhand')
	if (!offhand || !ARM_OFFHAND_IDS.has(offhand.typeId)) return

	const hit = player.getBlockFromViewDirection({ maxDistance: MAX_RANGE })
	if (!hit?.block) return

	const offset = FACE_OFFSETS[hit.face]
	if (!offset) return

	const distance = DoriosAPI?.math?.distanceBetween
		? DoriosAPI.math.distanceBetween(player.location, hit.block.location)
		: Math.hypot(
			player.location.x - hit.block.location.x,
			player.location.y - hit.block.location.y,
			player.location.z - hit.block.location.z
		)
	if (distance < MIN_RANGE || distance > MAX_RANGE) return

	let permutation
	try {
		permutation = BlockPermutation.resolve(itemStack.typeId)
	} catch {
		return
	}

	const targetPos = {
		x: hit.block.location.x + offset.x,
		y: hit.block.location.y + offset.y,
		z: hit.block.location.z + offset.z
	}

	const dimension = hit.block.dimension
	const targetBlock = dimension.getBlock(targetPos)
	if (!targetBlock) return

	// Abort if target already matches the desired block type
	if (targetBlock.typeId === itemStack.typeId) return

	try {
		targetBlock.setPermutation(permutation)
	} catch {
		return
	}

	const gameMode = player.getGameMode?.()
	const isCreative = player.isInCreative?.() ?? (typeof gameMode === 'string' && gameMode.toLowerCase() === 'creative')
	if (isCreative) return

	const inventoryComp = player.getComponent?.('minecraft:inventory')
	const container = inventoryComp?.container
	if (!container) return

	const slot = player.selectedSlotIndex ?? 0
	const current = container.getItem(slot)

	if (current?.typeId === itemStack.typeId) {
		if (current.amount > 1) {
			current.amount -= 1
			container.setItem(slot, current)
		} else {
			container.setItem(slot, undefined)
		}
		return
	}

	player.removeItem?.(itemStack.typeId, 1)
})
