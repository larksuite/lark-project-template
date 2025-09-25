/**
 * 对分支代码的优化逻辑
 * 仅支持存在判断，即map[key]存在即匹配
 * 匹配失败时，会使用map.default做降级处理
 * @param key 匹配依据
 * @param map 每个分支的处理逻辑，map中必须提供一个属性default做降级处理
 * @returns
 */
export function switchKey<T, K extends keyof any = keyof any>(
  key: K,
  map: Partial<Record<K, () => T>> & Record<'default', () => T>,
): T {
  let cur = (map as Partial<Record<K, () => T>>)[key];
  if (cur) {
    return cur();
  }
  // 这里不再判断default的处理是否存在，认为一定存在
  cur = (map as Record<'default', () => T>).default;
  return cur();
}
