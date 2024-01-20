

const User7: (String | number)[] = [1,"hc"];


// in tuples we can define the order of the data store which help in api

let api: [number , string ,boolean] ;

api = [1,'sd',true];
// api = ['adf',123.false] not possible to change the order

// let rgb: [number, number, number ] = [233,24,23,true] (NOT POSSIBLE)
let rgb: [number, number, number ] = [233,24,23]


type User4 = [number, string];

let user23: User4 = [1,'h@h.com'];


user23[1] = 'asdf'; 
// possible to change the value

// now it's an array user23 we can use push pop one

// user23.push(true);
// the error is fixed