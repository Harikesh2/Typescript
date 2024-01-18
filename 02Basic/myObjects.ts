const User ={
    name: "Hitesh",
    email: "h@h.com",
    isActive: true
}

function createUser({name: string, isPaid: boolean }){

}


createUser ({name:"harikesh", isPaid:true})
// createUser ({name:"harikesh", isPaid:true, email: "h@h.com"})
// not possible will throw an Error
// However possible way
let newUser ={
    name: "hitesh",
    isPaid: false,
    email: "h@h.com"
}

createUser(newUser);

function createCourse():{name:string, price: number}{
    return {name:"reactjs", price: 399}
}
export {}