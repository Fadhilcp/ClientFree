"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async findById(id) {
        return this.model.findById(id);
    }
    async findAll() {
        return this.model.find();
    }
    async create(data) {
        return this.model.create(data);
    }
    async findByIdAndUpdate(id, data) {
        return this.model.findByIdAndUpdate(id, data, { upsert: true, new: true });
    }
    async updateMany(filter, data) {
        return this.model.updateMany(filter, data);
    }
    async updateOne(filter, data) {
        return this.model.findOneAndUpdate(filter, data, { new: true });
    }
    async delete(id) {
        return this.model.findByIdAndDelete(id);
    }
    async deleteMany(filter) {
        return this.model.deleteMany(filter);
    }
    async deleteOne(filter) {
        return this.model.deleteOne(filter);
    }
    async findOne(filter, options) {
        let query = this.model.findOne(filter);
        if (options?.sort)
            query = query.sort(options.sort);
        return query;
    }
    async find(filter, options) {
        const data = this.model.find(filter);
        if (options?.sort) {
            data.sort(options.sort);
        }
        if (typeof options?.limit === "number") {
            data.limit(options.limit);
        }
        return data;
    }
    async count(filter) {
        return this.model.countDocuments(filter);
    }
    async paginate(filter = {}, options = {}) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;
        let query = this.model.find(filter).skip(skip).limit(limit);
        if (options.sort)
            query = query.sort(options.sort);
        if (options.select)
            query = query.select(options.select);
        if (options.populate) {
            const populateOption = typeof options.populate === 'string'
                ? { path: options.populate }
                : options.populate;
            query = query.populate(populateOption);
        }
        const [data, total] = await Promise.all([
            query.exec(),
            this.model.countDocuments(filter)
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async exists(filter) {
        const result = await this.model.exists(filter);
        return Boolean(result);
    }
    // session 
    async createWithSession(data, session) {
        const docs = await this.model.create([data], { session });
        return docs[0];
    }
    async findOneWithSession(filter, session, options) {
        let query = this.model.findOne(filter).session(session);
        if (options?.sort)
            query = query.sort(options.sort);
        return query;
    }
    async findByIdWithSession(id, session) {
        return this.model.findById(id).session(session);
    }
    async findWithSession(filter, session) {
        return this.model.find(filter).session(session);
    }
}
exports.BaseRepository = BaseRepository;
