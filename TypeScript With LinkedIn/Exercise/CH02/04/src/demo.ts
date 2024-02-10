interface Contact  {
    id: number,
    name: string,
    // using aliases 
    birthDate: Date,
    status: ContactStatus
   
}

enum ContactStatus{
    Active = "active",
    Inactive= "Inactive",
    New= "New"

}
let primaryDetails: Contact = {
    id: 3456,
    name: "Harikesh",
    // birthDate: "28/09/2000", Not allowed 
    birthDate: new Date("28/09/2000"),
    status: ContactStatus.Active
}