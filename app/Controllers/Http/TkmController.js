'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with tkms
 */
class TkmController {

  async getSoal(){

    const tkmSoal = use('App/Models/TkmSoal')

    const soal = await tkmSoal.all()

    const soalJSON = soal.toJSON()

    return soalJSON
  }

  async store


}

module.exports = TkmController
