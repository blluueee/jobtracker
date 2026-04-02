export const success = (res: any, data: any, meta?: any) => {
  return res.json({
    success: true,
    data,
    meta,
  });
};

export const error = (res: any, message: string) => {
  return res.status(400).json({
    success: false,
    message,
  });
};