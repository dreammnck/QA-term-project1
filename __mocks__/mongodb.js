//
// A mock version of the MongoDB library.
//

let data = {};

class ObjectId {
    constructor(value) {
        this.__value = value;
    }

    toString() {
        return this.__value;
    }

    toJSON() {
        return this.__value;
    }
}

class MongoCollection {
    constructor(collectionName) {
        this.collectionName = collectionName;
    }

    async findOne({ _id }) {
        const collectionData = data[this.collectionName] || [];
        return collectionData.find(el => el._id.__value === _id.__value);
    }

    find() {
        return {
            async toArray() {
                return data[this.collectionName] || [];
            }
        }
    }

    async insertOne() {
        return {
            insertedId: new ObjectId("newly-inserted"),
        };
    }
}

class MongoDatabase {
    collection(collectionName) {
        return new MongoCollection(collectionName);
    }
}

class MongoClient {
    async connect() {
    }

    db() {
        return new MongoDatabase();
    }
}

function __setData__(_data) {
    data = _data;
}

module.exports = {
    MongoClient,
    ObjectId,
    __setData__,
};