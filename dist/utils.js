"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArrayFromEnum = exports.getEnumValues = void 0;
exports.enumToPgEnum = enumToPgEnum;
/**
 * Converts an enum to a PostgreSQL enum.
 * @template T - The enum type.
 * @param {T} myEnum - The enum to convert.
 * @returns {[T[keyof T], ...T[keyof T][]]} An array containing the enum values as strings.
 */
function enumToPgEnum(myEnum) {
    return Object.values(myEnum).map((value) => `${value}`);
}
/**
 * Helper function for enum values with strict typing
 * @template T - The enum type.
 * @param {T} enumType - The enum to get the values of.
 * @returns {T['enumValues'][number][]} An array containing the enum values as strings.
 */
const getEnumValues = (enumType) => Array.from(enumType.enumValues);
exports.getEnumValues = getEnumValues;
/**
 * Get the values of an enum as an array.
 * @param enumType - The enum to get the values of.
 * @returns {T[]} An array containing the enum values.
 */
const getArrayFromEnum = (enumType) => {
    return Object.values(enumType);
};
exports.getArrayFromEnum = getArrayFromEnum;
//# sourceMappingURL=utils.js.map