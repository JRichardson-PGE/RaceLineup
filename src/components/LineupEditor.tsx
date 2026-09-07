"use client";

import { useActionState, useState } from "react";
import { saveLineupAction, type LineupFormState } from "@/actions/lineup";

type ClassEntryDraft = {
  className: string;
  numRacers: number;
};

type GateDropDraft = {
  gateNumber: number;
  classEntries: ClassEntryDraft[];
};

export type RaceDraft = {
  raceNumber: number;
  laps: number;
  gateDrops: GateDropDraft[];
};

function emptyClassEntry(): ClassEntryDraft {
  return { className: "", numRacers: 0 };
}

function emptyGateDrop(gateNumber: number): GateDropDraft {
  return { gateNumber, classEntries: [emptyClassEntry()] };
}

function emptyRace(raceNumber: number): RaceDraft {
  return { raceNumber, laps: 1, gateDrops: [emptyGateDrop(1)] };
}

function move<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

const initialState: LineupFormState = {};

const inputClasses =
  "rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900";
const smallButtonClasses =
  "rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent";

export function LineupEditor({
  eventId,
  initialRaces,
}: {
  eventId: string;
  initialRaces: RaceDraft[];
}) {
  const [races, setRaces] = useState<RaceDraft[]>(
    initialRaces.length > 0 ? initialRaces : [emptyRace(1)]
  );
  const [state, formAction, pending] = useActionState(
    saveLineupAction,
    initialState
  );

  function updateRace(raceIndex: number, updater: (race: RaceDraft) => RaceDraft) {
    setRaces((prev) =>
      prev.map((race, i) => (i === raceIndex ? updater(race) : race))
    );
  }

  function updateGate(
    raceIndex: number,
    gateIndex: number,
    updater: (gate: GateDropDraft) => GateDropDraft
  ) {
    updateRace(raceIndex, (race) => ({
      ...race,
      gateDrops: race.gateDrops.map((gate, i) =>
        i === gateIndex ? updater(gate) : gate
      ),
    }));
  }

  function updateEntry(
    raceIndex: number,
    gateIndex: number,
    entryIndex: number,
    updater: (entry: ClassEntryDraft) => ClassEntryDraft
  ) {
    updateGate(raceIndex, gateIndex, (gate) => ({
      ...gate,
      classEntries: gate.classEntries.map((entry, i) =>
        i === entryIndex ? updater(entry) : entry
      ),
    }));
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="lineup" value={JSON.stringify({ races })} />

      <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
        Saving resets the live position back to the start of the lineup.
      </div>

      <ol className="flex flex-col gap-4">
        {races.map((race, raceIndex) => (
          <li
            key={raceIndex}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Race #
                </label>
                <input
                  type="number"
                  min={1}
                  className={`${inputClasses} w-20`}
                  value={race.raceNumber}
                  onChange={(e) =>
                    updateRace(raceIndex, (r) => ({
                      ...r,
                      raceNumber: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Laps
                </label>
                <input
                  type="number"
                  min={1}
                  className={`${inputClasses} w-20`}
                  value={race.laps}
                  onChange={(e) =>
                    updateRace(raceIndex, (r) => ({
                      ...r,
                      laps: Number(e.target.value),
                    }))
                  }
                />
                <span className="text-xs text-gray-500">
                  (all gates in this race)
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  className={smallButtonClasses}
                  disabled={raceIndex === 0}
                  onClick={() => setRaces((prev) => move(prev, raceIndex, -1))}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className={smallButtonClasses}
                  disabled={raceIndex === races.length - 1}
                  onClick={() => setRaces((prev) => move(prev, raceIndex, 1))}
                >
                  Move down
                </button>
                <button
                  type="button"
                  className={`${smallButtonClasses} border-red-300 text-red-600 hover:bg-red-50`}
                  disabled={races.length === 1}
                  onClick={() =>
                    setRaces((prev) => prev.filter((_, i) => i !== raceIndex))
                  }
                >
                  Remove race
                </button>
              </div>
            </div>

            <ol className="mt-3 flex flex-col gap-3">
              {race.gateDrops.map((gate, gateIndex) => (
                <li
                  key={gateIndex}
                  className="rounded-md bg-black/[.03] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        Gate Drop #
                      </label>
                      <input
                        type="number"
                        min={1}
                        className={`${inputClasses} w-16`}
                        value={gate.gateNumber}
                        onChange={(e) =>
                          updateGate(raceIndex, gateIndex, (g) => ({
                            ...g,
                            gateNumber: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className={smallButtonClasses}
                        disabled={gateIndex === 0}
                        onClick={() =>
                          updateRace(raceIndex, (r) => ({
                            ...r,
                            gateDrops: move(r.gateDrops, gateIndex, -1),
                          }))
                        }
                      >
                        Move up
                      </button>
                      <button
                        type="button"
                        className={smallButtonClasses}
                        disabled={gateIndex === race.gateDrops.length - 1}
                        onClick={() =>
                          updateRace(raceIndex, (r) => ({
                            ...r,
                            gateDrops: move(r.gateDrops, gateIndex, 1),
                          }))
                        }
                      >
                        Move down
                      </button>
                      <button
                        type="button"
                        className={`${smallButtonClasses} border-red-300 text-red-600 hover:bg-red-50`}
                        disabled={race.gateDrops.length === 1}
                        onClick={() =>
                          updateRace(raceIndex, (r) => ({
                            ...r,
                            gateDrops: r.gateDrops.filter(
                              (_, i) => i !== gateIndex
                            ),
                          }))
                        }
                      >
                        Remove gate
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-col gap-2">
                    {gate.classEntries.map((entry, entryIndex) => (
                      <div
                        key={entryIndex}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <input
                          type="text"
                          placeholder="Class name"
                          className={`${inputClasses} min-w-40 flex-1`}
                          value={entry.className}
                          onChange={(e) =>
                            updateEntry(raceIndex, gateIndex, entryIndex, (c) => ({
                              ...c,
                              className: e.target.value,
                            }))
                          }
                        />
                        <label className="flex items-center gap-1 text-xs text-gray-600">
                          Racers
                          <input
                            type="number"
                            min={0}
                            className={`${inputClasses} w-16`}
                            value={entry.numRacers}
                            onChange={(e) =>
                              updateEntry(raceIndex, gateIndex, entryIndex, (c) => ({
                                ...c,
                                numRacers: Number(e.target.value),
                              }))
                            }
                          />
                        </label>
                        <button
                          type="button"
                          className={`${smallButtonClasses} border-red-300 text-red-600 hover:bg-red-50`}
                          disabled={gate.classEntries.length === 1}
                          onClick={() =>
                            updateGate(raceIndex, gateIndex, (g) => ({
                              ...g,
                              classEntries: g.classEntries.filter(
                                (_, i) => i !== entryIndex
                              ),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className={`${smallButtonClasses} self-start`}
                      onClick={() =>
                        updateGate(raceIndex, gateIndex, (g) => ({
                          ...g,
                          classEntries: [...g.classEntries, emptyClassEntry()],
                        }))
                      }
                    >
                      + Add class
                    </button>
                  </div>
                </li>
              ))}
              <button
                type="button"
                className={`${smallButtonClasses} self-start`}
                onClick={() =>
                  updateRace(raceIndex, (r) => ({
                    ...r,
                    gateDrops: [
                      ...r.gateDrops,
                      emptyGateDrop(r.gateDrops.length + 1),
                    ],
                  }))
                }
              >
                + Add gate drop
              </button>
            </ol>
          </li>
        ))}
      </ol>

      <button
        type="button"
        className="self-start rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        onClick={() =>
          setRaces((prev) => [...prev, emptyRace(prev.length + 1)])
        }
      >
        + Add race
      </button>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save lineup"}
      </button>
    </form>
  );
}
