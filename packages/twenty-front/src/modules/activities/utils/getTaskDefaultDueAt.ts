export const getTaskDefaultDueAt = (now = new Date()) => {
  const dueAt = new Date(now);

  dueAt.setHours(9, 0, 0, 0);

  return dueAt.toISOString();
};
