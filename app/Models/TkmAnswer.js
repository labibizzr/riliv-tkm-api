'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class TkmAnswer extends Model {

  result(){
    return this.belongsTo('App/Models/TkmResult')
  }

  question(){
    return this.belongsTo('App/Models/TkmQuestion')
  }
}

module.exports = TkmAnswer
