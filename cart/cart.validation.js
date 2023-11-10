import Joi from "joi";

export const quantityValidationSchema = Joi.object({
  quantity: Joi.number().min(1).required(),
});

export const actionValidationSchema = Joi.object({
  action: Joi.string().valid("increase", "decrease").required(),
});
