export function setQuality(block) {
    if (block.permutation.getState('utilitycraft:refreshSpeed') != 1) {
        block.setPermutation(block.permutation.withState('utilitycraft:refreshSpeed', 1))
    }
}

export const refreshSpeed = 1