interface Contact{
    id: number,
    name: string
    clone: Contact,
    // First way of defining the Type
}

// Second way of defining the Type of function
function clone(source:Contact): Contact
// defining parameter type in typescript

{
    return Object.apply({},source)
}


// (func: (source: Contact) => Contact)