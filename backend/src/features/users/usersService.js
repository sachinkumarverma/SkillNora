import { usersRepository } from './usersRepository.js';

const getProfile = async token => {
  return await usersRepository.getUserByToken(token);
};

const getInstructors = async () => {
    return await usersRepository.getInstructors();
};

const syncUser = async (id, email, role, full_name) => {
    return await usersRepository.syncUser(id, email, role, full_name);
};

const updateProfile = async (id, data) => {
    return await usersRepository.updateProfile(id, data);
};

const updatePassword = async (id, password) => {
    return await usersRepository.updatePassword(id, password);
};

const logout = async (token) => {
    return await usersRepository.logout(token);
};

const sendPromotionalEmail = async (data) => {
    return await usersRepository.sendPromotionalEmail(data);
};

export const usersService = {
  getProfile,
  getInstructors,
  syncUser,
  updateProfile,
  updatePassword,
  logout,
  sendPromotionalEmail
};
