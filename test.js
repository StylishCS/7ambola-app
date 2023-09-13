// $2b$10$7Yt47i4jWoMUNSrQzSpNTuH8SGoAbEtnE4wkUT85PQDH12m1AvZ6C
const bcrypt = require('bcrypt');

async function x(){
    const y = (await bcrypt.hash('1234', 10));
    console.log(await bcrypt.compare('1234',y));
}

x();