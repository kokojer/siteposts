const Contact = require('../models/contact');
const createPath = require('../helpers/create-path');
const userObj = require('../helpers/userObj')

const getContacts = async (req, res) => {
	const title = 'Contacts';
	const obj = await userObj(req, title);
	Contact
		.find()
		.then(contacts => res.render(createPath('contacts'), { contacts, ...obj }))
		.catch((error) => {
			console.log(error);
			res.render(createPath('error'), { title: 'Error' });
		});
}

module.exports = {
	getContacts,
};
