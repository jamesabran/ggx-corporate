import { createContext, useContext, useState, type ReactNode } from 'react';

type Segment = 'basic' | 'growing';

interface BasicSegmentCtx {
  segment: Segment;
  setSegment: (s: Segment) => void;
}

const BasicSegmentContext = createContext<BasicSegmentCtx>({
  segment: 'basic',
  setSegment: () => {},
});

export function BasicSegmentProvider({ children }: { children: ReactNode }) {
  const [segment, setSegment] = useState<Segment>('growing');

  return (
    <BasicSegmentContext.Provider value={{ segment, setSegment }}>
      {children}
    </BasicSegmentContext.Provider>
  );
}

export function useBasicSegment() {
  return useContext(BasicSegmentContext);
}
