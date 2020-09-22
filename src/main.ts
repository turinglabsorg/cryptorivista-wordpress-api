import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const ScryptaCore = require('@scrypta/core')
require('dotenv').config()
const scrypta = new ScryptaCore

async function bootstrap() {
  if(process.env.MAIN_SID !== undefined){
    let xsid = await scrypta.readxKey(process.env.MAIN_PWD, process.env.MAIN_SID)
    if(xsid !== false){
      const app = await NestFactory.create(AppModule)
      await app.listen(3000)
    }else{
      console.log('UNABLE TO READ MAIN SID, WRONG PASSWORD.')
    }
  }else{
    console.log('MAIN xSID NOT FOUND, PLEASE ADD IT INTO YOUR .env FILE')
  }
}
bootstrap()