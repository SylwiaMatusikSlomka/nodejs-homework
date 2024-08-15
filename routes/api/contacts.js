const express = require('express')
const Joi = require('joi');
const { listContacts, getContactById, addContact, removeContact, updateContact } = require("../../models/contacts");

const router = express.Router()

router.get('/', (req, res, next) => {
  listContacts()
  .then((contacts) => {
    res.json(contacts);
  })
  .catch((error) => {
    next(error);
  });
})

router.get('/:contactId', (req, res, next) => {
  getContactById(req.params.contactId)
  .then((contact) => {
    if(contact){
      res.json(contact);
    }else{
      res.status(404).json({
        "message": "Not found"
      })
    }
  })
  .catch((error) => {
    next(error);
  });
})

router.post('/', (req, res, next) => {
  console.log(req.body);

  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\(\d{3}\) \d{3}-\d{4}$/).required()
  });

  const { error } = schema.validate(req.body);
  if(error){
    return res.status(400).json({
      "error": error.details 
    });
  }

  addContact(req.body)
  .then((contact) => {
    if(contact){
      res.status(201).json(contact);
    }else{
      res.status(404).json({
        "message": "Not found"
      })
    }
  })
  .catch((error) => {
    next(error);
  });
})

router.delete('/:contactId', (req, res, next) => {
  removeContact(req.params.contactId)
  .then((contact) => {
    if(contact){
      res.json(contact);
    }else{
      res.status(404).json({
        "message": "Not found"
      })
    }
  })
  .catch((error) => {
    next(error);
  });
})

router.put('/:contactId', (req, res, next) => {
  if (req.body) {
    const schema = Joi.object({
      name: Joi.string().min(3).max(30),
      email: Joi.string().email(),
      phone: Joi.string().pattern(/^\(\d{3}\) \d{3}-\d{4}$/)
    });
  
    const { error } = schema.validate(req.body);
    if(error){
      return res.status(400).json({
        "error": error.details 
      });
    }
    updateContact(req.params.contactId, req.body)
    .then((contact) => {
      if(contact){
        res.status(200).json(contact);
      }else{
        res.status(404).json({
          "message": "Not found"
        })
      }
    })
    .catch((error) => {
      next(error);
    });
  } else {
    res.status(400).json({
      "message": "missing fields"
    });
  }
})

module.exports = router
