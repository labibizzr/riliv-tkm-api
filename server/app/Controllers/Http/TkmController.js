'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with tkms
 */
class TkmController {

  async index(){

    const tkmSoal = use('App/Models/TkmSoal')

    const soal = await tkmSoal.all()

    const soalJSON = soal.toJSON()

    return soalJSON
  }
}

module.exports = TkmController
