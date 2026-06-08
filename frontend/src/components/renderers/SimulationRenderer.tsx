import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import BevelContainer from '../ui/BevelContainer';

const SimulationRenderer = ({ data }: { data: any }) => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 500,
      parent: gameRef.current,
      backgroundColor: '#0e0e0e', // Retro dark container lowest
      scene: {
        preload: function(this: Phaser.Scene) {
          // Preload assets if needed
        },
        create: function(this: Phaser.Scene) {
          const entities = data.content?.entities || [];
          const mechanics = data.content?.mechanics || '';

          // Add title in retro Space Mono
          this.add.text(400, 35, mechanics, { 
            fontSize: '15px', 
            color: '#b9ccb2',
            fontFamily: 'Courier New, monospace' 
          }).setOrigin(0.5);

          const expectedOrder = data.content?.expected_order || [];
          const statusText = this.add.text(400, 70, expectedOrder.length > 0 ? 'ARRANGE ENTITIES IN CORRECT SEQUENCE' : 'INTERACTIVE SIMULATION', {
            fontSize: '14px',
            color: '#ffaa00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
          }).setOrigin(0.5);

          const entityRects: { name: string, rect: Phaser.GameObjects.Rectangle }[] = [];

          // Render entities dynamically
          entities.forEach((entity: any, index: number) => {
            const x = 200 + (index * 200) % 600;
            const y = 150 + Math.floor(index / 3) * 120;

            // Default color red if order expected, otherwise keep original logic
            const isMaster = entity.type?.toLowerCase() === 'master' || index === 0;
            const color = expectedOrder.length > 0 ? 0xff0055 : (isMaster ? 0xff0055 : 0x00e639);

            // Draw rectangle shape
            const rect = this.add.rectangle(x, y, 120, 80, color, 0.2)
              .setStrokeStyle(1.5, color, 0.8)
              .setInteractive({ useHandCursor: true });
            
            // Draggable
            this.input.setDraggable(rect);

            entityRects.push({ name: entity.name, rect: rect });

            // Labels
            const titleText = this.add.text(x, y - 12, entity.name || 'Entity', { 
              fontSize: '13px', 
              color: '#ffffff',
              fontFamily: 'Courier New, monospace',
              fontStyle: 'bold'
            }).setOrigin(0.5);

            const typeText = this.add.text(x, y + 12, entity.type || 'Object', { 
              fontSize: '11px', 
              color: '#b9ccb2',
              fontFamily: 'Courier New, monospace'
            }).setOrigin(0.5);

            // Sync text with rectangle drag
            rect.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
              rect.x = dragX;
              rect.y = dragY;
              titleText.x = dragX;
              titleText.y = dragY - 12;
              typeText.x = dragX;
              typeText.y = dragY + 12;
            });

            rect.on('dragend', () => {
              if (expectedOrder.length > 0) {
                let groups: string[][] = [];
                if (Array.isArray(expectedOrder[0])) {
                  groups = expectedOrder;
                } else {
                  groups = expectedOrder.map((item: string) => [item]);
                }

                let isCorrect = true;
                for (let i = 0; i < groups.length - 1; i++) {
                  const currentGroup = groups[i];
                  const nextGroup = groups[i+1];
                  
                  const currentMaxX = Math.max(...currentGroup.map((name: string) => {
                    const r = entityRects.find(er => er.name === name);
                    return r ? r.rect.x : 9999;
                  }));

                  const nextMinX = Math.min(...nextGroup.map((name: string) => {
                    const r = entityRects.find(er => er.name === name);
                    return r ? r.rect.x : -9999;
                  }));

                  // Ensure all items in current group are to the left of all items in next group
                  if (currentMaxX >= nextMinX - 20) {
                    isCorrect = false;
                    break;
                  }
                }

                if (isCorrect) {
                  statusText.setText('SYSTEM SIMULATION COMPLETE: SEQUENCE CORRECT');
                  statusText.setColor('#00ff00');
                  entityRects.forEach(r => {
                    r.rect.setFillStyle(0x00e639, 0.2);
                    r.rect.setStrokeStyle(1.5, 0x00e639, 0.8);
                  });
                } else {
                  statusText.setText('ARRANGE ENTITIES IN CORRECT SEQUENCE');
                  statusText.setColor('#ffaa00');
                  entityRects.forEach(r => {
                    r.rect.setFillStyle(0xff0055, 0.2);
                    r.rect.setStrokeStyle(1.5, 0xff0055, 0.8);
                  });
                }
              }
            });
          });
        },
        update: function() {
          // Game loop
        }
      }
    };

    const newGame = new Phaser.Game(config);

    return () => {
      newGame.destroy(true);
    };
  }, [data]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#000000] p-4 font-mono select-none">
      <div className="mb-4 text-on-surface-variant bg-surface-container p-4 w-full max-w-3xl border border-[#2a2a2a] bevel-raised">
        <h3 className="font-bold text-[14px] font-label-caps text-primary-fixed-dim mb-1 tracking-wider">
          SYSTEM_DYNAMIC_SIMULATION
        </h3>
        <p className="text-[12px] leading-relaxed mb-2">{data.content?.mechanics}</p>
        <p className="text-[10px] text-on-surface-variant/50 italic">
          [ INTERACTIVE STATUS: drag and drop entities to analyze system feedback ]
        </p>
      </div>
      <BevelContainer
        variant="sunken"
        className="rounded-lg overflow-hidden border border-[#080808] w-[800px] h-[500px]"
      >
        <div ref={gameRef}></div>
      </BevelContainer>
    </div>
  );
};

export default SimulationRenderer;
