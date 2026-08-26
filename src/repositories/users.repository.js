import usersDAO from "../dao/users.dao.js";

class UsersRepository {
  async findByEmail(email) {
    return usersDAO.findByEmail(email);
  }

  async createUser(userData) {
    return usersDAO.create(userData);
  }
}

export default new UsersRepository();