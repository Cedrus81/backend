const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
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
        console.log(task)
        var _id = ObjectId(task._id)
        var temp = task._id
        delete task._id
        await collection.updateOne({ _id }, { $set: task })
        task._id = temp
        return task
    } catch (err) {
        logger.error(`cannot update task ${task._id}`, err)
        throw err
    }
}

async function addTaskMsg(taskId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('task')
        await collection.updateOne({ _id: ObjectId(taskId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add task msg ${taskId}`, err)
        throw err
    }
}

async function removeTaskMsg(taskId, msgId) {
    try {
        const collection = await dbService.getCollection('task')
        await collection.updateOne({ _id: ObjectId(taskId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add task msg ${taskId}`, err)
        throw err
    }
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    addTaskMsg,
    removeTaskMsg
}
