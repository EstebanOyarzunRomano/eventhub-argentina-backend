import User from "../models/User.js";

class UsersDAO {
  async findByEmail(email) {
    return User.findOne({ email });
  }

  async create(userData) {
    return User.create(userData);
  }
}

export default new UsersDAO();