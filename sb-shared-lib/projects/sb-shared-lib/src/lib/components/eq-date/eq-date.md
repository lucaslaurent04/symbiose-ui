# Angular Material Component Documentation: eq-date

## Overview

The `eq-date` component is a customizable date input component designed for use within Angular Material applications. It allows users to input and manipulate dates efficiently, providing features such as validation, formatting, and optional nullability.

The date is always used in a UTC+0000 format and is displayed in UTC+0000 time zone.

## Usage

The `eq-date` component can be integrated into your Angular application by adding the component selector to your template HTML. Below is an example of how to use the component with its available properties:

```html

<eq-date
    [(value)]="dateInIso8601Utc0"
    [title]="'My title'"
    [placeholder]="'My placeholder'"
    [nullable]="true"
    [hint]="'My hint'"
    [error]="'My error'"
    [mode]="'edit'"
    [disabled]="false"
    [usage]="dateTypeFormatSelected"
></eq-date>
```

## API Reference

### Properties

| Property      | Required | Type                    | Default  | Description                                                                                                 |
|---------------|:--------:|-------------------------|:--------:|-------------------------------------------------------------------------------------------------------------|
| `value`       | Required | `string` \| `null`      |    -     | The date value in ISO 8601 (UTC) format.                                                                    |
| `placeholder` | Optional | `string`                |   `''`   | The placeholder attribute of the input.                                                                     |
| `disabled`    | Optional | `boolean`               | `false`  | Disables the input field.                                                                                   |
| `required`    | Optional | `boolean`               | `false`  | Indicates if the value can return an empty value.                                                           |
| `nullable`    | Required | `boolean`               | `false`  | Indicates whether the component can have a value of `[null]`.                                               |
| `mode`        | Optional | `'view'` \| `'edit'`    | `'view'` | Specifies the context; whether the input is editable (`'edit'`) or only used for viewing (`'view'`).        |
| `title`       | Required | `string`                |    -     | The label for the input.                                                                                    |
| `hint`        | Optional | `string`                |   `''`   | Describes the expected value for the input.                                                                 |
| `error`       | Required | `string`                |    -     | Error message displayed when the input value is invalid. Can only trigger if `required` is set to `'true'`. |
| `usage`       | Required | `string` as `dateUsage` |    -     | Specifies the date format (e.g., 'date.short.day')                                                          |

### Types

#### DateUsage

```typescript
type dateUsage = 'date.short.day' | 'date.short' | 'date.medium' | 'date.long' | 'date.full';
```

### Date formats

```typescript
const DateFormats: Record<dateUsage, string> = {
    'date.short.day': 'ddd DD/MM/YY',
    'date.short': 'DD/MM/YY',
    'date.medium': 'DD/MM/YYYY',
    'date.long': 'ddd DD MMM YYYY',
    'date.full': 'dddd DD MMMM YYYY',
};
```

### Methods

- **formatDate():** Formats the date value based on usage property
- **checkDateValidity(date: string):**  Validates the date string format
- **onBlur(event: FocusEvent): void:** Handles blur event for input focus
- **toggleIsNull(is_null: boolean):** Toggles the null state of the input

### Events

- **valueChange:** Fired when the date value changes. The event payload contains the updated date value.
