export const boardResponse = function (boaed) {
  return {
    id: boaed._id,
    name: boaed.name,
    description: boaed.description,
    workspace: boaed.workspace,
    createdBy: boaed.createdBy,
    columns: boaed.columns,
  };
};
