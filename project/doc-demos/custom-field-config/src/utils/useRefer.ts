import { useRef } from 'react';

/**
 * 父组件通过refer向子组件索取信息
 * @returns
 */
export function useRefer<T extends Record<string, any>>() {
  const referRef = useRef<T>({} as any);
  return referRef.current;
}
