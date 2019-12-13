'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TkmSoalSchema extends Schema {
  up () {
    this.create('tkm_soals', (table) => {
      table.increments()
      table.timestamps()
    })
  }

  down () {
    this.drop('tkm_soals')
  }
}

module.exports = TkmSoalSchema
