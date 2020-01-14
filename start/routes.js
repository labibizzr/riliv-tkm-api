'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})


Route.group(() => {
  Route.get('/soal','TkmController.getSoal') //get all soal
  Route.get('/result/:userId','TkmController.getResult') //get latest result from userId
  //submit jawaban
  //data needed
  // object "user_id"
  // array jawaban
  Route.post('/answers','TkmController.store')

  Route.post('/auth/login','AuthController.login') //login
  Route.post('/user/register','AuthController.register') //simpan address

})
.prefix('api/v0/tkm')


Route.post('/dummy','DummyController.post')
