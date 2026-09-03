import usersDAO from "../dao/users.dao.js";

class UsersRepository {
  async findById(id) {
    return usersDAO.findById(id);
  }

  async findByEmail(email) {
    return usersDAO.findOne({ email });
  }

  async createUser(userData) {
    return usersDAO.create(userData);
  }

  async findAll() {
    return usersDAO.findAll();
  }

  async updateUser(id, userData) {
    return usersDAO.update(id, userData);
  }
}

export default new UsersRepository();