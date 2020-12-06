# `useUpdatableState` — A Custom Hook to Keep Track of Changes to State

If you have state you want to change in a component, that you also want
updated when incoming properties change, `useUpdatableState` lets you change
your state until new properties come into the component.

## Installation

```
npm i use-updatable-state
```
or
```
yarn add use-updatable-state
```

## Usage
```js
import React from 'react';
import useUpdatableState from 'use-updatable-state';

function Component({ value, onChange }) {
  const [internalValue, setInternalValue, valueChanged] = useUpdatableState(value);

  const internalOnChange = e => {
    setInternalValue(e.currentTarget.value);
  };

  return (
    <>
      <div>
        Value: From {value} to <input type="text" value={internalValue} onChange={internalOnChange} />
      <div>
      <div>
        <button onClick={onChange(internalValue)}>Update</button>
        {valueChanged && <span style={{ color: 'red' }}>Value updated</span>}
      </div>
    </>
  )
}
```
