import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
const ScryptaCore = require('@scrypta/core')
require('dotenv').config()
const scrypta = new ScryptaCore
import * as PouchDB from 'pouchdb'
PouchDB.plugin(require('pouchdb-find'))
const fs = require('fs')

async function bootstrap() {
  if (process.env.MAIN_SID !== undefined) {

    /** CHECK MAIN IDENTITY */
    let xsid = await scrypta.readxKey(process.env.MAIN_PWD, process.env.MAIN_SID)
    if (xsid !== false) {
      /** INIT DATABASE */
      try {
        fs.open('INIT', 'r', function (err, fd) {
          if (err) {
            const db = new PouchDB('wp-news')
            db.createIndex({
              index: { fields: ['name', 'hash', 'email'] }
            })
            fs.writeFileSync('INIT', new Date().getTime())
          }
        })
      } catch (e) {
        console.log(e)
      }
      /** RUNNING NESTJS */
      const app = await NestFactory.create(AppModule)
      await app.listen(3000)
    } else {
      console.log('UNABLE TO READ MAIN SID, WRONG PASSWORD.')
    }
  } else {
    console.log('MAIN xSID NOT FOUND, PLEASE ADD IT INTO YOUR .env FILE')
  }
}

bootstrap()