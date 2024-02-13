# Angular Material Component Documentation: eq-m2o

## Overview

The `eq-m2o` component is an Angular Material component designed to provide a user-friendly interface for selecting an item from a predefined list. It offers features like autocomplete functionality and customizable styling.

## Usage

To use the `eq-m2o` component, simply include it in your Angular project's HTML template with appropriate input bindings. Here's an example demonstrating its usage:

```html

<eq-m2o
    [mode]="mode"
    [entity]="'cooking\\Ingredient'"
    [fields]="m2oFields"
    [controller]="'model_collect'"
    [placeholder]="'My placeholder'"
    [title]="'My title'"
    [hint]="'My hint'"
    [autofocus]="true"
    [noResult]="'No match found"
    [initialSelectedItem]="{description: 'Onions are a nutrient-dense food, meaning that whi…y value for vitamin C, vitamin B-6 and manganese.', name: 'onion', id: 2, state: 'instance', modified: '2024-02-08T08:29:19+00:00'}"
></eq-m2o>
```

## API Reference

### Properties

| Property            | Required |        Type        | Default | Description                                                             |
|---------------------|:--------:|:------------------:|---------|-------------------------------------------------------------------------|
| mode                | Optional |  'view' \| 'edit'  | 'view'  | Specifies the mode of the component, whether it's in view or edit mode. |
| disabled            | Optional |      boolean       | false   | Specifies whether the input field is disabled.                          |
| required            | Optional |      boolean       | false   | Specifies whether the input field is required.                          |
| entity              | Required |       string       | ''      | The full name of the entity to load.                                    |
| id                  | Optional |       number       | 0       | The id of the selected item.                                            |
| domain              | Optional |       string       | []      | Additional condition for filtering result set                           |
| fields              | Optional |      string[]      | []      | Extra fields to load in addition to 'id' and 'name'.                    |
| controller          | Optional |       string       | ''      | Specific controller to use for fetching data.                           |
| params              | Optional |        any         | -       | Extra parameter specific to the chosen controller                       |
| placeholder         | Optional |       string       | ''      | Specific placeholder text for the input field.                          |
| title               | Optional |  string   \| null  | -       | -                                                                       | Specific title for the widget.                                          |
| hint                | Optional |       string       | ''      | Specific hint/helper text for the widget.                               |
| autofocus           | Optional |      boolean       | false   | Specifies whether the input field should autofocus.                     |
| noResult            | Optional |       string       | ''      | Message to display in case no match was found.                          |
| initialSelectedItem | Optional |        any         | null    | The initial item selected in the component.                             |
| displayWith         | Optional | (a: any) => string | -       | custom method for rendering the items.                                  |
| panelWidth          | Optional |       string       | 'auto'  | css value for panel width (dropdown)                                    |

### Methods

- `onFocus()`: Method triggered when the input field gains focus.
- `onClear()`: Method triggered to clear the current value.
- `onBlur(event: FocusEvent)`: Method triggered when the input field loses focus.
- `onSelect(event: any)`: Method triggered when an option is selected from the autocomplete.
- `onRestore()`: Method triggered to restore to the initial value.
- `oncloseAutocomplete()`: Method triggered to close the autocomplete panel.
- `onCancel(event: MouseEvent)`: Method triggered when canceling an action.
- `onSave(event: MouseEvent)`: Method triggered when saving an action.

### Events

- `itemSelected`: Event emitted when an item is selected.
- `blur`: Event emitted when the input field loses focus.
