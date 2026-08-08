// enum is a powerfull way of assigning the object to choice 

 const enum seatChoice {
    AISLE = 'aisle',
    MIDDLE = 3,
    WINDOW,
    FORTH
}
// in enum if we put a number in front of the attribute that will assign that attribute however all the below attributes will assign to increasing order 
let harikeshSeat = seatChoice.AISLE;


// enum seatChoice {
//     AISLE = 'aisle',
//     MIDDLE = 3,
//     WINDOW,
//     FORTH
// }

//  this syntax of enum is going to generate a lot of code in js so that's why we should declare the enum with let or const