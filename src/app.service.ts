import { Injectable } from '@nestjs/common'
const ScryptaCore = require('@scrypta/core')
require('dotenv').config()

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
      // TODO: HASH E-MAIL
      // TODO: DERIVE NUMBER FROM HASH
      // TODO: DERIVE CORRECT KEY
      // TODO: WRITE PUBKEY IN DB
      // TODO: RETURN OBJECT
      return true;
    }else{
      return { message: "Error while registering author.", error: true}
    }
  }
}
