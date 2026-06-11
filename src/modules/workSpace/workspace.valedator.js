import Joi from "joi";

export const createWorkspaceSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(300).optional(),
});

export const updateWorkspaceSchema = Joi.object({
  name: Joi.string().min(3).max(50).optional(),
  description: Joi.string().max(300).optional(),
}).min(1);

export const inviteMemberSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is a required field",
  }),
});
