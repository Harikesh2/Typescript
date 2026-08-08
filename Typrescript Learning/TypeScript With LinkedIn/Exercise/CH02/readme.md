

# DEFINING THE DATA TYPE IN TYPESCRIPT

## Default behaviour : When we assign any type of data to the variable

```javascript
let x = 12;
```
(Data-Type: Number)


## Defining a particular data Type 

```javascript
let x: number
let y: string
let z: boolean
let a: Date
let b : string[]

```
Now if we redefine the variable with another datatype the TS will throw us the error!!

## ANY TYPE 
By defining the any we can assign anything to that variable!!
```javascript
let a : any;
a= 1213
a="asdf"
a= arr[]
```

### Other way of defining any

``` javascript
let b: string;
b = 1234 as any 
```


### Interface in Typescript

Interface are used to wrapped multiple properties and methods in `TS`.

```typescript
// creating the Interface
interface Contact  {
    id: number,
    name: string,
    birthDate: Date,
   
}


let primaryDetails: Contact = {
    id: 3456,
    name: "Harikesh",
    // birthDate: "28/09/2000", Not allowed 
    birthDate: new Date("28/09/2000"),
}
```

In `TS` it's not allowed to store the another type of data which is define in the particular interface.


#### We can also share one properties of one interface to another.

``` typescript
interface Contact extends Address {
    id: number,
    name: string,
    birthDate: Date,
   
}

interface Address{
    line1: string,
    line2: string,
    province: string,
    region: string,
    postalCode: string,
}

let primaryDetails: Contact = {
    // THIS WILL THROW ERROR
    id: 3456,
    name: "Harikesh",
    birthDate: new Date("28/09/2000"),
}
```

Here we are using the address property of one interface to another interface using `extends` key word.

### Type Alias in TypeScript

Aliases are used in `TS` to defining a particular specific name of the `datatype`.

```typescript
// creating the Interface
interface Contact  {
    id: number,
    name: ContactName,
    // using aliases 
    birthDate: Date,
   
}


let primaryDetails: Contact = {
    id: 3456,
    name: "Harikesh",
    // birthDate: "28/09/2000", Not allowed 
    birthDate: new Date("28/09/2000"),
}

type ContactName = string
```

### Enums (Enumerable Type)

Enum are define in `TS` for assign a particular value with `.` 

```typescript
interface Contact  {
    id: number,
    name: string,
    // using aliases 
    birthDate: Date,
    status: ContactStatus
    // passing enum in interface
   
}

// defining enum
enum ContactStatus{
    Active = "active",
    Inactive= "Inactive",
    New= "New"

}
let primaryDetails: Contact = {
    id: 3456,
    name: "Harikesh",
    birthDate: new Date("28/09/2000"),
    status: ContactStatus.Active
    // defining it with dotnotesion
}

```

### Creating a Function Type

In `TS` we can define the parameter type as well as the function return type.

```typescript
interface Contact{
    id: number,
    name: string
    clone: Contact,
    // First way of defining the Type
}

// Second way of defining the Type of function
function clone(source:Contact): Contact
// defining parameter type in typescript

{
    return Object.apply({},source)
}


(func: (source: Contact) => Contact)
```

### Generics in TS

Generic is a vast concept in `TS`.
We can pass single generic and multiple generic in `TS`.

#### Passing Single Generic

```typescript
function clone<T>(source:T): T {
    return Object.apply({}, source);
}

const dateRange = {startDate: Date.now(), endDate: Date.now()}

const dateRangeCopy = clone(dateRange)

```
Here in image you can see `TS` have converted the function type and return.

![generics_in_ts](https://github.com/Harikesh2/Cypress/assets/116285934/97b89ad5-9887-404b-b86e-39308fc699e4)


#### Passing Multiple Generics

```typescript

interface Contact{
    id: number,
    name: string
}

interface UserContact{
    id: number,
    name: string,
    username: string,
}
// catching multiple generic
function clone<T1, T2 extends T1>(source:T1): T2 {
    return Object.apply({}, source);
}

const a: Contact = {
    id: 123,
    name: "Homer Simpson"
};

// passing multiple generic
const b = clone<Contact, UserContact>(a)
```

`T2 extends T1` : making generic to be extends to another generic.
