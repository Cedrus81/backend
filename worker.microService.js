const taskService = require('./api/task/task.service')
const dbService = require('./services/db.service')
const socketService = require('./services/socket.service')

async function runWorker() {
    // The isWorkerOn is toggled by the button: "Start/Stop Task Worker"
    // if (!isWorkerOn) return
    var delay = 5000
    try {
        let task = await taskService.getNextTask()
        if (task) {
            try {
                task.status = 'running'
                task = await taskService.update(task)
                socketService.emitTo({ type: 'update-task', data: task })
                task = await taskService.performTask(task)
            } catch (err) {
                console.log(`Failed Task`, err)
            } finally {
                socketService.emitTo({ type: 'update-task', data: task })
                delay = 1
            }
        } else {
            console.log('Snoozing... no tasks to perform')
        }
    } catch (err) {
        console.log(`Failed getting next task to execute`, err)
    } finally {
        setTimeout(runWorker, delay)
    }
}

module.exports = {
    runWorker
}