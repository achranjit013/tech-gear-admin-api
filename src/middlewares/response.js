export const responder = {
  SUCESS: ({ res, errorCode = 200, ...rest }) => {
    res.status(errorCode).json({
      status: "success",
      ...rest,
    });
  },
  ERROR: ({ res, message, errorCode = 500 }) => {
    res.status(errorCode).json({
      status: "error",
      message,
    });
  },
};
