// console.log("typescript is cool");
// console.log("typescript is game changer");

//  this is the way of defining the class in the typescript in the ts file
class User {
    name: string
    email: string
    city: string = ""
    // this syntax is used for the string is not define than after accept it!!
    constructor(name: string, email:string){
        this.name = name
        this.email = email

    }
}

const harikesh = new User("h@h.com", "harikesh")