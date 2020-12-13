import { act, renderHook } from '@testing-library/react-hooks';

import useUpdatableState, { StateComparator, UpdatableResult } from '.';

const renderer: Renderer<any> = ({ value, changes, comparator }) => {
  const result = useUpdatableState(value, comparator);
  changes?.push(result[2]);
  return result;
}

const propBuilder = <T>(changes: boolean[], comparator?: StateComparator<T>) => (value: T) => ({
  initialProps: { value, changes, comparator }
});

it('returns provided initial value', () => {
  const value = 'foo';
  const changes = [];
  const { result } = renderHook(renderer, propBuilder(changes)(value));
  expect(result.current[0]).toEqual(value);
  expect(changes).toEqual([true, false]);
});

it('returns updated internal value', () => {
  const value = 'foo';
  const changes = [];
  const internalValue = 'bar';
  const { result } = renderHook(renderer, propBuilder(changes)(value));

  act(() => {
    result.current[1](internalValue);
  });

  expect(result.current[0]).toEqual(internalValue);
  expect(changes).toEqual([true, false, false]);
});

it('returns updated internal value when same initial value provided', () => {
  const value = 'foo';
  const changes = [];
  const props = propBuilder(changes);
  const internalValue = 'bar';
  const { result, rerender } = renderHook(renderer, props(value));

  act(() => {
    result.current[1](internalValue);
  });

  rerender(props(value).initialProps);

  expect(result.current[0]).toEqual(internalValue);
  expect(changes).toEqual([true, false, false, false]);
});

it('returns new external value when different initial value provided', () => {
  const value = 'foo';
  const changes = [];
  const props = propBuilder(changes);
  const internalValue = 'bar';
  const newValue = 'baz';
  const { result, rerender } = renderHook(renderer, props(value));

  act(() => {
    result.current[1](internalValue);
  });

  rerender(props(newValue).initialProps);

  expect(result.current[0]).toEqual(newValue);
  expect(changes).toEqual([true, false, false, false, true, false]);
});

it("indicates value hasn't changed when updating after prior external value change", () => {
  const value = 'foo';
  const changes = [];
  const props = propBuilder(changes);
  const internalValue = 'bar';
  const newValue = 'baz';
  const newInternalValue = 'qux';
  const { result, rerender } = renderHook(renderer, props(value));

  act(() => {
    result.current[1](internalValue);
  });

  rerender(props(newValue).initialProps);

  act(() => {
    result.current[1](newInternalValue);
  });

  expect(result.current[0]).toEqual(newInternalValue);
  expect(changes).toEqual([true, false, false, false, true, false, false]);
});

it('returns updated internal value when new initial value is provided that is equal according to a comparator', () => {
  const value: TestValue = { a: 'foo' };
  const changes = [];
  const props = propBuilder<TestValue>(changes, (a, b) => a.a === b.a);
  const internalValue = { a: 'bar' };
  const newValue = { ...value, b: 'baz' };
  const { result, rerender } = renderHook(renderer, props(value));

  act(() => {
    result.current[1](internalValue);
  });

  rerender(props(newValue).initialProps);

  expect(result.current[0]).toEqual(internalValue);
  expect(changes).toEqual([true, false, false, false]);
});

it('returns original value when new initial value is provided that is not equal according to a comparator', () => {
  const value: TestValue = { a: 'foo' };
  const changes = [];
  const props = propBuilder<TestValue>(changes, (a, b) => a.b === b.b);
  const internalValue = { a: 'bar' };
  const newValue = { ...value, b: 'baz' };
  const { result, rerender } = renderHook(renderer, props(value));

  act(() => {
    result.current[1](internalValue);
  });

  rerender(props(newValue).initialProps);

  expect(result.current[0]).toEqual(newValue);
  expect(changes).toEqual([true, false, false, false, true, false]);
});

interface TestValue {
  a: string,
  b?: string
}

interface Renderer<T> {
  ({ value, changes } : { value: T, changes?: boolean[], comparator?: StateComparator<T> }): UpdatableResult<T>;
}

/*
 * Checking for the changes in `changed` was tricky, because testing-library
 * returns after all rerenders are shaken out. So even though the external value
 * changed at one point, and so `changed` returns true, that call to change the
 * `changed` state causes the component to render one more time -- and that last
 * time, `changed` becomes false, because the previous and current values are
 * now identical.
 * 
 * To show that `changed` switched when it was supposed to, we need to track
 * every render cycle. The render cycle looks like this:
 * 
 * 1. Initial value. `changed` is set to `true` as its initial value, as it
 *    indicates that the hook is changing from unused to used.
 * 2. Because `changed` is changed to true as part of checking the predicate,
 *    the hook is rerendered, and the second time through, `changed` is set to
 *    `false`.
 * 3. Whenever internal state is changed, `false` is returned.
 * 4. When the external state is changed, the hook itself is rerun. First it
 *    emits the current value of `changed` (`false`) while checking to see if it
 *    changed. Then it sets `changed` to true, forcing another rerender. That
 *    last rerender reset `changed` to false.
 *
 * The key to all of this is that `changed` changes in the moment, based upon
 * the current render cycle.
 */