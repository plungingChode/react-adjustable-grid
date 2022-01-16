import React, { useEffect, useRef, useState } from 'react';
import Draggable, { DraggableBounds, DraggableEventHandler } from 'react-draggable';
import { noop } from './util';
import { MeasuredCell } from './ResizableGrid';

import clsx from 'clsx';


type LineStyles = (size: number) => React.CSSProperties;

const rowStyles: LineStyles = width => ({
  // position: 'absolute',
  width: width,

  // opacity: 0.3,
  // backgroundColor: 'blue',
  // cursor: 'ns-resize',
});

const columnStyles: LineStyles = height => ({
  // position: 'absolute',
  height: height,
  // width: 'var(--rsg-separator-size)',

  // opacity: 0.3,
  // backgroundColor: 'red',
  // cursor: 'ew-resize',
});

export interface Segment {
  /** Index of the row/column this handle will resize */
  index: number;
  size: number;
  x: number;
  y: number;
  bounds: number;
}

function createSeparatorGenerator(dragAxis: 'x' | 'y') {
  let dragOffset: 'x' | 'y';
  let sizeOffset: 'x' | 'y';

  if (dragAxis === 'y') {
    // Row separator
    dragOffset = 'y';
    sizeOffset = 'x';
  }
  else {
    // Column separator
    dragOffset = 'x';
    sizeOffset = 'y';
  }

  const isSameLine = (a: Segment, b: Segment) => {
    return a[dragOffset] === b[dragOffset];
  };

  const isDirectlyAdjacent = (a: Segment, b: Segment) => {
    return a[sizeOffset] + a.size === b[sizeOffset];
  };

  // Sorting function to place potentially mergeable segments
  // next to eachother
  const order = (a: Segment, b: Segment) => {
    return isSameLine(a, b)
      ? a[sizeOffset] - b[sizeOffset]
      : a[dragOffset] - b[dragOffset];
  };

  return (segments: Segment[]) => {
    // Sorted in order of ascending drag axis, then ascending size axis
    segments.sort(order);
    const merged: Segment[] = [];

    for (let i = 0; i < segments.length; i++) {
      const current = segments[i];

      // If it's the last item, there's nothing to merge with
      if (i >= segments.length - 1) {
        merged.push(current);
        break;
      }

      // If they're not on the same line, they cannot be merged and
      // count as different separators
      if (!isSameLine(current, segments[i + 1])) {
        merged.push(current);
        continue;
      }

      // Merge segments next to eachother
      for (; i < segments.length - 1; i++) {
        if (!isDirectlyAdjacent(current, segments[i + 1])) {
          break;
        }
        current.size += segments[i + 1].size;
        current.bounds = Math.max(current.bounds, segments[i + 1].bounds);
      }

      // Segments on the same line, but not directly adjacent cannot
      // be joined, but still count as the same separator
      // const parts = [current];
      merged.push(current);
      for (; i < segments.length - 1; i++) {
        if (!isSameLine(current, segments[i + 1])) {
          break;
        }
        merged.push(segments[i + 1]);
      }
    }

    return merged;
  };
}

const toRowSeparator = createSeparatorGenerator('y');
const toColSeparator = createSeparatorGenerator('x');

const toColSegment = (cell: MeasuredCell) => ({
  size: cell.h,
  x: cell.x + cell.w,
  y: cell.y,
  bounds: cell.bx,
  index: cell.col + cell.colSpan - 2,
});

const toRowSegment = (cell: MeasuredCell) => ({
  size: cell.w,
  x: cell.x,
  y: cell.y + cell.h,
  bounds: cell.by,
  index: cell.row + cell.rowSpan - 2,
});

export function getSeparatorProps(cells: MeasuredCell[]) {
  const segments = {
    row: [] as Segment[],
    col: [] as Segment[],
  };
  for (const c of cells) {
    segments.row.push(toRowSegment(c));
    segments.col.push(toColSegment(c));
  }
  return {
    row: toRowSeparator(segments.row),
    col: toColSeparator(segments.col),
  };
}

export type ResizeEventHandler = (idx: number, delta: number) => void;

type Props = Segment & {
  onBeforeDrag?: ResizeEventHandler,
  onDrag?: ResizeEventHandler,
  onDragEnd?: ResizeEventHandler,
}

const defaultProps: Partial<Props> = {
  onBeforeDrag: noop,
  onDrag: noop,
  onDragEnd: noop,
};

function createSeparator(axis: 'x' | 'y') {
  let position: (s: Segment) => ({ x: number, y: number });
  let lineStyles: LineStyles;
  let boundsKey: keyof DraggableBounds;
  let separatorType: 'row' | 'col';

  if (axis === 'y') {
    position = s => ({ x: s.x, y: s.y });
    lineStyles = rowStyles;
    boundsKey = 'top';
    separatorType = 'row';
  }
  else /* axis === 'x' */ {
    position = s => ({ x: s.x, y: s.y });
    lineStyles = columnStyles;
    boundsKey = 'left';
    separatorType = 'col';
  }

  return function Separator(props: Props) {
    props = { ...defaultProps, ...props };
    const [dragging, setDragging] = useState(false);
    const lineRef = useRef<HTMLDivElement>(null);

    const className = clsx('rsg-separator', separatorType);
    const draggingClass = `rsg-${separatorType}-resizing`;

    useEffect(
      () => {
        const bodyClasses = document.body.classList;
        if (dragging) {
          bodyClasses.add(draggingClass);
        }
        else {
          bodyClasses.remove(draggingClass);
        }
      },
      [dragging]
    );

    const onDrag: DraggableEventHandler = (e, data) => {
      if (data[axis] < props.bounds) {
        return false;
      }
      // console.log('cursor :', data[axis], '>=', props.bounds);
      const delta = axis === 'x' ? data.deltaX : data.deltaY;
      if (delta === 0) {
        return;
      }
      return props.onDrag!(props.index, delta);
    };

    const onBeforeDrag: DraggableEventHandler = () => {
      props.onBeforeDrag!(props.index, props[axis]);
      setDragging(true);
    };

    const onDragEnd: DraggableEventHandler = () => {
      props.onDragEnd!(props.index, 0);
      setDragging(false);
    };

    return (
      <Draggable
        nodeRef={lineRef}
        axis={axis}
        defaultClassNameDragging='dragging'
        position={position(props)}
        bounds={{ [boundsKey]: props.bounds }}
        grid={[10, 10]}

        onStart={onBeforeDrag}
        onDrag={onDrag}
        onStop={onDragEnd}
      >
        <div
          ref={lineRef}
          className={className}
          style={lineStyles(props.size)}
        />
      </Draggable>
    );
  };
}

export const RowSeparator = createSeparator('y');
export const ColumnSeparator = createSeparator('x');
