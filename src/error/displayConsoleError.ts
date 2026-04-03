export const consoleError = (funtionName: string, error: unknown) => {
  return console.error(`Error at ${funtionName}:`, error);
};
