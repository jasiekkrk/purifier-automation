import Service from './service/Serivce';
require('dotenv').config()

const service = new Service()
service.start().then(() => console.log('Running')).catch(err => console.log(err))

function doStop(){
    service.stop().then(() => {
        console.log('Bye bye')
        process.exit()
    })
}

process.on('exit', doStop);
process.on('SIGINT', doStop);