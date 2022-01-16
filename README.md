# React Adjustable Grid

A grid layout with a fixed number of resizable rows/columns, inspired by [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout).

## Installing
> TODO
The package requires `react`, `react-dom` and `react-draggable` to be available in your project.

## `<ResizableGrid>` usage
Wrap your grid cells in the `<ResizableGrid>` element and specify some initial row and column sizes. Specify the layout by setting the `data-grid` attribute on the cells. Set your cells' `key` attribute to the layout item you want to link it to, and you're good to go.

```jsx
import React from 'react';
import ResizableGrid from 'react-adjustable-grid';

const rows = [100, 100, 100];
const cols = [100, 100, 100];
const layout = [
  // No minimum size
  { i: '1', x: 1, y: 1, w: 2, h: 1 },
  // Min width: 100px
  { i: '2', x: 3, y: 1, w: 1, h: 1, bx: 100 },
  // Min height: 100px
  { i: '3', x: 2, y: 2, w: 2, h: 1, by: 100 },
  // Min width, min height 100px
  { i: '4', x: 2, y: 1, w: 1, h: 1, bx: 100, by: 100 },
];

const colors = [
  'khaki', 'coral', 'palevioletred', 
  'indianred', 'thistle',
];

function Example() {
  const logRow = (idx, size) => (
    console.log('Row %d resized to %d', idx, size)
  );

  const logCol = (idx, size) => (
    console.log('Column %d resized to %d', idx, size)
  );

  return (
    <ResizableGrid 
      rows={rows} 
      cols={cols}
      onBeforeColumnResize={logCol}
      onColumnResize={logCol}
      onAfterColumnResize={logCol}
      onBeforeRowResize={logRow}
      onRowResize={logRow}
      onAfterRowResize={logRow}
      className='grid'
      style={{ color: 'hotpink' }}
    >
      {layout.map((cell, i) => (
        <div
          key={cell.i}
          data-grid={{ ...cell }}
          style={{ backgroundColor: colors[i], height: '100%' }}
        />
      ))}
    </ResizableGrid>
  );
}
```
### <ReizableGrid> API
> TODO
