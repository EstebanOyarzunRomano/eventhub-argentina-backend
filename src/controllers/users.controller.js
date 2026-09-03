import usersRepository from "../repositories/users.repository.js";
import UserDTO from "../dto/user.dto.js";

const getAllUsers = async (req, res, next) => {
  try {
    const users = await usersRepository.findAll();

    res.status(200).json({
      status: "success",
      payload: users.map((user) => new UserDTO(user)),
    });
  } catch (error) {
    next(error);
  }
};

export { getAllUsers };