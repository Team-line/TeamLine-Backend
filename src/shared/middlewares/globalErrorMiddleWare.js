const sendErrorDev = (err, res) => {
  return res.status(err.statusCode || 500).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    // error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.Operational) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }

  //? in the case of programming or other unknown error thats in the application or external service
  console.error("❌ ERROR 🔥:", err);

  return res.status(500).json({
    success: false,
    message: "Something went wrong on our side. Please try again later!",
  });
};

export const globalErrorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    sendErrorProd(err, res);
  }
};
