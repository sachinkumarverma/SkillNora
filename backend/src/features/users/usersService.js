import { usersRepository } from './usersRepository.js';

const getProfile = async token => {
  return await usersRepository.getUserByToken(token);
};

const getInstructors = async () => {
    return await usersRepository.getInstructors();
};

const syncUser = async (id, email, role) => {
    return await usersRepository.syncUser(id, email, role);
};

export const usersService = {
  getProfile,
  getInstructors,
  syncUser
};
