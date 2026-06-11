export const formatWorkspace = (workspace) => {
  return {
    id: workspace._id,
    name: workspace.name,
    description: workspace.description,
    owner: workspace.owner,
    members: workspace.members,
    createdAt: workspace.createdAt,
  };
};
