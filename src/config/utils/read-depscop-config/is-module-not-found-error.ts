/**
 * Type guard to check if an error is a module not found error
 *
 * @param error The error to check
 * @returns True if the error is a module not found error
 */
export const isModuleNotFoundError = (
  error: unknown
): error is NodeJS.ErrnoException => {
  return (
    error instanceof Error &&
    ((error as NodeJS.ErrnoException).code === "ERR_MODULE_NOT_FOUND" ||
      (error as NodeJS.ErrnoException).code === "ENOENT")
  );
};
