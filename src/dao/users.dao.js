import User from "../models/user.js";

class UsersDAO {
  async findById(id) {
    return User.findById(id);
  }

  async findOne(filter) {
    return User.findOne(filter);
  }

  async create(userData) {
    return User.create(userData);
  }

  async findAll() {
    return User.find();
  }

  async update(id, userData) {
    return User.findByIdAndUpdate(id, userData, {
      new: true,
    });
  }
}

export default new UsersDAO();