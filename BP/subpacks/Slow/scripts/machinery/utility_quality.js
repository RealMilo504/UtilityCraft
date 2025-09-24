export function setQuality(block) {
    if (block.permutation.getState('twm:refreshSpeed') != 20) {
        block.setPermutation(block.permutation.withState('twm:refreshSpeed', 20))
    }
}

export const refreshSpeed = 20