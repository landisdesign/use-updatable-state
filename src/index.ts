import { Dispatch, SetStateAction, useState } from 'react';

/**
 * `useState` that updates based on changes to provided value. If `value`
 * changes, the `state` value returned by `useUpdatableState` will reflect the
 * new value. A third array element, `changed`, will be set to `true` for the
 * render cycle that caused the change, as a snapshot indicator that a change
 * took place. Future render cycles will not retain this `true` value.
 * @param value The external value that initially populates `state` and from
 *        where `state` receives updates.
 * @param predicate An optional function (`(value, previous): boolean`) to
 *        compare the current and previous `value` properties. If it returns
 *        `false`, `state` will be updated and `changed` will be `true` until
 *        the component is rendered. If not provided, the new and previous
 *        values will be compared by a strict identity comparison (`===`).
 * @returns `[state, setState, changed]` where `state` and `setState` behave
 *          exactly like with the `useState` hook, including guarantees that
 *          `setState` will not change. `change` will be `true` when `value`
 *          changes between renders.
 */
function useUpdatableState<T>(value: T, predicate: StateComparator<T> = defaultComparator): UpdatableResult<T> {
  // I am explicitly choosing to modify the array returned by useState instead
  // of spreading its contents into a new array, in case React makes any
  // guarantees about the array's identity.
  const stateArray: UpdatableResult<T> = useState(value) as any;
  const [previousValue, setPreviousValue] = useState(value);
  const [isChanged, setChanged] = useState(true);

  if (!predicate(value, previousValue)) {
    setChanged(true);
    stateArray[1](value);
    setPreviousValue(value);
  } else {
    if (isChanged) {
      setChanged(false);
    }
  }
  stateArray[2] = isChanged;
  return stateArray;
}

export default useUpdatableState;

const defaultComparator = <T>(a: T, b: T) => a === b;

export interface StateComparator<T> {
  (a: T | undefined, b: T | undefined): boolean;
}

export type UpdatableResult<T> = [T, Dispatch<SetStateAction<T>>, boolean];
