import User from "../models/user.js";

class UsersDAO {
  async findByEmail(email) {
    return User.findOne({ email });
  }

  async create(userData) {
    return User.create(userData);
  }

  async findAll() {
    return User.find().select("-password");
  }
}

export default new UsersDAO();