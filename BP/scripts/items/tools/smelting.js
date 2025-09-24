// smelting.js
import { world, ItemStack } from '@minecraft/server';

// Prefixes comuns para minérios especiais
const ORE_PREFIXES = [
    'deepslate_',
    'nether_',
    'end_'
];

// Exceções específicas
const EXCEPTIONS = {
    'minecraft:ancient_debris': 'minecraft:netherite_scrap',
    'minecraft:cobblestone': 'minecraft:stone',
    'minecraft:cobbled_deepslate': 'minecraft:deepslate'
};

/**
 * Normaliza o nome do minério removendo prefixos comuns
 * @param {string} name
 * @returns {string}
 */
function normalizeOreName(name) {
    for (const prefix of ORE_PREFIXES) {
        if (name.startsWith(prefix)) {
            return name.slice(prefix.length);
        }
    }
    return name;
}

/**
 * Retorna o ID do item que seria obtido após o smelting
 * @param {string} rawId
 * @returns {string|null}
 */
function getSmeltedId(rawId) {
    // Verifica exceções em primeiro lugar
    if (EXCEPTIONS[rawId]) {
        return EXCEPTIONS[rawId];
    }

    if (!rawId.includes(':')) return null;
    const [namespace, name] = rawId.split(':');

    // raw_* (não bloco) → *_ingot
    if (name.startsWith('raw_') && !name.includes('block')) {
        return `${namespace}:${name.replace(/^raw_/, '')}_ingot`;
    }

    // raw_*_block → *_block
    if (name.startsWith('raw_') && name.endsWith('_block')) {
        return `${namespace}:${name.replace(/^raw_/, '')}`;
    }

    // *_ore padrão → *_ingot, incluindo prefixos
    if (name.endsWith('_ore')) {
        let base = name.slice(0, -4); // remove '_ore'
        base = normalizeOreName(base);
        return `${namespace}:${base}_ingot`;
    }

    return null;
}

// Registra o componente customizado quando o mundo inicializa
world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('utilitycraft:smelting', {
        /**
         * Handler chamado ao minerar um bloco
         * @param {{ block, minedBlockPermutation }} e
         */
        onMineBlock({ block, minedBlockPermutation }) {
            const { x, y, z } = block.location;
            const center = { x: x + 0.5, y: y + 0.2, z: z + 0.5 };

            // ID do bloco minerado
            const rawId = minedBlockPermutation.type.id;
            // Determina o ID do item smelted
            const smeltId = getSmeltedId(rawId);
            if (!smeltId) return;

            // Coleta todas as entidades de item próximas
            const drops = block.dimension.getEntities({
                type: 'item',
                maxDistance: 2,
                location: center
            });

            for (const entity of drops) {
                // Obtém o ItemStack
                const itemComp = entity.getComponent('minecraft:item');
                const stack = itemComp?.itemStack;
                if (!stack) continue;

                // Verifica se este item deve ser smelted
                if (getSmeltedId(stack.type.id) !== smeltId) continue;

                const count = stack.amount;
                entity.kill();
                block.dimension.spawnItem(new ItemStack(smeltId, count), center);
            }
        }
    });
});
