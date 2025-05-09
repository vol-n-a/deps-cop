export const isArrayOfArrays = (value: unknown): value is unknown[][] =>
  Array.isArray(value) && value.every(Array.isArray);
