import usersDAO from "../dao/users.dao.js";

class UsersRepository {
  async findByEmail(email) {
    return usersDAO.findByEmail(email);
  }

  async createUser(userData) {
    return usersDAO.create(userData);
  }

  async findAll() {
    return usersDAO.findAll();
  }
}

export default new UsersRepository();