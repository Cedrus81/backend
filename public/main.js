import { taskService } from './services/task.service.local.js'
import { userService } from './services/user.service.js'
import { utilService } from './services/util.service.js'

console.log('Simple driver to test some API calls')

window.onLoadTasks = onLoadTasks
window.onLoadUsers = onLoadUsers
window.onAddTask = onAddTask
window.onGetTaskById = onGetTaskById
window.onRemoveTask = onRemoveTask
window.onAddTaskMsg = onAddTaskMsg

async function onLoadTasks() {
    const tasks = await taskService.query()
    render('Tasks', tasks)
}
async function onLoadUsers() {
    const users = await userService.query()
    render('Users', users)
}

async function onGetTaskById() {
    const id = prompt('Task id?')
    if (!id) return
    const task = await taskService.getById(id)
    render('Task', task)
}

async function onRemoveTask() {
    const id = prompt('Task id?')
    if (!id) return
    await taskService.remove(id)
    render('Removed Task')
}

async function onAddTask() {
    await userService.login({ username: 'muki', password: '123' })
    const savedTask = await taskService.save(taskService.getEmptyTask())
    render('Saved Task', savedTask)
}

async function onAddTaskMsg() {
    await userService.login({ username: 'muki', password: '123' })
    const id = prompt('Task id?')
    if (!id) return

    const savedMsg = await taskService.addTaskMsg(id, 'some msg')
    render('Saved Msg', savedMsg)
}

function render(title, mix = '') {
    console.log(title, mix)
    const output = utilService.prettyJSON(mix)
    document.querySelector('h2').innerText = title
    document.querySelector('pre').innerHTML = output
}

