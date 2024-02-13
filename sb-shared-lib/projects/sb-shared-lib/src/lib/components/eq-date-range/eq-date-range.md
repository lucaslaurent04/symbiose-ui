# Documentation for eq-date-range Angular Material Component

## Overview

The `eq-date-range` component is a custom Angular Material component designed to facilitate the selection of date ranges in Angular applications. It provides an intuitive interface for users to input date ranges and supports various configurations to suit different use cases.

The date is always used in a UTC+0000 format and is displayed in UTC+0000 time zone.

## Usage

The `eq-date-range` component can be integrated into Angular templates using its selector. Here's an example of how to use the component:

```html

<eq-date-range
    [(value)]="dateRange"
    [title]="'My title'"
    [placeholder]="'My placeholder'"
    [nullable]="true"
    [hint]="'My hint'"
    [error]="'My error'"
    [mode]="'edit'"
    [disabled]="false"
    [usage]="dateTypeFormatSelected"
></eq-date-range>
```

## API Reference

### Properties

| Property      | Required | Type                    | Default  | Description                                                                                                                             |
|---------------|:--------:|-------------------------|:--------:|-----------------------------------------------------------------------------------------------------------------------------------------|
| `value`       | Required | `string` \| `null`      |    -     | The date value in ISO 8601 (UTC) format.<br><br> The value is formated like this: `2024-12-31T23:38:46+0000 - 2025-01-05T00:00:00+0000` |
| `placeholder` | Optional | `string`                |   `''`   | The placeholder attribute of the input.                                                                                                 |
| `disabled`    | Optional | `boolean`               | `false`  | Disables the input field.                                                                                                               |
| `required`    | Optional | `boolean`               | `false`  | Indicates if the value can return an empty value.                                                                                       |
| `nullable`    | Required | `boolean`               | `false`  | Indicates whether the component can have a value of `[null]`.                                                                           |
| `mode`        | Optional | `'view'` \| `'edit'`    | `'view'` | Specifies the context; whether the input is editable (`'edit'`) or only used for viewing (`'view'`).                                    |
| `title`       | Required | `string`                |    -     | The label for the input.                                                                                                                |
| `hint`        | Optional | `string`                |   `''`   | Describes the expected value for the input.                                                                                             |
| `error`       | Required | `string`                |    -     | Error message displayed when the input value is invalid. Can only trigger if `required` is set to `'true'`.                             |
| `usage`       | Required | `string` as `dateUsage` |    -     | Specifies the date format (e.g., 'date.short.day')                                                                                      |

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

- **activate() :** Activates the date range component for editing if the mode is set to 'edit' and the component is not disabled.


- **toggleIsNull(is_null: boolean) :** Toggles the null state of the date range component. If `is_null` is true, it sets the component's value to null. If `is_null` is false, it updates the component's value based on the current input.


- **onBlur(event: FocusEvent) :** Handles the blur event on the component. If the event occurs outside the component, it deactivates the editing mode and updates the component's value if necessary.


- **onCancel(event: MouseEvent) :** Handles the cancellation of editing mode. It resets the component's value to the previous one.


- **onClear(event: MouseEvent) :** Handles the clearing of the component's value. It sets the value to an empty string.


- **onSave(event: MouseEvent) :** Handles the saving of the component's value. If the value is not null and the form is valid, it emits the updated value.


- **formatDate(dateValue: string): string :** Formats the provided date value based on the specified usage. It returns a formatted string representing the date.


- **checkDateValidity(date: string): boolean: :** Checks the validity of the provided date string. Returns true if the date string is valid; otherwise, returns false.


- **sanitizeDate(date: string): string :** Sanitizes the provided date string to ensure it is in a valid format for processing.


- **convertToUTC(date: Date): Date :** Converts the provided date to UTC format.

### Events

- **valueChange:** Emitted when the value changes.
