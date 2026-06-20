export const formatTaskResponse = (taskDocument) => {
  if (!taskDocument) return null;

  return {
    id: taskDocument._id,
    name: taskDocument.name,
    description: taskDocument.description || null,
    workspace: taskDocument.workspace,
    board: taskDocument.board,
    column: taskDocument.column,
    createdBy: taskDocument.createdBy,
    assignees: taskDocument.assignees || [],
    labels: taskDocument.labels || [],
    order: taskDocument.order,
    isCompleted: taskDocument.isCompleted || false,
    dueDate: taskDocument.dueDate || null,
    completedAt: taskDocument.completedAt || null,
    createdAt: taskDocument.createdAt,
    updatedAt: taskDocument.updatedAt,
  };
};
