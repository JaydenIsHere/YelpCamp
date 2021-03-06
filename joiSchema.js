const BaseJoi = require('joi')//for mongoose data validate
const sanitizeHtml = require('sanitize-html')
const extension = (joi) =>({
    type:'string',
    base: joi.string(),
    messages:{
    'string.escapeHTML':'{{#label}} must not include HTML!'
    },
    rules:{
        escapeHTML:{
            validate(value,helpers){
                const clean = sanitizeHtml(value,{
                    allowedTags:[],
                    allowedAttributes:{},
                });
                if(clean !==value) return helpers.error('string.escapeHTML',{value})
                return clean;
            }
        }
    }
})

const Joi = BaseJoi.extend(extension)
module.exports.campgroundSchema = Joi.object({
    campground:Joi.object({
        title:Joi.string().required().escapeHTML(),
        price:Joi.number().required().min(0),//you can set minimum value
        // image: Joi.string().required(),
        location:Joi.string().required().escapeHTML(),
        description:Joi.string().required().escapeHTML()
    }).required(),
    deleteImage:Joi.array()
}) //this is not a mongoose Schema

module.exports.reviewSchema = Joi.object({
    review:Joi.object({//object has to be singular
        rating:Joi.number().required().min(1).max(5),
        body:Joi.string().required().escapeHTML()
    })
}).required()