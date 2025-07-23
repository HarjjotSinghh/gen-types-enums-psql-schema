/**
 * Converts an enum to a PostgreSQL enum.
 * @template T - The enum type.
 * @param {T} myEnum - The enum to convert.
 * @returns {[T[keyof T], ...T[keyof T][]]} An array containing the enum values as strings.
 */
export function enumToPgEnum(myEnum) {
    return Object.values(myEnum).map((value) => `${value}`);
}
/**
 * Helper function for enum values with strict typing
 * @template T - The enum type.
 * @param {T} enumType - The enum to get the values of.
 * @returns {T['enumValues'][number][]} An array containing the enum values as strings.
 */
export const getEnumValues = (enumType) => Array.from(enumType.enumValues);
/**
 * Get the values of an enum as an array.
 * @param enumType - The enum to get the values of.
 * @returns {T[]} An array containing the enum values.
 */
export const getArrayFromEnum = (enumType) => {
    return Object.values(enumType);
};
//# sourceMappingURL=utils.js.map