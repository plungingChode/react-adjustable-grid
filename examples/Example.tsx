import React from 'react';
import ResizableGrid from '../src/ResizableGrid';

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
  { i: '4', x: 1, y: 2, w: 1, h: 1, bx: 100, by: 100 },
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

export default Example;
