import { Game } from '@/components/game';
import { Room } from '@/components/room';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useEffect, useState } from 'react';

function App() {
  const [isMobile, setIsMobile] = useState(false);

  const [panelSizes, setPanelSizes] = useState(() => {
    const saved = localStorage.getItem('panel-sizes');
    return saved ? JSON.parse(saved) : [60, 40];
  });

  const [mobilePanelSizes, setMobilePanelSizes] = useState(() => {
    const saved = localStorage.getItem('mobile-panel-sizes');
    return saved ? JSON.parse(saved) : [70, 30];
  });

  const [isRoomCollapsed, setIsRoomCollapsed] = useState(() => {
    const saved = localStorage.getItem('room-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePanelResize = (sizes: number[]) => {
    if (isRoomCollapsed) persistRoomCollapsed(false);

    if (isMobile) {
      setMobilePanelSizes(sizes);
      localStorage.setItem('mobile-panel-sizes', JSON.stringify(sizes));
    } else {
      setPanelSizes(sizes);
      localStorage.setItem('panel-sizes', JSON.stringify(sizes));
    }
  };

  const persistRoomCollapsed = (value: boolean) => {
    setIsRoomCollapsed(value);
    localStorage.setItem('room-collapsed', JSON.stringify(value));
  };

  const currentSizes = isMobile ? mobilePanelSizes : panelSizes;

  return (
    <div className='h-screen'>
      <ResizablePanelGroup
        direction={isMobile ? 'vertical' : 'horizontal'}
        onLayout={handlePanelResize}
      >
        <ResizablePanel
          defaultSize={isRoomCollapsed ? 100 : currentSizes[0]}
          minSize={isMobile ? 30 : 40}
        >
          <Game />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          defaultSize={isRoomCollapsed ? 0 : currentSizes[1]}
          minSize={isMobile ? 25 : 20}
          maxSize={isMobile ? 70 : 50}
          collapsible
          onCollapse={() => persistRoomCollapsed(!isRoomCollapsed)}
          collapsedSize={0}
        >
          <Room />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default App;
