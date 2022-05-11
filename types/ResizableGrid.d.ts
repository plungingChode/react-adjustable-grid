import React, { ReactElement } from 'react';
import { KeyMatrix } from './util';
export declare type TKey = string;
export declare type GridCell = {
    i: TKey;
    x: number;
    y: number;
    w: number;
    h: number;
    bx?: number;
    by?: number;
};
export declare type Layout = GridCell[];
export declare type MeasuredCell = GridCell & {
    bx: number;
    by: number;
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
};
export declare type ResizeEventHandler = (i: number, newSize: number) => boolean | void;
declare type Props = {
    rows: number[];
    cols: number[];
    children: ReactElement<any>[];
    className?: string;
    style?: React.CSSProperties;
    onBeforeColumnResize?: ResizeEventHandler;
    onColumnResize?: ResizeEventHandler;
    onAfterColumnResize?: ResizeEventHandler;
    onBeforeRowResize?: ResizeEventHandler;
    onRowResize?: ResizeEventHandler;
    onAfterRowResize?: ResizeEventHandler;
};
declare type State = {
    cols: number[];
    keyMatrix: KeyMatrix;
    rows: number[];
    measuredCells: Record<TKey, MeasuredCell>;
    layout: Layout;
    bounds: number;
    externalUpdate: boolean;
    children: ReactElement<any>[];
    propsRows: number[];
    propsCols: number[];
};
declare class ResizableGrid extends React.Component<Props, State> {
    static defaultProps: Partial<Props>;
    state: State;
    constructor(props: Props);
    calculateResizeBoundary: (kind: 'row' | 'col', target: number, handleOffset: number) => number;
    onBeforeColResize: ResizeEventHandler;
    onColResize: ResizeEventHandler;
    onAfterColResize: ResizeEventHandler;
    onBeforeRowResize: ResizeEventHandler;
    onRowResize: ResizeEventHandler;
    onAfterRowResize: ResizeEventHandler;
    processChild: (child: ReactElement<any>, idx: number) => React.ReactElement<any, string | React.JSXElementConstructor<any>> | null | undefined;
    shouldComponentUpdate(nextProps: Required<Props>, nextState: State): boolean;
    static getDerivedStateFromProps(nextProps: Required<Props>, prevState: State): Partial<State> | null;
    getSnapshotBeforeUpdate(prevProps: Required<Props>, prevState: State): number;
    componentDidUpdate(prevProps: Required<Props>, prevState: State, flags: number): void;
    getSeparatorProps: () => {
        row: import("./ResizableGridSeparators").Segment[];
        col: import("./ResizableGridSeparators").Segment[];
    };
    render(): JSX.Element;
}
export default ResizableGrid;
