// creating the Interface
interface Contact  {
    id: number,
    name: ContactName,
    birthDate: Date,
   
}


let primaryDetails: Contact = {
    id: 3456,
    name: "Harikesh",
    // birthDate: "28/09/2000", Not allowed 
    birthDate: new Date("28/09/2000"),
}

type ContactName = string