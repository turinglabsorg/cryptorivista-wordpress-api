import { Injectable } from '@nestjs/common'
const ScryptaCore = require('@scrypta/core')
require('dotenv').config()
import * as PouchDB from 'pouchdb'

@Injectable()
export class AppService {
  async getIdanodeStatus(): Promise<string> {
    const scrypta = new ScryptaCore
    let status = await scrypta.get('/wallet/getinfo')
    return status;
  }

  async postRequest(request): Promise<string> {
    const scrypta = new ScryptaCore
    let response = await scrypta.post(request.endpoint, request.params)
    return response;
  }

  async getRequest(request): Promise<string> {
    const scrypta = new ScryptaCore
    let response = await scrypta.get(request.endpoint)
    return response;
  }

  async registerAuthor(request): Promise<Object> {
    const scrypta = new ScryptaCore
    let xsid = await scrypta.readxKey(process.env.MAIN_PWD, process.env.MAIN_SID)
    if (xsid !== false) {

      let hash = await scrypta.hash(request.email)
      let path = await scrypta.hashtopath(hash)
      let derived = await scrypta.deriveKeyFromSeed(xsid.seed, path)
      let author = {
        name: request.name,
        email: request.email,
        hash: hash, 
        _id: derived.pub
      }
      try{
        const db = new PouchDB('wp-news')
        db.put(author).catch(e => {
          console.log('AUTHOR EXISTS')
        });
      }catch(e){
        console.log('ERROR ON STORING AUTHOR', e)
      }
      return author;
    }else{
      return { message: "Error while registering author.", error: true}
    }
  }
}
