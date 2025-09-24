export function setQuality(block) {
    if (block.permutation.getState('twm:refreshSpeed') != 5) {
        block.setPermutation(block.permutation.withState('twm:refreshSpeed', 5))
    }
}

export const refreshSpeed = 5