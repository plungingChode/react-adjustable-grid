import React, { ReactElement } from 'react';
import isEqual from 'fast-deep-equal';

import {
  getSeparatorProps,
  RowSeparator,
  ColumnSeparator,
} from './ResizableGridSeparators';

import clsx from 'clsx';
import { 
  createCellMatrix, 
  getLayoutFromChildren, 
  KeyMatrix, 
  measureCells, 
  noop, 
  sum, 
  transposeKeyMatrix, 
} from './util';

export type TKey = string;
export type GridCell = {
  i: TKey;

  // Position & size
  x: number,
  y: number,
  w: number,
  h: number,

  // Inner bounds
  bx?: number,
  by?: number,
}
export type Layout = GridCell[];


export type MeasuredCell = GridCell & {
  // Defaults to 0 if missing from
  // the original cell
  bx: number,
  by: number,

  row: number,
  col: number,
  rowSpan: number,
  colSpan: number,
}

export type ResizeEventHandler = (i: number, newSize: number) => boolean | void;

type Props = {
  rows: number[],
  cols: number[],
  children: ReactElement<any>[],

  className?: string,
  style?: React.CSSProperties,

  onBeforeColumnResize?: ResizeEventHandler,
  onColumnResize?: ResizeEventHandler,
  onAfterColumnResize?: ResizeEventHandler,

  onBeforeRowResize?: ResizeEventHandler
  onRowResize?: ResizeEventHandler,
  onAfterRowResize?: ResizeEventHandler,
}

type State = {
  cols: number[],
  keyMatrix: KeyMatrix,
  rows: number[],
  measuredCells: Record<TKey, MeasuredCell>,
  layout: Layout,

  bounds: number,
  externalUpdate: boolean,

  // Used to compare with incoming props
  children: ReactElement<any>[],
  propsRows: number[],
  propsCols: number[],
}

// Update flags
const UPDATED_ROWS = 1 << 0;
const UPDATED_COLS = 1 << 1;
const UPDATED_BOUNDS = 1 << 2;
const UPDATED_CHILDREN = 1 << 3;

