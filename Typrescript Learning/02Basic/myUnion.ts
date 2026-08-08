let score: number | string =  33

score = 89;

score = "Harikesh";

type Users = {
    name: string;
    _id: number

}

type admins = {
    username: string;
    _id: number
}

let harikesh: Users | admins = {name:"harikesh", _id: 2234}

harikesh = {username: "harikesh", _id:23234}

// will throw an error if we remove the | admin

// function getDbId(id: number | string){
//     console.log(`db connection is established!! ${id}`);   
// }

getDbId(6);
getDbId("4");

function getDbId(id: number | string){
    // id.toLowerCase()  not allowed because ts is smart to identify
    if(typeof id === "string"){
        id.toLowerCase()
    }
}


// Array

const data: number[] =[1,2,3,4];

// const data2: string | number[] = [1,2,3,"we"]; not allowed in this way

const data3: (string | number)[] = [1,2,3,"asd"];
const data4:(string | number | boolean)[] = [1,2,3,4,true, "fan"]

//  suppose we are design something for airplane 

let seatAllotment: "aisle" | "middle" | "window" ;

// seatAllotment = 'crew'

seatAllotment = 'aisle'