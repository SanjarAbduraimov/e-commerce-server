const errorHandling = (err, req, res, next) => {
  return res.status(500).json({
    msg: err.message,
    success: false,
  });
};
module.exports = errorHandling;
