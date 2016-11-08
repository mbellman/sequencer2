# Project + Code Pattern Rules
If a rule is explicitly listed here, use it! If a rule is not explicitly listed here (or is open to some interpretation), exercise your best judgment.

The guidelines laid out here are not absolute, but where exceptions are made those exceptions should be justified.

## Folders
1. All folder names should be lowercased.
2. All TypeScript/JavaScript files should be somewhere within the `src` directory.
3. The `src/plugins` folder is meant to contain modules which are less project-specific, but do not constitute aspects of the core framework implementation: reusable components, widgets, and so on.
4. All **externally-sourced** modules or libraries should be housed within the `src/plugins/external` directory.

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
import { VALUE, method } from "src/core/Tools";
```

## Exports
1. Single-export files should export their modules as **default**.
2. Multi-export files should export only **named** modules and no **default** modules.

```typescript
export default class MyClass {}
```

```typescript
export const VALUE: string = "Hello";

export function method () {}
```

## Styles
1. All class variables, class method and function parameters, `vars`, `lets`, and `consts` should be strongly typed using the form: `name: T`.
2. All class methods or `functions` should be strongly typed using the form: `myFunction (): T`.
3. Array types should use the form `Array<T>`.

### Formatting
Curly braces should sit on the same line as their `class`/`function`/control structure/etc.:

```typescript
if (condition) {
    // ...
} else if (condition2) {
    // ...
} else {
    // ...
}

function myFunction (): void {
    // ...
}

class MyClass {
    // ...
}
```

Arrays and property lists assigned with multiple items should be formatted as follows:

```typescript
var myArray: Array<any> = [
    item1,
    item2,
    item3
];

var myObject: any = {
    prop1: item1,
    prop2: item2,
    prop3: item3
};
```

Class variables and methods should be appropriately [commented](#comments) and separated by a line break:

```typescript
class MyClass {
    /* Some variable */
    public myString: string;

    /* Some other variable */
    public myNumber: number;

    /**
     * Some method
     */
    public myMethod (): void {

    }

    /**
     * Some other method
     */
    public otherMethod (): void {

    }
}
```

Interface variable/method declarations should be appropriately [commented](#comments) and separated by a line break:

```typescript
interface MyInterface {
    /* Variable */
    someValue: string;

    /* Method */
    someMethod (): void;
}
```

## Classes
### Naming conventions
1. All class names should use capitalized CamelCase.
2. All class member names (variables or methods) should use lowercased camelCase.
3. Class variable names should be as descriptive as possible. If a variable is of a specific type, its name should ideally be the lowercased camelCase equivalent of the type name, e.g. `public someModule: SomeModule = new SomeModule()`. If a variable is one of several of a particular class or interface type, defer to a contextually descriptive choice.
4. Class method names should clearly define their role. Avoid names which are terse or vague. Exceptions should only be in the event of making an API elegant to use.
5. If a class method:
    * Performs an action, its name should start with a verb, e.g. `updateCurrentState`, `renderItems`.
    * Retrieves a value (and is not just a `getter`), its name should start with "get", e.g. `getSomeValue`.
    * Returns a boolean, its name should start with an auxiliary verb, e.g. `isLoaded`, `hasState`, `shouldRun`.
    * Represents an event method, it should start with "on" followed by the capitalized event name, e.g. `onUpdate`.

### Access Modifiers
1. All public members should be labelled as `public` with the exception of the constructor method.
2. All `get` and `set` methods should be labelled as `public`.

### Order and priority
1. Class variables should precede class methods.
2. The order of access modifiers should be as follows: `public`, `protected`, `private`.
3. The `constructor` method should precede all other class methods.
4. `getter` and `setter` methods should precede all standard class methods.
5. Methods using the name pattern "on{Event}" should precede all remaining methods.

## Interfaces
1. All `interface` names should use capitalized CamelCase.
2. An `interface` name can be changed to use the form ICamelCase where a default class implementation also shares its name, but otherwise should omit the preceding "I".
3. All `interface` members should use lowercased camelCase.

## Functions
1. All `function` names should use lowercased camelCase.

## Types
1. All `type` names should use capitalized CamelCase.

## Enums
1. All `enum` names should use capitalized CamelCase.
2. All `enum` property names should use all-capitalized SNAKE_CASE.

## Variables and Constants
1. All variable names should use lowercased camelCase.
2. All `const` names should use all-capitalized SNAKE_CASE, with the exception of View template strings.

## Comments
1. **Always** add a header comment for `classes`, class methods, class variables, `interfaces`, interface members, `functions`, `types`, `enums`, and `vars`/`consts` in the module or global scope. Even if the purpose of a construct seems obvious, it's safer to avoid any ambiguity. Comments at regular intervals also impart a certain visual consistency to the look of the code.
2. Use comments sparingly inside `functions` or class methods. If you are tempted to use a comment to describe a particular control flow within the function, see if it can be explained as part of the function's header comment. For exceedingly long functions or algorithms, comments may indeed be necessary for clarification or exposition. Use whichever comment format seems appropriate (`// ...`, `/* ... */`, etc.).

`class`, class method, `interface`, `function`, `enum`, and `type` header comments should be of the style:

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

Class constructor methods should be commented as follows:

```typescript
/**
 * @constructor
 */
```

Class `get` and `set` methods should be commented as follows:

```typescript
/**
 * @getter {fieldName}
 */

/**
 * @setter {fieldName}
 */
```

Class variables or methods which override a superclass member should be commented as follows:

```typescript
/**
 * @override
 */
```

Class variables or methods which implement declared members from `interfaces` or required `abstract methods` from abstract classes should be commented as follows:

```typescript
/**
 * @implements (AbstractClass OR InterfaceName)
 */
```

Combinations of labels are fine:

```typescript
class UserService extends UserContainer implements IService, Disposable {
    /**
     * @implements (IService)
     */
    public type: ServiceType;

    /**
     * @override
     * @implements (UserContainer)
     */
    protected user: User;

    /**
     * @override
     * @implements (UserContainer)
     */
    public getUser (): User {
        return this.user;
    }

    /**
     * @implements (IService)
     */
    public startService (): void {

    }

    /**
     * @implements (Diposable)
     */
    public dispose (): void {

    }
}
```

Class variable, interface field, `var`, and `const` header comments should be of the style:

```typescript
class SomeClass {
    /* ... */
    private secret: string;
}

interface SomeInterface {
    /* ... */
    someValue: string;

    /* ... */
    someMethod (): void;
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