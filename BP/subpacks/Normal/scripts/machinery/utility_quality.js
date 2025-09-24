export function setQuality(block) {
    if (block.permutation.getState('utilitycraft:refreshSpeed') != 10) {
        block.setPermutation(block.permutation.withState('utilitycraft:refreshSpeed', 10))
    }
}

export const refreshSpeed = 10