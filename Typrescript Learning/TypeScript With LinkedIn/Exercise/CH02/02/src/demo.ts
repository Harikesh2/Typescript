

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

// let primaryDetails: Contact = {
//     id: 3456,
//     name: "Harikesh",
//     birthDate: new Date("28/09/2000"),
// }