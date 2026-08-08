function addTwo(num: number):number{
  return num +2;

//   suppose we return a value which is return "hello" (it's a string so stopping that
// use :number(data type of function))
}

addTwo(5);

function getUpper(val: string){
    return val.toUpperCase()
}

getUpper("Harikesh");


function signUpUser(name: string, email:string, isPaid:boolean){

}

signUpUser("Harikesh","h@h.com",false);


let loginUser = (name: string, email: string, isPaid: boolean = true) =>{

}

loginUser("harikesh", "h@h.com");


// //  this will be a case where we have to think what to define in the function return type
// function getValue(myVal:number): boolean{
//     if(myVal > 5){
//         return true
//     }

//     return "200 OK"

// }

//  using this in arrow function
const getHello = (s: string):string=>{
    return ""
}

const heros = ["thor", "spiderman", "ironman"]
//  const heros = [1,2,3]
heros.map((hero): string =>{
    // return 1
    return `hero is ${hero}`
})



function consoleError(errmsg: string):void{
    console.log(errmsg);
}

// always try to use never when handling the error!
function handleError(errmsg: string):never{
    throw new Error(errmsg);
}



export {}