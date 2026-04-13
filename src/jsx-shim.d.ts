// Global ambient declarations
declare namespace React {
    export type ChangeEvent<T = any> = { target: T & { value: string; checked: boolean } };
    export type MouseEvent<T = any> = { preventDefault(): void; target: any };
    export type FormEvent<T = any> = { preventDefault(): void; target: any };
    export type ReactNode = any;
    export type ReactElement<P = any, T = any> = any;
    export interface CSSProperties { [key: string]: any }
    
    export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
    export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
    export function useRef<T>(initialValue: T | null): { current: T | null };
    export function useMemo<T>(factory: () => T, deps: any[] | undefined): T;
    export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
    export function createPortal(children: any, container: any): any;
}

declare namespace JSX {
    interface IntrinsicElements {
        [elem: string]: any;
    }
}

// Module-level shims
declare module 'react' {
   export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
   export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
   export function useRef<T>(initialValue: T | null): { current: T | null };
   export function useMemo<T>(factory: () => T, deps: any[] | undefined): T;
   export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
   export type ReactNode = any;
   export type ReactElement<P = any, T = any> = any;
   export const version: string;
   const React: {
      useState: typeof useState;
      useEffect: typeof useEffect;
      useRef: typeof useRef;
      useMemo: typeof useMemo;
      useCallback: typeof useCallback;
      version: string;
   };
   export default React;
}

declare module 'react-dom' {
    export function createPortal(children: any, container: any): any;
}
