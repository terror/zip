import { Game } from '@/components/game';
import { Room } from '@/components/room';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useRoomContext } from '@/hooks/use-room-context';
import { useEffect, useState } from 'react';

import { Loading } from './components/loading';
import { usePersistedState } from './hooks/use-persisted-state';

function App() {
  const { isLoading, roomHash } = useRoomContext();

  const [isMobile, setIsMobile] = useState(false);

  const [mobilePanelSizes, setMobilePanelSizes] = usePersistedState(
    'mobile-panel-sizes',
    [70, 30]
  );

  const [panelSizes, setPanelSizes] = usePersistedState(
    'panel-sizes',
    [60, 40]
  );

  const [isRoomCollapsed, setIsRoomCollapsed] = usePersistedState(
    'room-collapsed',
    false
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePanelResize = (sizes: number[]) => {
    if (isRoomCollapsed) setIsRoomCollapsed(false);

    if (isMobile) {
      setMobilePanelSizes(sizes);
    } else {
      setPanelSizes(sizes);
    }
  };

  const currentSizes = isMobile ? mobilePanelSizes : panelSizes;

  if (roomHash && isLoading) {
    return <Loading />;
  }

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
          onCollapse={() => setIsRoomCollapsed(!isRoomCollapsed)}
          collapsedSize={0}
        >
          <Room />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default App;
