import Joi from "joi";

export const startTimerSchema = Joi.object({});

export const manualEntrySchema = Joi.object({
  startTime: Joi.date().iso().required().messages({
    "date.base": "Start time must be a valid ISO date.",
    "any.required": "Start time is required.",
  }),
  endTime: Joi.date().iso().required().messages({
    "any.required": "End time is required.",
  }),
  note: Joi.string().trim().max(200).optional().allow("", null),
});

export const editEntrySchema = Joi.object({
  startTime: Joi.date().iso().optional(),
  endTime: Joi.date().iso().optional(),
  note: Joi.string().trim().max(200).optional().allow("", null),
});
