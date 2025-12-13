// Helper method to generate section names (A, B, C, ..., Z, AA, AB, ...)
export function generateSectionName(index: number): string {
    let name = '';
    let num = index;

    do {
        name = String.fromCharCode(65 + (num % 26)) + name;
        num = Math.floor(num / 26) - 1;
    } while (num >= 0);

    return name;
}