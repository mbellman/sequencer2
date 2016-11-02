# Project + Code Pattern Rules
If a rule is explicitly listed here, use it! If a rule is not explicitly listed here (or is open to some interpretation), exercise your best judgment.

The guidelines laid out here are not **absolute**, but where exceptions are made those exceptions should be justified.

## Folders
1. All folder names should be lowercased.
2. All TypeScript/JavaScript files should be somewhere within the `src` directory.
3. All **externally-sourced** TypeScript/JavaScript files or libraries should be somewhere within the `src/ext` directory.

## Files
1. All files names should be capitalized.
2. Where a **default** module is exported by a file, the filename should be named after the module.
3. Where multiple **named** modules are exported by a file, the filename should be contextually descriptive, or named after the module of greatest importance.

## Imports
1. **Default** module imports should precede **named** module exports.
2. The **default** imports list and and the **named** imports list should be separated by a line break.

```typescript
import MyClass from "src/app/MyClass";
import SomeModule from "src/app/SomeModule";

import { helper } from "src/core/Utils";
import { method, value } from "src/core/Tools";
```

## Exports
1. Single-export files should export their modules as **default**.
2. Multi-export files should export only **named** modules and no **default** modules.

```typescript
export default class MyClass {}
```

```typescript
export function method () {}

export const value: string = "Hello";
```

## Styles
1. All class variables, `vars`, `lets`, and `consts` should be typed using the form: `var myValue: number`.
2. Variables in the top block scope of a class method or function should be `var`, and any variables within sub block scopes should be `let`.
3. All class methods or functions should be typed using the form: `function myFunction (): void`.

## Classes
### Naming conventions
1. All class names should use capitalized CamelCase.
2. All class member names should use lowercased camelCase.
3. Class variable names should be as descriptive as possible. If a variable is of a class or interface type, its name should be the camelCased equivalent of the class or interface name, e.g. `public someModule: SomeModule = new SomeModule();`. If a variable is one of several of a particular class or interface type, defer to a contextually descriptive choice.
4. Class method names should clearly define their role. Avoid names which are terse or vague. **No shorthand or abbreviation is permitted**.
5. If a class method:
    * Performs an action, its name should start with a verb, e.g. `updateCurrentState`.
    * Retrieves a value, its name should start with "get", e.g. `getSomeValue`.
    * Returns a boolean, its name should start with an auxiliary verb, e.g. `isLoaded`, `hasState`, `shouldRun`.
    * Represents an event method, it should start with "on", e.g. `onUpdate`.

### Order and priority
1. Class variables should precede class methods.
2. The order of access modifiers should be as follows: `public`, `protected`, `private`.
3. The `constructor` method should precede all other class methods.
4. `get` and `set` methods should precede all standard class methods.
5. Standard methods which retrieve or set values should precede all remaining methods.
6. Methods using the name pattern "on{Event}" should precede all remaining methods.

### Access Modifiers
1. All public members should be labelled as `public` with the exception of the constructor method.
2. All getter and setter methods should be labelled as `public`.

## Interfaces
1. All `interface` names should use capitalized CamelCase.
2. An `interface` name can be changed to use the form ICamelCase where a default class implementation also shares its name, but otherwise should omit the preceding "I".

## Functions
1. All `function` names should use lowercased camelCase.

## Types
1. All `type` names should use capitalized CamelCase.

## Enums
1. All `enum` names should use capitalized CamelCase.
2. All `enum` property names should use all-capitalized SNAKE_CASE.

## Variables and Constants
1. All variable names should use camelCase.
2. All `const` names should use all-capitalized SNAKE_CASE.

## Comments
1. Always add a header comment for `classes`, class methods, class variables, `interfaces`, interface properties, `functions`, `types`, `enums`, and `vars`/`consts` in the module or global scope. Even if the purpose of a construct seems obvious, it's safer to avoid any ambiguity. Comments at regular intervals also impart a certain visual consistency to the look of the code.
2. Use comments sparingly inside `functions` or class methods. If you are tempted to use a comment to describe a particular control flow within the function, see if it can be explained as part of the function's header comment. For exceedingly long functions or algorithms, comments may indeed be necessary for clarification or exposition.

`class`, class member, `interface`, `function`, `enum`, and `type` header comments should be of the style:

```typescript
/**
 * ...
 */
 class MyClass {
     /**
      * ...
      */
     public doSomething (): void {

     }
 }

/**
 * ...
 */
interface MyInterface {

}

/**
 * ...
 */
function myFunction (): void {

}

/**
 * ...
 */
enum MyEnum {
    ONE,
    TWO,
    THREE
}

/**
 * ...
 */
type Key = string | number;
```

Class variable, `var`, `const`, and `type` header comments should be of the style:

```typescript
class SomeClass {
    /* ... */
    private secret: string;
}

/* ... */
var myNumber: number = 5;

/* ... */
const MY_CONSTANT: string = "Constant string";
```

If a class variable, `var`, or `const` header comment spans multiple lines, the following comment style is fine:

```typescript
/**
 * ...
 */
```