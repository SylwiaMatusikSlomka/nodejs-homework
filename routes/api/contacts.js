const express = require('express')
const Joi = require('joi');
const { listContacts, getContactById, addContact, removeContact, updateContact } = require("../../models/contacts");


const router = express.Router()

router.get('/', async (req, res, next) => {
  listContacts()
  .then((contacts) => {
    res.json(contacts);
  })
  .catch((error) => {
    console.error('Failed to list contacts:', error);
  });
})

router.get('/:contactId', async (req, res, next) => {
  getContactById(req.params.contactId)
  .then((contact) => {
    if(Object.keys(contact).length > 0){
      res.json(contact);
    }else{
      res.status(404).json({
        "message": "Not found"
      })
    }
  })
  .catch((error) => {
    console.error('Failed to list contact:', error);
  });
})

router.post('/', async (req, res, next) => {
  const { name, email, phone} = req.body;
  console.log(req.body);

  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{9,15}$/).required()
  });

  const { error } = schema.validate(req.body);
  if(error){
    return res.status(400).json({
      "message": "missing required name - field" 
    });
  }

  addContact(req.body)
  .then((contact) => {
    if(Object.keys(contact).length > 0){
      res.status(201).json(contact);
    }else{
      res.status(404).json({
        "message": "Not found"
      })
    }
  })
  .catch((error) => {
    console.error('Failed to list contact:', error);
  });
})

router.delete('/:contactId', async (req, res, next) => {
  removeContact(req.params.contactId)
  .then((contact) => {
    if(Object.keys(contact).length > 0){
      res.json(contact);
    }else{
      res.status(404).json({
        "message": "Not found"
      })
    }
  })
  .catch((error) => {
    console.error('Failed to list contacts:', error);
  });
})

router.put('/:contactId', async (req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    const schema = Joi.object({
      name: Joi.string().min(3).max(30),
      email: Joi.string().email(),
      phone: Joi.string().pattern(/^[0-9]{9,15}$/)
    });
  
    const { error } = schema.validate(req.body);
    if(error){
      return res.status(400).json({
        "message": "missing required name - field" 
      });
    }
    updateContact(req.params.contactId, req.body)
    .then((contact) => {
      if(Object.keys(contact).length > 0){
        res.status(200).json(contact);
      }else{
        res.status(404).json({
          "message": "Not found"
        })
      }
    })
    .catch((error) => {
      console.error('Failed to list contact:', error);
    });
  } else {
    res.status(400).json({
      "message": "missing fields"
    });
  }
})

module.exports = router
