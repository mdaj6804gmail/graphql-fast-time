module.exports = (msg, status, path) => {
  const error = new Error(msg);
  error.status = status || 500;
  error.data = {
    message: msg || undefined,
    path: path || undefined,
  };
  throw error;
};
