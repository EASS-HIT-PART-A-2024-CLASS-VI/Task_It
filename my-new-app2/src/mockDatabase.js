const users = [];

export const addUser = (user) => {
  const existingUser = users.find((u) => u.email === user.email);
  if (existingUser) {
    throw new Error("User with this email already exists.");
  }
  users.push(user);
};

export const verifyUser = (email, token) => {
  const user = users.find((u) => u.email === email);
  if (!user) {
    throw new Error("User not found.");
  }
  if (user.token !== token) {
    throw new Error("Invalid token.");
  }
  user.verified = true;
};

export const getUsers = () => users;
