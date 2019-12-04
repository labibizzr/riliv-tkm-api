'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class TkmSoal extends Model {

  static get table(){
    return 'TkmSoal'
  }

}


module.exports = TkmSoal
