const fs = require("node:fs").promises;
const { nanoid } = require("nanoid");
const path = require("node:path");
const Joi = require('joi');

const contactsPath = "./models/contacts.json";
const Contact = require("../service/schema/contact.js");

const listContacts = () => {
  return Contact.find()
    .then((contacts) => {
      return contacts;
    })
    .catch((error) => {
      throw error;
    });
};

const getContactById = (contactId) => {
  return Contact.find({ _id: contactId })
    .then((contacts) => {
      return contacts;
    })
    .catch((error) => {
      throw error;
    });
};

const removeContact = (contactId) => {
  return Contact.deleteOne({ _id: contactId })
    .then((contacts) => {
      return contacts;
    })
    .catch((error) => {
      throw error;
    });
};

const addContact = (body) => {
  return Contact.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      favorite: false
    })
    .then((contacts) => {
      return contacts;
    })
    .catch((error) => {
      throw error;
    });
};

const updateContact = (contactId, body) => {
  return Contact.updateOne(
    { 
      _id: contactId 
    },
    body
  )
  .then((contacts) => {
    return contacts;
  })
  .catch((error) => {
    throw error;
  });
};

const updateStatusContact = (contactId, body) => {
  console.log(contactId);
  return Contact.updateOne(
    { 
      _id: contactId 
    },
    body
  )
  .then(() => {
    return getContactById(contactId);
  })
  .catch((error) => {
    throw error;
  });
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact
}
