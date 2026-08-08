

type User = {
    name: string,
    email: string,
    isActive: boolean
}

function createUser(user:User): User{
   return {name:"", email: "", isActive:true}
}

createUser({name:"", email: "", isActive:true})

// here the user is of User type means require that much User details