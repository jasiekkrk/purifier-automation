import Service from './service/Serivce';
require('dotenv').config()

const service = new Service()
service.start().then(() => console.log('Running')).catch(err => console.log(err))