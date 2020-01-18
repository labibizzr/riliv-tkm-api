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
  Route.post('/answers','TkmController.store') //post jawaban sekaligus menghitung nilai

  Route.post('/auth/login','AuthController.login') //login, ada validasi check 10 hari
  Route.post('/user/register','AuthController.register') //simpan informasi2 tambahan
  Route.get('user/register/check/:userId','AuthController.checkUser') //check apakah user sudah register (mengisi data) atau belum. Return status = 0 jika belum, status = 1 jika sudah
})
.prefix('api/v0/tkm')


Route.post('/dummy','DummyController.post')
