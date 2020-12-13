import { act, renderHook } from '@testing-library/react-hooks';

import useUpdatableState from '.';

it('returns provided initial value', () => {
  const value = 'foo';
  const { result } = renderHook(() => useUpdatableState(value));
  expect(result.current[0]).toEqual(value);
});

it('returns updated internal value', () => {
  const value = 'foo';
  const internalValue = 'bar';
  const { result } = renderHook(({ value }) => useUpdatableState(value), { initialProps: { value }});

  act(() => {
    result.current[1](internalValue);
  });

  expect(result.current[0]).toEqual(internalValue);
  expect(result.current[2]).toBe(false);
});

it('returns updated internal value when same initial value provided', () => {
  const value = 'foo';
  const internalValue = 'bar';
  const { result, rerender } = renderHook(({ value }) => useUpdatableState(value), { initialProps: { value }});

  act(() => {
    result.current[1](internalValue);
  });

  rerender({ value });

  expect(result.current[0]).toEqual(internalValue);
  expect(result.current[2]).toBe(false);
});

it('returns new external value when different initial value provided', () => {
  const value = 'foo';
  const internalValue = 'bar';
  const newValue = 'baz';
  const { result, rerender } = renderHook(({ value }) => useUpdatableState(value), { initialProps: { value }});

  act(() => {
    result.current[1](internalValue);
  });

  rerender({ value: newValue });

  expect(result.current[0]).toEqual(newValue);
  expect(result.current[2]).toBe(true);
});

it("indicates value hasn't changed when updating after prior external value change", () => {
  const value = 'foo';
  const internalValue = 'bar';
  const newValue = 'baz';
  const newInternalValue = 'qux';
  const { result, rerender } = renderHook(({ value }) => useUpdatableState(value), { initialProps: { value }});

  act(() => {
    result.current[1](internalValue);
  });

  rerender({ value: newValue });

  act(() => {
    result.current[1](newInternalValue);
  });

  expect(result.current[0]).toEqual(newInternalValue);
  expect(result.current[2]).toBe(false);
});

it('returns updated internal value when new initial value is provided that is equal according to a comparator', () => {
  const value = { a: 'foo' };
  const internalValue = { a: 'bar' };
  const newValue = { ...value, b: 'baz' };
  const { result, rerender } = renderHook(({ value }) => useUpdatableState(value, (a, b) => a.a === b.a), { initialProps: { value }});

  act(() => {
    result.current[1](internalValue);
  });

  rerender({ value: newValue });

  expect(result.current[0]).toEqual(internalValue);
  expect(result.current[2]).toBe(false);
});

it('returns original value when new initial value is provided that is not equal according to a comparator', () => {
  const value: TestValue = { a: 'foo' };
  const internalValue = { a: 'bar' };
  const newValue = { ...value, b: 'baz' };
  const { result, rerender } = renderHook(({ value }) => useUpdatableState(value, (a, b) => a.b === b.b), { initialProps: { value }});

  act(() => {
    result.current[1](internalValue);
  });

  rerender({ value: newValue });

  expect(result.current[0]).toEqual(newValue);
  expect(result.current[2]).toBe(true);
});

interface TestValue {
  a: string,
  b?: string
}
