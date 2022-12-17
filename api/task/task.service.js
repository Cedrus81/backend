const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const externalService = require('../../services/external.service.js')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy = { txt: '' }) {
    try {
        const criteria = {}
        const collection = await dbService.getCollection('task')
        var tasks = await collection.find(criteria).toArray()
        return tasks
    } catch (err) {
        logger.error('cannot find tasks', err)
        throw err
    }
}

async function getById(taskId) {
    try {
        const collection = await dbService.getCollection('task')
        const task = collection.findOne({ _id: ObjectId(taskId) })
        return task
    } catch (err) {
        logger.error(`while finding task ${taskId}`, err)
        throw err
    }
}

async function remove(taskId) {
    try {
        const collection = await dbService.getCollection('task')
        await collection.deleteOne({ _id: ObjectId(taskId) })
        return taskId
    } catch (err) {
        logger.error(`cannot remove task ${taskId}`, err)
        throw err
    }
}

async function add(task) {
    try {
        const collection = await dbService.getCollection('task')
        await collection.insertOne(task)
        return task
    } catch (err) {
        logger.error('cannot insert task', err)
        throw err
    }
}

async function update(task) {
    try {
        const collection = await dbService.getCollection('task')
        var _id = ObjectId(task._id)
        var temp = task._id
        delete task._id
        await collection.updateOne({ _id }, { $set: task })
        task._id = temp
    } catch (err) {
        logger.error(`cannot update task ${task._id}`, err)
        throw err
    } finally {
        return task
    }
}

async function performTask(task) {
    try {
        task.status = 'running'
        task = await update(task)

        await externalService.execute(task)
        task.doneAt = Date.now()
        task.status = 'success'
    } catch (error) {
        task.status = 'failed'
        task.errors.unshift(error)
    } finally {
        task.lastTried = Date.now()
        task.triesCount++
        return await update(task)
    }
}

async function getNextTask() {
    let tasks = await query()
    tasks = tasks.filter(task => (task.status !== 'success' && task.triesCount <= 5))
        .sort((a, b) => (b.importance - a.importance))
    return tasks[0]
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    performTask,
    getNextTask
}
