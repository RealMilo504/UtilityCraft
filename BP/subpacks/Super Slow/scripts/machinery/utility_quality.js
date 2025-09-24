export function setQuality(block) {
    if (block.permutation.getState('utilitycraft:refreshSpeed') != 40) {
        block.setPermutation(block.permutation.withState('utilitycraft:refreshSpeed', 40))
    }
}

export const refreshSpeed = 40