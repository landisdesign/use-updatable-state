# `useUpdatableState` — A Custom Hook to Keep Track of Changes to State

If you have state you want to change in a component, that you also want
updated when incoming properties change, `useUpdatableState` lets you change
your state internally until new properties come into the component. At that
point, state is updated by the external value, and you can choose to be notified
when that happens.

## Installation

```
npm i use-updatable-state
```
or
```
yarn add use-updatable-state
```

## Usage
By default, you would use it just like `useState()`, passing a value to it and
receiving a tuple:

```jsx
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

### Using predicates to control what is considered equivalent
By default, `useUpdatableState()` will do a strict equality comparison (`===`) to
determine if the value changed or not. If you need finer grain control, you can
pass a predicate as a second argument:

```js
const predicate = (a, b) => a.name === b.name;
const [complexValue, setComplexValue, valueChanged] = useUpdatableState(value, predicate);
```

The above snippet would only overwrite `complexValue` if `value.name` changed.
Note this means that, even if other properties in `value` changed, as long as
`value.name` didn't change, `complexValue` won't be updated to reflect those
changes. Use this feature cautiously.

### Being notified of state changes
The third array element, `valueChanged`, is a boolean property that indicates
when the state has been updated to reflect the new value. It will be `true` when
the state is updated based upon the incoming value. It will be `false`
immediately afterwards, as the hook is re-run after the state, so it can't be
used on its own to generate different output. It can be used, however, to
trigger other changes, such as being part of a dependency array for a
`useEffect` Hook.