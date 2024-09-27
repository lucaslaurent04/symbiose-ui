# SharedLib

This library holds the common code to the Symbiose UI Apps: Angular basic modules & Angular Material Components.


## Scripting Convention

* Indentation with 4 spaces (no tabs)
* Explicit use of visibility marker (`public`, `private`)
* Explicit use of statement separator (`;`)
* There is always only one statement separator per line
* Multi-line statements are indented
* Conditions (`if`) are always written on a minimum of 2 lines (no inliner)
* Variable names follow the eQual convention : `snake_case` for scalar variables and `camelCase` for non-scalar members and methods, `PascalCase` for classes
* Functions that are not called in the front-end have private visibility
* Calls containing an await with a service return are enclosed by a `try...catch` block
* Front-end modifications requiring a back-end Request response first apply the visual change and then rollback in case of failure
* For imports, use absolute paths (i.e., starting from `src/`) and avoid relative paths. Examples: good: `src/app/_services/type-usage.service`, bad: `../../../_models/Menu`
* In the _models folders, define only one Model (class) per file
* No use of anonymous non-scalar types (e.g. `{ ok: boolean; id_list: string[]; }`). If necessary, create a distinct model

## API calls

SharedLib comes with an ApiService offering many built-in methods:
* fetch(=GET) call (=POST)
* CRUD : create(), read(), update(), delete(), archive(), clone(), collect()
* along with a series of getters made for building eQual request.

This service handles many specifics for easy communications with eQual server and should almost always be preferred to custom calls.

All methods from this service return Promise objects, that should always be called using `await` and placed, in calling code, within a `try...catch` block.

## Organization of Components and Routing Modules

In an Angular project, components are hierarchically organized to match the application's paths. This organization allows easy identification of a route by following the folder structure.

Each level of the component tree is associated with a specific routing module.
This structure provides a clear and maintainable organization of the application, facilitating the development and management of routes.

**Example:**

For the route `#/a/b/c` in the application, the corresponding path in the project's file structure would be `src/app/in/a/b/c`.

Each routing module configures the routes for the components at its level and can also load child modules for lower levels.

This means that:

- There is a routing module to handle routes starting with `/a`.
- Another module for the routes of `/a/b`.
- And so on, up to `/a/b/c`.

Shared resources are stored in folders prefixed with an underscore, so as not to confuse them with routes.

Examples:
`_modules`  
`_components`  
`_dialogs`  
`_services`  
`_models`

Resources are always shared at the lowest level likely to contain components that use them.

A module modeling a route should never export components.

## Component slicing

As a general rule, a component **should remain "slim"**.  
A typical component should include the details of the elements it comprises;  
These elements can, in turn, be components. If they are shared components, they are declared in a `_components` subfolder.

Except for rare cases, components do not use list-type sub-components.

Example for my-component.component.html:

```html
<sub-items-list [items]="items"></sub-items-list>
```

Instead, the component that models the sub-elements is used directly:

```html
<sub-item *ngFor="let item of items">
[...]
</sub-item>
```

Except in rare cases, the MatTable component is not used (as it reduces readability and makes the layout less flexible), and lists using flex elements are preferred (ensuring they are responsive).

**When passing parameters from one component to another**, the conversion should be limited to a leaf component.

componentA > componentB > componentC

If componentA has a list of items, and componentC is responsible for displaying and editing an item, the following should occur:

* componentB should relay an item
* componentC should receive an item (and not just a part of it)
* componentC should return an item (event emit)

## Component Naming Conventions

* Components always have the suffix .component, followed by the file extension
* Dialog-type components are suffixed with '-dialog' and placed in a _dialogs subfolder
* Component names follow the route hierarchy


## Material Components

* In each application module, import ShareLib, which declares all Material components
* No use of MatTable, unless (rare) specific cases

## Data Sharing

* No transfer of information from children to parents in any way other than via events (e.g. "(onCustomEvent)")
* Use of services for data sharing.
* Child components can load data from the server only if they model a list.
    In the case of child components, they should receive data from their parent.

## CSS

* Systematic use of DOM shadowing (`@Component{ encapsulation : ViewEncapsulation.Emulated }`)
* Declaration of rules in a nested manner (within `:host {}`)
* Class names are always as explicit and simple as possible
* Naming is based on the role of an element (and not on its representation - e.g., "topmarg-10", "max-height")
* Centralization of variable declarations in the theme or global style
* No programming (mixins) within scss files (except for root style)

## Debugging

```
#!/bin/bash
rm -rf .angular
npm link sb-shared-lib
# Windows : ng build --configuration development --output-hashing none --base-href="//workbench\\"
```

Full output can be viewed by redirecting STDERR
```
$ ./build.sh > angular.log 2>&1
```
