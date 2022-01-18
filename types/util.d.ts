import type { ReactElement } from 'react';
import type { GridCell, Layout, MeasuredCell, TKey } from './ResizableGrid';
export declare const noop: () => void;
export declare function cloneLayoutCell(cell: GridCell): GridCell;
export declare function cloneLayout(layout: GridCell[]): any[];
export declare function getLayoutItem(layout: Layout, id: string): GridCell | undefined;
export declare function validateLayout(layout: Layout, context?: string, iOffset?: number): void;
export declare function getLayoutFromChildren(currentLayout: Layout, children: ReactElement<any>[]): Layout;
/**
 * Return the sum of an array of numbers
 *
 * @param arr The source array
 * @returns Sum of the elements
 */
export declare function sum(arr: number[]): number;
export declare type KeyMatrix = TKey[][];
export declare function cloneKeyMatrix(mx: KeyMatrix): KeyMatrix;
export declare function transposeKeyMatrix(mx: KeyMatrix): KeyMatrix;
export declare function createCellMatrix(rows: number[], cols: number[], layout: Layout): any[];
export declare function measureCells(rows: number[], cols: number[], layout: Layout): Record<string | number, MeasuredCell>;
