/// <reference types="react" />
import { MeasuredCell } from './ResizableGrid';
export interface Segment {
    /** Index of the row/column this handle will resize */
    index: number;
    size: number;
    x: number;
    y: number;
    bounds: number;
}
export declare function getSeparatorProps(cells: MeasuredCell[]): {
    row: Segment[];
    col: Segment[];
};
export declare type ResizeEventHandler = (idx: number, delta: number) => void;
declare type Props = Segment & {
    onBeforeDrag?: ResizeEventHandler;
    onDrag?: ResizeEventHandler;
    onDragEnd?: ResizeEventHandler;
};
export declare const RowSeparator: (props: Props) => JSX.Element;
export declare const ColumnSeparator: (props: Props) => JSX.Element;
export {};
