'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class TkmResult extends Model {

  answer(){
    return this.hasMany('App/Models/TkmAnswer')
  }

  user(){
    return this.belongsTo('App/Models/User')
  }

  static get table () {
    return 'tkm_results'
  }

}

module.exports = TkmResult
