
interface itemDetails {
    id: number,
    title: string,
    status: itemStatus,
    completedOn? : Date,  
}

enum itemStatus{
    done="Done",
    in_progress="in-progress",
    todo= "todo"
}

const todoItems: itemDetails[] = [
    { id: 1, title: "Learn HTML", status: itemStatus.done, completedOn: new Date("2021-09-11") },
    { id: 2, title: "Learn TypeScript", status: itemStatus.in_progress },
    { id: 3, title: "Write the best app in the world", status: itemStatus.todo },
]


function addTodoItem(todo:string): itemDetails {
    const id = getNextId(todoItems)

    const newTodo = {
        id,
        title: todo,
        status: itemStatus.todo,
    }
    return newTodo
    
}

function getNextId<T extends {id: number }>(items: T[]):number {
    return items.reduce((max, x) => x.id > max ? x.id : max, 0) + 1
}

const newTodo = addTodoItem("Buy lots of stuff with all the money we make from the app")

console.log(newTodo);
