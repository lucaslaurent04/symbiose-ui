# Angular Material Component Documentation: eq-date-time

## Overview

The `eq-date-time` component is a customizable date and time picker component designed for Angular Material projects. It allows users to input and display dates and times efficiently with options for editing and viewing.

## Date Handling

1. Input and Output Format: The component expects date and time values in ISO 8601 format with UTC time zone offset (YYYY-MM-DDTHH:mm:ss.sssZ). This format ensures standardization and compatibility across different systems and time zones.
   <br><br>
2. Date Parsing: When receiving a date value, the component parses it into separate date and time components. It extracts the date part and time part from the provided ISO 8601 string.
   <br><br>
3. Time Zone Considerations: The component operates in the UTC time zone to avoid ambiguity and inconsistencies in date and time calculations, especially in scenarios involving users from different time zones.
   <br><br>
4. Validity Check: Before processing the date and time values, the component performs validity checks to ensure that the provided date and time components are valid and correctly formatted.

## Time Handling

1. Time Input: The component provides an input field for selecting the time portion. It accepts time input in the format HH:mm (24-hour format) and validates the input to ensure it conforms to the expected format and ranges (hours: 00-23, minutes: 00-59).
   <br><br>
2. Time Picker: Additionally, the component incorporates a time picker feature to facilitate time selection. Users can interact with the time picker to conveniently choose the desired time.
   <br><br>
3. Timezone Conversion: Since the component operates in UTC, it converts the selected time to UTC before storing it. This conversion ensures consistency and prevents discrepancies when dealing with time values across different time zones.

## Usage

The `eq-date-time` component can be integrated into your Angular project using its selector `eq-date-time`. Below is an example of how to use the component:

```html

<eq-date-time
    [(value)]="dateTimeInIso8601Utc0"
    [title]="'My title'"
    [placeholder]="'My placeholder'"
    [nullable]="true"
    [hint]="'My hint'"
    [error]="'My error'"
    [mode]="'edit'"
    [disabled]="false"
    [usage]="dateTimeTypeFormatSelected"
>
</eq-date-time>
```

## API Reference

### Properties

| Property      | Required | Type                    | Default  | Description                                                                                                  |
|---------------|:--------:|-------------------------|:--------:|--------------------------------------------------------------------------------------------------------------|
| `value`       | Required | `string` \| `null`      |    -     | The date value in ISO 8601 (UTC) format.<br><br> The value is formated like this: `2024-12-31T23:38:46+0000` |
| `placeholder` | Optional | `string`                |   `''`   | The placeholder attribute of the input.                                                                      |
| `disabled`    | Optional | `boolean`               | `false`  | Disables the input field.                                                                                    |
| `required`    | Optional | `boolean`               | `false`  | Indicates if the value can return an empty value.                                                            |
| `nullable`    | Required | `boolean`               | `false`  | Indicates whether the component can have a value of `[null]`.                                                |
| `mode`        | Optional | `'view'` \| `'edit'`    | `'view'` | Specifies the context; whether the input is editable (`'edit'`) or only used for viewing (`'view'`).         |
| `title`       | Required | `string`                |    -     | The label for the input.                                                                                     |
| `hint`        | Optional | `string`                |   `''`   | Describes the expected value for the input.                                                                  |
| `error`       | Required | `string`                |    -     | Error message displayed when the input value is invalid. Can only trigger if `required` is set to `'true'`.  |
| `usage`       | Required | `string` as `dateUsage` |    -     | Specifies the date format (e.g., 'date.short.day')                                                           |

### Types

#### DateTimeUsage

```typescript
type dateTimeUsage =
    | 'datetime.short'
    | 'datetime.medium'
    | 'datetime.long'
    | 'datetime.full';
```

### DateTimeFormats

```typescript
const DateTimeFormats: Record<dateTimeUsage, string> = {
    'datetime.short': 'DD/MM/YY HH:mm',
    'datetime.medium': 'DD/MMM/YYYY HH:mm',
    'datetime.long': 'ddd DD MMM YYYY HH:mm',
    'datetime.full': 'dddd DD MMMM YYYY HH:mm'
};
```

### Methods

- **activate():** Activates the component for editing.
- **onFocusInputTime(event):** Handles focus events on the time input field.
- **focusInput(input):** Sets focus on the specified input field.
- **onBlur(event):** Handles blur events on the component.
- **onCancel(event):** Cancels any changes made to the component.
- **onClear(event):** Clears the input values.
- **onSave(event):** Saves the current input values.

### Events

- **valueChange:** Emitted when the value of the component changes.
