// Standard success response
const successResponse = (
  res,
  data,
  message = "Request successful",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    status: "success",
    message: message,
    data: data,
  });
};

// Standard error response
const errorResponse = (
  res,
  error,
  message = "Something went wrong",
  statusCode = 500
) => {
  console.error(error);
  return res.status(statusCode).json({
    status: "error",
    message: message,
    error: error.message || error,
  });
};

// 404 Not Found response
const notFoundResponse = (
  res,
  message = "Resource not found",
  statusCode = 404
) => {
  return res.status(statusCode).json({
    status: "error",
    message: message,
    errorCode: statusCode,
  });
};

// Exporting with ES module syntax
export { successResponse, errorResponse, notFoundResponse };
