import mongodb from 'mongodb'
const { ObjectId } = mongodb

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

async function query(filterBy,sortBy) {
    console.log('sort:',sortBy);

    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('toy')
        var toys = await collection.find(criteria).sort(sortBy).toArray()
        return toys
    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        var toy = collection.findOne({ _id: ObjectId(toyId) })
        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne({ _id: ObjectId(toyId) })
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        logger.error('cannot insert toy', err)
        throw err
    }
}

async function update(toy) {
    console.log('hi');

    try {
        const toyToSave = {
            name: toy.name,
            price: toy.price,
            labels: toy.labels,
            cratedAt: toy.cratedAt,
            inStock: toy.inStock
        }
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toy._id) }, { $set: toyToSave })
        return toy
    } catch (err) {
        logger.error(`cannot update toy ${toyId}`, err)
        throw err
    }
}

async function addToyMsg(toyId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function removeToyMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toyId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}


function _buildCriteria(filterBy) {
    const { labels, txt, status } = filterBy
  
    const criteria = {}
  
    if (txt) {
      criteria.name = { $regex: txt, $options: 'i' }
    }
  
    if (labels && labels.length) {
      //every for objects labels
      // const labelsCrit = labels.map(label => ({
      //   labels: { $elemMatch: { title: label } },
      // }))
  
      //every for string labels
      // const labelsCrit = labels.map((label) => ({
      // 	labels: label,
      // }))
      // criteria.$and = labelsCrit
      // criteria.labels =  { $all: labels }
  
      // for some for string labels
      console.log('labels', labels)
      criteria.labels = { $in: labels } //['Doll']
    }
  
    if (status) {
      criteria.inStock = status === 'true' ? true : false  // ? true : false
    }
    console.log('criteria', criteria)
  
    return criteria
  }

export const toyService = {
    remove,
    query,
    getById,
    add,
    update,
    addToyMsg,
    removeToyMsg
}
