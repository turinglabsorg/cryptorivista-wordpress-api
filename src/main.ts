import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
const ScryptaCore = require('@scrypta/core')
require('dotenv').config()
const scrypta = new ScryptaCore
import * as PouchDB from 'pouchdb'
PouchDB.plugin(require('pouchdb-find'))
const fs = require('fs')
let Parser = require('rss-parser')
let isParsing = false
var LZUTF8 = require('lzutf8')

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

      /** RUNNING PARSER PROCESS */
      parse()
      setInterval(function () {
        parse()
      }, 30000)
    } else {
      console.log('UNABLE TO READ MAIN SID, WRONG PASSWORD.')
    }
  } else {
    console.log('MAIN xSID NOT FOUND, PLEASE ADD IT INTO YOUR .env FILE')
  }
}

async function parse() {
  if (!isParsing) {
    isParsing = true
    try {

      let parser = new Parser()
      let feeds = process.env.FEEDS.split(',')
      for (let k in feeds) {
        let url = feeds[k]
        let feed = await parser.parseURL(url);
        console.log('PARSING FEED: ' + feed.title);

        let i = 0
        let xsid = await scrypta.readxKey(process.env.MAIN_PWD, process.env.MAIN_SID)

        if (xsid !== false) {
          let masterKey = await scrypta.deriveKeyFromSeed(xsid.seed, 'm/0')
          console.log('MASTER KEY IS', masterKey.pub)
          let masterBalance = await scrypta.get('/balance/' + masterKey.pub)

          if (masterBalance.balance > 0.5) {
            for (let k in feed.items) {
              let item = feed.items[k]
              console.log('CHECKING ITEM #' + i, item.title + ' PUBLISHED AT ' + item.link + ' WRITTEN BY ' + item.creator)
              let hash = await scrypta.hash(item.creator)
              let path = await scrypta.hashtopath(hash)
              let authorKey = await scrypta.deriveKeyFromSeed(xsid.seed, path)

              let author = {
                name: item.creator,
                hash: hash,
                address: authorKey.pub,
                prv: authorKey.prv,
                path: path,
                xpub: xsid.xpub
              }

              console.log('AUTHOR ADDRESS IS', authorKey.pub)
              let balance = await scrypta.get('/balance/' + author.address)
              console.log('BALANCE IS', balance.balance, 'LYRA')

              let content = LZUTF8.compress(item['content:encoded'], { outputEncoding: 'Base64' });
              let bytes = content.length
              let fees = Math.ceil(bytes / 7500) * 0.001
              console.log('FEES ARE', fees, 'LYRA')

              if (balance.balance < fees) {
                console.log('NEED TO FUND ADDRESS', author.address)
              }
              i++
            }
          } else {
            console.log('MASTER BALANCE IS TOO LOW', masterBalance.balance, 'LYRA')
          }
        } else {
          console.log('ERROR WHILE READING xSID')
        }
      }

      isParsing = false

    } catch (e) {
      isParsing = false
    }
  }
}

bootstrap()