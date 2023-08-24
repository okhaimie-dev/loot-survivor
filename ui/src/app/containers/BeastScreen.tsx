import KeyboardControl, { ButtonData } from "../components/KeyboardControls";
import { BattleDisplay } from "../components/beast/BattleDisplay";
import { BeastDisplay } from "../components/beast/BeastDisplay";
import useLoadingStore from "../hooks/useLoadingStore";
import useAdventurerStore from "../hooks/useAdventurerStore";
import { useQueriesStore } from "../hooks/useQueryStore";
import React, { useState } from "react";
import { processBeastName } from "../lib/utils";
import { Battle, NullDiscovery, NullBeast } from "../types";
import { Button } from "../components/buttons/Button";
import { syscalls } from "../lib/utils/syscalls";

/**
 * @container
 * @description Provides the beast screen for adventurer battles.
 */
export default function BeastScreen() {
  const adventurer = useAdventurerStore((state) => state.adventurer);
  const loading = useLoadingStore((state) => state.loading);
  const [showBattleLog, setShowBattleLog] = useState(false);

  const { attack, flee } = syscalls({});

  const hasBeast = useAdventurerStore((state) => state.computed.hasBeast);
  const isAlive = useAdventurerStore((state) => state.computed.isAlive);
  const lastBeast = useQueriesStore(
    (state) => state.data.lastBeastQuery?.discoveries[0] || NullDiscovery
  );
  const beastData = useQueriesStore(
    (state) => state.data.beastQuery?.beasts[0] || NullBeast
  );
  const formatBattles = useQueriesStore(
    (state) => state.data.battlesByBeastQuery?.battles || []
  );

  const [buttonText, setButtonText] = useState("Flee!");

  const handleMouseEnter = () => {
    setButtonText("you coward!");
  };

  const handleMouseLeave = () => {
    setButtonText("Flee!");
  };

  const attackButtonsData: ButtonData[] = [
    {
      id: 1,
      label: "SINGLE",
      action: async () => {
        attack(false, beastData);
      },
      disabled:
        adventurer?.beastHealth == undefined ||
        adventurer?.beastHealth == 0 ||
        loading,
      loading: loading,
    },
    {
      id: 2,
      label: "TILL DEATH",
      mouseEnter: handleMouseEnter,
      mouseLeave: handleMouseLeave,
      action: async () => {
        attack(true, beastData);
      },
      disabled:
        adventurer?.beastHealth == undefined ||
        adventurer?.beastHealth == 0 ||
        loading,
      loading: loading,
    },
  ];

  const fleeButtonsData: ButtonData[] = [
    {
      id: 1,
      label: adventurer?.dexterity === 0 ? "DEX TOO LOW" : "SINGLE",
      action: async () => {
        flee(true, beastData);
      },
      disabled:
        adventurer?.beastHealth == undefined ||
        adventurer?.beastHealth == 0 ||
        loading ||
        adventurer?.level == 1 ||
        adventurer.dexterity === 0,
      loading: loading,
    },
    {
      id: 2,
      label: adventurer?.dexterity === 0 ? "DEX TOO LOW" : "TILL DEATH",
      mouseEnter: handleMouseEnter,
      mouseLeave: handleMouseLeave,
      action: async () => {
        flee(true, beastData);
      },
      disabled:
        adventurer?.beastHealth == undefined ||
        adventurer?.beastHealth == 0 ||
        loading ||
        adventurer?.level == 1 ||
        adventurer.dexterity === 0,
      loading: loading,
    },
  ];

  const beastName = processBeastName(
    beastData?.beast ?? "",
    beastData?.special2 ?? "",
    beastData?.special3 ?? ""
  );

  const BattleLog: React.FC = () => (
    <div className="flex flex-col p-2 items-center">
      <Button
        className="w-1/2 sm:hidden"
        onClick={() => setShowBattleLog(false)}
      >
        Back
      </Button>
      <div className="flex flex-col items-center gap-5 p-2">
        <div className="text-xl uppercase">
          Battle log with {beastData?.beast}
        </div>
        <div className="flex flex-col gap-2 ext-sm overflow-y-auto h-96 text-center">
          {formatBattles.map((battle: Battle, index: number) => (
            <div className="border p-2 border-terminal-green" key={index}>
              <BattleDisplay battleData={battle} beastName={beastName} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (showBattleLog) {
    return <BattleLog />;
  }

  return (
    <div className="sm:w-2/3 sm:h-2/3 flex flex-col sm:flex-row">
      <div className="sm:w-1/2 order-1 sm:order-2">
        {hasBeast ? (
          <>
            <BeastDisplay beastData={beastData} />
          </>
        ) : (
          <div className="flex flex-col items-center border-2 border-terminal-green">
            <p className="m-auto text-lg uppercase text-terminal-green">
              Beast not yet discovered.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 sm:gap-0 items-center sm:w-1/2 sm:p-4 order-1 text-lg">
        {isAlive && (
          <>
            <div className="sm:hidden flex flex-row gap-2 sm:flex-col items-center justify-center">
              <div className="flex flex-col items-center">
                <p className="uppercase sm:text-2xl">Attack</p>
                <KeyboardControl
                  buttonsData={attackButtonsData}
                  size={"sm"}
                  direction="row"
                />
              </div>
              <div className="flex flex-col items-center">
                <p className="uppercase sm:text-2xl">Flee</p>
                <KeyboardControl
                  buttonsData={fleeButtonsData}
                  size={"sm"}
                  direction="row"
                />
              </div>
            </div>
            <div className="hidden sm:block flex flex-row gap-2 sm:flex-col items-center justify-center">
              <div className="flex flex-col items-center">
                <p className="uppercase sm:text-2xl">Attack</p>
                <KeyboardControl
                  buttonsData={attackButtonsData}
                  size={"xl"}
                  direction="row"
                />
              </div>
              <div className="flex flex-col items-center">
                <p className="uppercase sm:text-2xl">Flee</p>
                <KeyboardControl
                  buttonsData={fleeButtonsData}
                  size={"lg"}
                  direction="row"
                />
              </div>
            </div>
          </>
        )}

        <div className="hidden sm:block">
          {(hasBeast || formatBattles.length > 0) && <BattleLog />}
        </div>

        <Button
          className="sm:hidden uppercase"
          onClick={() => setShowBattleLog(true)}
        >
          Battle log with {beastData?.beast}
        </Button>
      </div>
    </div>
  );
}
