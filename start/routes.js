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
  //get all soal
  Route.get('/soal','TkmController.getSoal')
  //get latest result from userId
  Route.get('/result/:userId','TkmController.getResult')
  //submit jawaban
  //data needed
  // object "user_id"
  // array jawaban

  //post jawaban sekaligus menghitung nilai
  Route.post('/answers','TkmController.store')

  //login, ada validasi check 10 hari
  Route.post('/auth/login','AuthController.login')
  //simpan informasi2 tambahan
  Route.post('/user/register','AuthController.register')
  //check apakah user sudah register (mengisi data) atau belum. Return status = 0 jika belum, status = 1 jika sudah
  Route.get('user/register/check/:userId','AuthController.checkUser')
})
.prefix('api/v0/tkm')


Route.post('/dummy','DummyController.post')
