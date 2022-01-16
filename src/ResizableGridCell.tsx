import React, { ReactNode, useRef } from 'react';

interface GridCellProps {
  children: ReactNode;
}

function ResizableGridCell(props: any) {
  const { children } = props;

  return (
    <div>
      {children}
    </div>
  );
}

export default ResizableGridCell;
