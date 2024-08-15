const fs = require("node:fs").promises;
const { nanoid } = require("nanoid");
const path = require("node:path");
const Joi = require('joi');

const contactsPath = "./models/contacts.json";

const listContacts = () => {
  return fs.readFile(path.resolve(contactsPath), 'utf8')
    .then(file => {
      const contacts = JSON.parse(file);
      console.log(contacts);
      return contacts;
    })
    .catch(error => {
      console.error('Error reading contacts:', error);
      throw error;
    });
};

const getContactById = (contactId) => {
  return fs.readFile(path.resolve(contactsPath), 'utf8')
    .then(file => {
      const contacts = JSON.parse(file);
      const contact = contacts.find(contact => contact.id === contactId);
      console.log(contact);
      return contact;
    })
    .catch(error => {
      console.error('Error reading contacts:', error);
      throw error; 
    });
};

const removeContact = (contactId) => {
  return fs.readFile(path.resolve(contactsPath), 'utf8')
    .then(file => {
      const contacts = JSON.parse(file);
      const contactToDelete = contacts.find(contact => contact.id === contactId);
      console.log(contactToDelete);

      if (contactToDelete) {
        const afterDelete = contacts.filter(contact => contact.id !== contactId);
        return fs.writeFile(path.resolve(contactsPath), JSON.stringify(afterDelete))
          .then(() => contactToDelete); 
      } else {
        return contactToDelete;
      }
    })
    .catch(error => {
      console.error('Error handling contacts:', error);
      throw error; 
    });
};

const addContact = (body) => {
  return fs.readFile(path.resolve(contactsPath), 'utf8')
    .then(file => {
      const result = JSON.parse(file.toString());

      const newContact = {
        id: nanoid(21),
        name: body.name,
        email: body.email,
        phone: body.phone,
      };

      console.log(newContact);

      result.push(newContact);

      return fs.writeFile(path.resolve(contactsPath), JSON.stringify(result))
        .then(() => {
          console.log("Added new contact to file".green);
          return newContact;
        });
    })
    .catch(error => {
      console.error('Error handling contacts:', error);
      throw error;
    });
};

const updateContact = (contactId, body) => {
  return fs.readFile(path.resolve(contactsPath), 'utf8')
    .then(file => {
      const contacts = JSON.parse(file.toString());
      const contact = contacts.find(contact => contact.id === contactId);

      if (contact) {
        if ('name' in body) {
          contact.name = body.name;
        }
        if ('email' in body) {
          contact.email = body.email;
        }
        if ('phone' in body) {
          contact.phone = body.phone;
        }

        console.log(contact);

        return fs.writeFile(path.resolve(contactsPath), JSON.stringify(contacts))
          .then(() => {
            console.log("Updated contact in file".green);
            return contact;
          });
      } else {
        return contact; 
      }
    })
    .catch(error => {
      console.error('Error handling contacts:', error);
      throw error; 
    });
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
