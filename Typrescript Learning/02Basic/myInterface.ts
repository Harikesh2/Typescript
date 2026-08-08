interface User {
   readonly dbId: number,
    email: string,
    userId: number,
    googleId?: string,
    // starttrails: () => string, another way of doing this
    starttrials(): string, 
    // this syntax will add more clarity regarding the method type
    getCoupon(couponname: string, value: number) : number,


}
// interface is used for creating a field of methods and required attributes it's help us to create many methods in the field. it's a lot like class short form


//  we can also reopen the interface and that will also added to the template interface

interface User{
    githubId?: string
}
//  if we use this here it will throw an error in creating the instance of interface!!


// interface can be extended as well,
// we can extend it more as well
interface Admin extends User{
    role: "admin" | "ta" | "learner"
}




const harikesh: Admin = { dbId: 123, email:"h@h.com", userId:123,
role: "admin",

starttrials: ()=> {
    return "trail started!"
},

// here in argument we have to provide the coupon name as well so we can change the argument name
getCoupon(name: "Harikesh", value: 10) {
    return 2
    
},}

export {}