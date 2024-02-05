

# DEFINING THE DATA TYPE IN TYPESCRIPT

## Default behaviour : When we assign any type of data to the variable

```
let x = 12;
```
(Data-Type: Number)


## Defining a particular data Type 

```
let x: number
let y: string
let z: boolean
let a: Date
let b : string[]

```
Now if we redefine the variable with another datatype the TS will throw us the error!!

## ANY TYPE 
By defining the any we can assign anything to that variable!!
```
let a : any;
a= 1213
a="asdf"
a= arr[]
```

### Other way of defining any

```
let b: string;
b = 1234 as any 
```

