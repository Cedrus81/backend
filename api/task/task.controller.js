const taskService = require('./task.service.js')
const socketService = require('../../services/socket.service')
const logger = require('../../services/logger.service')
const workerService = require('../../worker.microService')
async function getTasks(req, res) {
  try {
    logger.debug('Getting Tasks')
    const filterBy = {
      txt: req.query.txt || ''
    }
    const tasks = await taskService.query(filterBy)
    res.json(tasks)
  } catch (err) {
    logger.error('Failed to get tasks', err)
    res.status(500).send({ err: 'Failed to get tasks' })
  }
}

async function getTaskById(req, res) {
  try {
    const taskId = req.params.id
    const task = await taskService.getById(taskId)
    res.json(task)
  } catch (err) {
    logger.error('Failed to get task', err)
    res.status(500).send({ err: 'Failed to get task' })
  }
}

async function addTask(req, res) {

  try {
    const task = req.body
    const addedTask = await taskService.add(task)
    res.json(addedTask)
  } catch (err) {
    logger.error('Failed to add task', err)
    res.status(500).send({ err: 'Failed to add task' })
  }
}


async function updateTask(req, res) {
  try {
    const task = req.body
    const updatedTask = await taskService.update(task)
    res.json(updatedTask)
  } catch (err) {
    logger.error('Failed to update task', err)
    res.status(500).send({ err: 'Failed to update task' })
  }
}

async function removeTask(req, res) {
  try {
    const taskId = req.params.id
    const removedId = await taskService.remove(taskId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove task', err)
    res.status(500).send({ err: 'Failed to remove task' })
  }
}

async function addTaskMsg(req, res) {
  const { loggedinUser } = req
  try {
    const taskId = req.params.id
    const msg = {
      txt: req.body.txt,
      by: loggedinUser
    }
    const savedMsg = await taskService.addTaskMsg(taskId, msg)
    res.json(savedMsg)
  } catch (err) {
    logger.error('Failed to update task', err)
    res.status(500).send({ err: 'Failed to update task' })

  }
}

async function removeTaskMsg(req, res) {
  const { loggedinUser } = req
  try {
    const taskId = req.params.id
    const { msgId } = req.params

    const removedId = await taskService.removeTaskMsg(taskId, msgId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove task msg', err)
    res.status(500).send({ err: 'Failed to remove task msg' })

  }
}

async function performTask(req, res) {
  const task = req.body
  res.send(await taskService.performTask(task))
}

var isWorkerOn
function toggleWorker(req, res) {
  isWorkerOn = req.body.isWorkerOn
  runWorker()
}

async function runWorker() {
  // The isWorkerOn is toggled by the button: "Start/Stop Task Worker"
  if (!isWorkerOn) return
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
  getTasks,
  getTaskById,
  addTask,
  updateTask,
  removeTask,
  addTaskMsg,
  removeTaskMsg,
  performTask,
  toggleWorker
}
