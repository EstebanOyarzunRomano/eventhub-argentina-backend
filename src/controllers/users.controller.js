import usersRepository from "../repositories/users.repository.js";

const getAllUsers = async (req, res, next) => {
  try {
    const users = await usersRepository.findAll();

    res.status(200).json({
      status: "success",
      payload: users,
    });
  } catch (error) {
    next(error);
  }
};

export { getAllUsers };