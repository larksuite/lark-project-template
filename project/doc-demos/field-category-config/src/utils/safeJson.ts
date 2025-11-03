
type SafeJsonStringifyResult<T> = string | undefined;
type SafeJsonParseResult<T = unknown> = T | undefined;
interface ISafeJson {
  stringify: <T>(value: T) => SafeJsonStringifyResult<T>;
  parse:  <T = unknown>(value: string | undefined) => SafeJsonParseResult<T>
}
export const safeJson: ISafeJson = {
  stringify(value) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error(`[safeJsonError]`, error);
      return;
    }
  },
  parse(value: string | undefined) {
    if (!value || typeof value !== "string") return undefined;

    try {
      return JSON.parse(value);
    } catch (error) {
      console.error(`[safeJsonError]`, error);

      return;
    }
  },
};
