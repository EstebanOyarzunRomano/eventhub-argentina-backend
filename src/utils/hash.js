import bcrypt from "bcrypt";

export const createHash = async (password) => {
    return bcrypt.hash(password, 10);
};

export const isValidPassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};