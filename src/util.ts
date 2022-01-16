import type { ReactElement } from 'react';
import React from 'react';
import type { GridCell, Layout, MeasuredCell, TKey } from './ResizableGrid';

const isProduction = process.env.NODE_ENV === 'production';

// eslint-disable-next-line
export const noop = () => { };

export function cloneLayoutCell(cell: GridCell): GridCell {
  return {
    i: cell.i,
    x: cell.x,
    y: cell.y,
    w: cell.w,
    h: cell.h,
    bx: cell.bx,
    by: cell.by,
  };
}

export function cloneLayout(layout: GridCell[]) {
  const newLayout = Array(layout.length);
  for (let i = 0; i < layout.length; i++) {
    newLayout[i] = cloneLayoutCell(layout[i]);
  }
  return newLayout;
}

export function getLayoutItem(layout: Layout, id: string) {
  for (let i = 0; i < layout.length; i++) {
    if (layout[i].i === id) {
      return layout[i];
    }
  }
}

export function validateLayout(layout: Layout, context = 'Layout', iOffset = 0) {
  const required: (keyof GridCell)[] = ['x', 'y', 'w', 'h'];
  if (!Array.isArray(layout)) {
    throw new Error(context + ' must be an array!');
  }
  for (let i = 0; i < layout.length; i++) {
    for (const prop of required) {
      if (typeof layout[i][prop] !== 'number') {
        throw new Error(
          `ResizableGrid: ${context}[${i + iOffset}].${prop} must be a number!`
        );
      }
    }
  }
}

export function getLayoutFromChildren(
  currentLayout: Layout,
  children: ReactElement<any>[],
): Layout {
  const layout: Layout = [];
  React.Children.forEach(children, (child, idx) => {
    if (!child.key) {
      return;
    }

    const key = String(child.key);
    const props: GridCell = child.props['data-grid'];
    if (props) {
      if (!isProduction) {
        validateLayout([props], 'ResizableGrid.children', idx);
      }

      layout.push({ ...props, i: key });
    }
    else if (!isProduction) {
      console.warn(
        'ResizableGrid: ResizableGrid.children[%d] (key = %s) has no ' +
        'layout cell associated with it and will not be rendered.', idx, key
      );
    }
  });
  return layout;
}

/**
 * Return the sum of an array of numbers
 *
 * @param arr The source array
 * @returns Sum of the elements
 */
export function sum(arr: number[]) {
  let rv = 0;
  for (let i = 0; i < arr.length; i++) {
    rv += arr[i];
  }
  return rv;
}

export type KeyMatrix = TKey[][];

// Creates row major order
export function createKeyMatrix(n: number, m: number): KeyMatrix {
  const mx = Array(n);
  for (let i = 0; i < n; i++) {
    mx[i] = Array(m).fill(-1);
  }
  return mx;
}

export function cloneKeyMatrix(mx: KeyMatrix): KeyMatrix {
  const n = mx.length;

  const clone = Array(n);
  for (let i = 0; i < n; i++) {
    clone[i] = [...mx[i]];
  }
  return clone;
}

// Assumes row major order
export function transposeKeyMatrix(mx: KeyMatrix): KeyMatrix {
  const n = mx.length;
  const m = mx[0].length;

  const tpd = Array(m);
  for (let j = 0; j < m; j++) {
    tpd[j] = Array(n);
    for (let i = 0; i < n; i++) {
      tpd[j][i] = mx[i][j];
    }
  }

  return tpd;
  // return mx[0].map((_, i) => mx.map(row => row[i]));
}


export function measureCells(layout: Layout, rows: number[], cols: number[]) {
  const props: Record<number | string, MeasuredCell> = {};
  for (let i = 0; i < layout.length; i++) {
    const c = layout[i];
    const mc: MeasuredCell = {
      i: c.i,
      x: sum(cols.slice(0, c.x - 1)),
      y: sum(rows.slice(0, c.y - 1)),
      w: sum(cols.slice(c.x - 1, c.x + c.w - 1)),
      h: sum(rows.slice(c.y - 1, c.y + c.h - 1)),
      bx: 0,
      by: 0,

      row: c.y,
      col: c.x,
      rowSpan: c.h,
      colSpan: c.w,
    };

    mc.bx = mc.x + (c.bx ?? 0);
    mc.by = mc.y + (c.by ?? 0);

    if (c.by && c.by > mc.h + 5) {
      console.warn(
        'ResizableGrid: ResizableGrid.children[%d].by (key = %s) was set to ' +
        ' a value higher than its current height (%d > %d). This will only take ' +
        'effect once the cell\'s height has reached this value and should be ' +
        'avoided!', i, c.i, c.by, mc.h,
      );
      mc.by = mc.y + mc.h;
    }
    if (c.bx && c.bx > mc.w + 5) {
      console.warn(
        'ResizableGrid: ResizableGrid.children[%d].bx (key = %s) was set to ' +
        'a value higher than its current width (%d > %d). This will only take ' +
        'effect once the cell\'s width has reached this value and should be ' +
        'avoided!', i, c.i, c.bx, mc.w,
      );
      mc.bx = mc.x + mc.w;
    }

    props[mc.i] = mc;
  }

  return props;
}