class ResizableGrid extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    onAfterRowResize: noop,
    onBeforeColumnResize: noop,
    onAfterColumnResize: noop,
    onBeforeRowResize: noop,
    onColumnResize: noop,
    onRowResize: noop,
  };

  state: State = {
    measuredCells: {},
    keyMatrix: [],
    rows: [...this.props.rows],
    cols: [...this.props.cols],
    layout: getLayoutFromChildren(
      [],
      this.props.children
    ),
    bounds: 0,
    externalUpdate: false,
    children: this.props.children,

    propsRows: this.props.rows,
    propsCols: this.props.cols,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      ...this.state,
      keyMatrix: createCellMatrix(
        this.state.rows,
        this.state.cols,
        this.state.layout
      ),
      measuredCells: measureCells(
        this.state.rows,
        this.state.cols,
        this.state.layout,
      ),
    };
  }

  calculateResizeBoundary = (kind: 'row' | 'col', target: number, handleOffset: number) => {
    const { keyMatrix: areaMatrix, cols, rows, measuredCells } = this.state;

    let matrix: KeyMatrix;
    let sizes: number[];
    let maxContraction: (c: MeasuredCell) => number;

    if (kind === 'col') {
      // The process was created for rows, so to use it with rows we need to
      // transpose the area matrix first.
      matrix = transposeKeyMatrix(areaMatrix);
      sizes = cols;
      maxContraction = c => c.x + c.w - (c.bx ?? 0);
    }
    else {
      matrix = areaMatrix;
      sizes = rows;
      maxContraction = c => c.y + c.h - (c.by ?? 0);
    }

    //
    // Find the maximum allowed of reduction for each affected cell
    //
    // When moving the boundary at the `>` character, we check cells
    // `a`, `b`, and `c` to find which one of them is able to cont-
    // ract the least (max contraction = current size - min. size).
    // This is how much we're allowed to move the separator.
    //
    //              |
    //  +---+---+---+---+---+
    //  |   |a          |   |
    //  +---+---+---+---+---+
    //  |   |   |b >|   |   |
    //  +---+---+---+---+---+
    //  |   |   |c          |
    //  +---+---+---+---+---+
    //              |
    //
    const distances: number[] = [];
    for (const key of matrix[target]) {
      const c = measuredCells[key];
      c && distances.push(maxContraction(c));
    }

    // Maxmimum reduction
    const minContraction = Math.min(...distances);

    // Distance up to the previous segment.
    const before = sum(sizes.slice(0, target));

    // The minimum offset the resize handle may be dragged to
    const boundary = Math.max(before + 10, handleOffset - minContraction);
    // console.log('current boundary:', boundary);
    return boundary;
  };

  onBeforeColResize: ResizeEventHandler = (idx, offset) => {
    this.setState({ bounds: this.calculateResizeBoundary('col', idx, offset) });
    this.props.onBeforeColumnResize!(idx, this.state.cols[idx]);
  };

  onColResize: ResizeEventHandler = (idx, delta) => {
    // TODO document this short circuit
    const newSize = this.state.cols[idx] + delta;

    if (this.props.onColumnResize!(idx, newSize)) {
      this.setState({ externalUpdate: true });
      return;
    }

    if (sum(this.state.cols.slice(0, idx)) + newSize < this.state.bounds) {
      return;
    }

    const newCols = [...this.state.cols];
    newCols[idx] += delta;

    // console.log(sum(newCols.slice(0, idx + 1)), '>=', this.state.bounds);

    const measuredCells = measureCells(
      this.state.rows,
      newCols,
      this.state.layout,
    );
    this.setState({ cols: newCols, measuredCells, externalUpdate: false });
  };

  onAfterColResize: ResizeEventHandler = idx => {
    const { cols } = this.state;
    this.props.onAfterColumnResize!(idx, cols[idx]);
  };

  onBeforeRowResize: ResizeEventHandler = (idx, offset) => {
    this.setState({ bounds: this.calculateResizeBoundary('row', idx, offset) });
    this.props.onBeforeRowResize!(idx, this.state.rows[idx]);
  };

  onRowResize: ResizeEventHandler = (idx, delta) => {
    // TODO document this short circuit
    if (this.props.onRowResize!(idx, this.state.rows[idx] + delta)) {
      this.setState({ externalUpdate: true });
      return;
    }

    const rows = [...this.state.rows];
    rows[idx] += delta;

    const measuredCells = measureCells(
      rows,
      this.state.cols,
      this.state.layout,
    );
    this.setState({ rows, measuredCells, externalUpdate: false });
  };

  onAfterRowResize: ResizeEventHandler = idx => {
    const { rows } = this.state;
    this.props.onAfterRowResize!(idx, rows[idx]);
  };

  processChild = (child: ReactElement<any>, idx: number) => {
    if (!child || !child.key) {
      return;
    }

    const childCell = this.state.measuredCells[child.key];
    if (!childCell) {
      return null;
    }

    const newChild = React.cloneElement(child, {
      className: clsx(
        'rsg-grid-cell',
        child.props.className
      ),
      style: {
        ...child.props.style,
        position: 'absolute',
        top: childCell.y,
        left: childCell.x,
        width: childCell.w,
        height: childCell.h,
      },
    });

    // console.log(newChild.props);

    return newChild;
  };

  shouldComponentUpdate(nextProps: Required<Props>, nextState: State) {
    // TODO Grid elements sometimes "jump", when switching resize axes.
    //      Doesn't seem to happen with <DraggableCore /> as the separator
    //      wrapper, but I couldn't make that one work yet.
    return (
      this.props.children !== nextProps.children ||
      this.state.rows !== nextState.rows ||
      this.state.cols !== nextState.cols ||
      this.state.bounds !== nextState.bounds
    );
  }

  static getDerivedStateFromProps(nextProps: Required<Props>, prevState: State) {
    let modified = false;
    const currentState: Partial<State> = {};

    // Watch for updates to children, rows, cols from props by comparing
    // to stored references
    if (nextProps.children !== prevState.children) {
      currentState.layout = getLayoutFromChildren(
        prevState.layout,
        nextProps.children
      );
      currentState.children = nextProps.children;
      modified = true;
    }
    if (nextProps.rows !== prevState.propsRows) {
      currentState.rows = [...nextProps.rows];
      currentState.propsRows = nextProps.rows;
      modified = true;
    }
    if (nextProps.cols !== prevState.propsCols) {
      currentState.cols = [...nextProps.cols];
      currentState.propsCols = nextProps.cols;
      modified = true;
    }

    if (modified) {
      currentState.rows = currentState.rows ?? prevState.rows;
      currentState.cols = currentState.cols ?? prevState.cols;
      currentState.layout = currentState.layout ?? prevState.layout;

      currentState.measuredCells = measureCells(
        currentState.rows,
        currentState.cols,
        currentState.layout,
      );

      // If row- or column count changed, we need to create a new
      // cell matrix
      if (nextProps.rows.length !== prevState.rows.length ||
          nextProps.cols.length !== prevState.cols.length
      ) {
        currentState.keyMatrix = createCellMatrix(
          currentState.rows,
          currentState.cols,
          currentState.layout
        );
      }

      return currentState;
    }
    return null;
  }

  getSnapshotBeforeUpdate(prevProps: Required<Props>, prevState: State) {
    const flags = 0;
    // if (this.props.children !== prevProps.children) {
    //   flags |= UPDATED_CHILDREN;
    // }
    // if (this.state.bounds !== prevState.bounds) {
    //   flags |= UPDATED_BOUNDS;
    // }

    // if (this.state.externalUpdate) {
    //   if (!isEqual(this.state.rows, this.props.rows)) {
    //     flags |= UPDATED_ROWS;
    //   }
    //   if (!isEqual(this.state.cols, this.props.cols)) {
    //     flags |= UPDATED_COLS;
    //   }
    // }
    return flags ?? null;
  }

  componentDidUpdate(prevProps: Required<Props>, prevState: State, flags: number) {
    if (!flags) {
      return;
    }

    // Not a real copy, but it doesn't need to be
    const newState: State = { ...this.state };

    if (flags & UPDATED_CHILDREN) {
      newState.layout = getLayoutFromChildren(
        this.state.layout,
        this.props.children
      );
    }
    if (flags & UPDATED_ROWS) {
      // TODO Maybe unnecessary to copy?
      newState.rows = [...this.props.rows];
    }
    if (flags & UPDATED_COLS) {
      newState.cols = [...this.props.cols];
    }

    const needRemeasure = 0
      | UPDATED_ROWS
      | UPDATED_COLS
      | UPDATED_CHILDREN
      | UPDATED_BOUNDS;

    if (flags & needRemeasure) {
      newState.measuredCells = measureCells(
        newState.rows,
        newState.cols,
        newState.layout,
      );
    }

    this.setState({ ...newState });
  }

  getSeparatorProps = () => {
    const { measuredCells } = this.state;
    return getSeparatorProps(Object.values(measuredCells));
  };

  render() {
    const { style, className } = this.props;
    const { bounds, rows, cols } = this.state;

    const children = this.props.children as ReactElement<any>[];
    const mergedClassName = clsx('rsg-resizable-grid', className);
    const mergedStyles: React.CSSProperties = {
      ...style,
      width: sum(cols),
      height: sum(rows),
    };

    const {
      row: rowSeparatorProps,
      col: columnSeparatorProps,
    } = this.getSeparatorProps();

    return (
      <div
        className={mergedClassName}
        style={mergedStyles}
      >
        {React.Children.map(children, this.processChild)}
        {columnSeparatorProps.map((props, i) => (
          <ColumnSeparator
            {...props}
            key={`colsep_${i}`}
            bounds={Math.max(bounds, props.bounds)}
            onBeforeDrag={this.onBeforeColResize}
            onDrag={this.onColResize}
            onDragEnd={this.onAfterColResize}
          />
        ))}
        {rowSeparatorProps.map((props, i) => (
          <RowSeparator
            {...props}
            key={`rowsep_${i}`}
            bounds={Math.max(bounds, props.bounds)}
            onBeforeDrag={this.onBeforeRowResize}
            onDrag={this.onRowResize}
            onDragEnd={this.onAfterRowResize}
          />
        ))}
      </div>
    );
  }
}

export default ResizableGrid;
