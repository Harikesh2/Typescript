
# SETTING UP TYPESCRIPT

## Installing Globally ts in our system
``` commands

npm install typescript -g

```


## For installing the TS only for development of particular folders
``` 
npm install typescript --save-dev

```

## For checking the version of TS

```
tsc -v

```

## for initializing the ts in file follow following steps:

1. Create a tsconfig.json file.
2. In that create a json and include the src directory of the folder and create a ts file in src.

```
{
    
    "include": ["src/**/*"]
}

```

3. We can add target version of js in which we want our code to change.

Alway give `esnext` in target so it can give you the latest version of the javascript!!

```
{
    "compilerOptions": {
        "target": "ES5"
    },
    "include": ["src/**/*"]
}
```

4. we can add a `outdir` where after compilanation the js js will be generated!

```
{
    "compilerOptions": {
        "outDir": "build",
        "target": "ES5"
    },
    "include": ["src/**/*"]
}
 
```

5. For stopping the ts to generate the file in js we can use `noEmit` where it can stop to generate the build file!!

```
{
    "compilerOptions": {
        "outDir": "build",
        "target": "ES5",
        "noEmit": true
    },
    "include": ["src/**/*"]
}

```

6. For checking the Javascript file with TypeScript file we can use `allowJs` and `checkJs`, So it will check both types of files.

```
{
    "compilerOptions": {
        "allowJs": true,
        "checkJs": true,
        "outDir": "build",
        "target": "esnext",
        "noEmit": true
    },
    "include": ["src/**/*"]
}

```

7. we can add types to the JavaScript code using the JsDoc syntax from where the js will able to give those error!!

```javascript
/**
 * 
 * @param {*} contactId 
 * @returns 
 */
```
(at the place of *(means any datatype)we have to put number or string or any type of the data type)

8. In TypeScript we have to add many custom libarary from where we have to the resource for example:

INSTALLING THE JQUERY IN TS

```
npm i @types/jquery
```

Basically we are downloading a defination of the files in TS, So we can access in our code base.

In node-module we have .d and .ts
files which are very important. They are the declaration files of the TS.

