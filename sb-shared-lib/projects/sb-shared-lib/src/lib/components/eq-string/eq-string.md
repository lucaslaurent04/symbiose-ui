# eq-string component Documentation

## Overview

The `eq-string` component is an Angular Material input component with extended functionality. It supports various actions such as clearing the input, resetting to the original value, and saving the value as null or an empty string. This component is designed to provide a flexible and interactive user experience for handling string values.
<br><br>
<p align="center" width="100%">
<img align="center" src="./doc/eq-string.gif" alt="eq-string preview">
</p>

## Usage

To use the `eq-string` component, include the following code in your Angular template:

```html

<eq-string
    [value]="'My value'"
    [title]="'My title'"
    [placeholder]="'My placeholder'"
    [hint]="'My hint'"
    [disabled]="false"
    [required]="true"
    [mode]="'edit'"
    [size]="'small'"
    [error]="'My error'"
></eq-string>
```

## API Reference

### Properties

| Property      |  Required  | Type                                              |  Default   | Description                                                                                                 |
|---------------|:----------:|---------------------------------------------------|:----------:|-------------------------------------------------------------------------------------------------------------|
| `value`       |  Required  | `string` \| `null`                                |     -      | The value to be handled by the component.                                                                   |
| `placeholder` |  Optional  | `string`                                          |    `''`    | The placeholder attribute of the input.                                                                     |
| `disabled`    |  Optional  | `boolean`                                         |  `false`   | Disables the input field.                                                                                   |
| `required`    |  Optional  | `boolean`                                         |  `false`   | Indicates if the value can return an empty value.                                                           |
| `nullable`    |  Required  | `boolean`                                         |  `false`   | Indicates whether the component can have a value of `[null]`.                                               |
| `mode`        |  Optional  | `'view'` \| `'edit'`                              |  `'view'`  | Specifies the context; whether the input is editable (`'edit'`) or only used for viewing (`'view'`).        |
| `title`       |  Required  | `string`                                          |     -      | The label for the input.                                                                                    |
| `hint`        |  Optional  | `string`                                          |    `''`    | Describes the expected value for the input.                                                                 |
| `error`       |  Required  | `string`                                          |     -      | Error message displayed when the input value is invalid. Can only trigger if `required` is set to `'true'`. |
| `size`        |  Optional  | `'small'` \| `'normal'` \| `'large'` \| `'extra'` | `'normal'` | The sizing for styling purposes (small, normal, large, or extra).                                           |

### Methods

- **onClear(event: MouseEvent):** Clears the input value.
- **activate():** Activates the input for editing.
- **onCancel(event: MouseEvent):** Cancels the editing and reverts to the original value.
- **onSave(event: MouseEvent):** Saves the input value.
- **onBlur(event: FocusEvent):** Handles the blur event, discarding changes if needed.

### Events

- **valueChange:** Emitted when the value changes.
