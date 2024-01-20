

type User = {
    readonly _id: string,
    name: string,
    email: string,
    isActive: boolean,
    credcardDetails?: number
    // optional syntax is this user can give it or not
}
// readonly variable is only readable we cannot change it!

let myUser : User = {
    _id: "12345",
    name: "h",
    email: "h@h.com",
    isActive: false
}


type cardNumber ={
    cardnumber: string

}
type cardDate = {
    cardDate:  string
}

type cardDetails = cardNumber & cardDate & {
    cvv: number
}
myUser.name = "Harikesh"
//  possible in this

// myUser._id = 'asd'

// will give error!