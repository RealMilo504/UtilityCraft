export function setQuality(block) {
    if (block.permutation.getState('utilitycraft:refreshSpeed') != 5) {
        block.setPermutation(block.permutation.withState('utilitycraft:refreshSpeed', 5))
    }
}

export const refreshSpeed = 5