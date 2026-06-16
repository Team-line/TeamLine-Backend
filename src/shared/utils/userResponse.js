export const userResponse = (user) => {
  return {
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  };
};
