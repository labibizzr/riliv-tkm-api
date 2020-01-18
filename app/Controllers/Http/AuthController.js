'use strict'
const User = use('App/Models/User')
const Database = use('Database')
const moment = use('Moment')
const { validate } = use('Validator')
class AuthController {


  async login({ request, auth, response }){
    let data = request.all()

    // return data
    const userData = {
      email: data.email,
      image: data.avatar,
      name: data.name,
      roleId: '2'
    }


    //find user by field 'EMAIL'
    const user = await User.findBy('email', userData.email)


    // return user == null (tidak ada user dengan email yg sama)

    if (user == null) {

      let newUser = new User()
      newUser.email = userData.email
      newUser.image = userData.image
      newUser.name = userData.name
      newUser.roleId = '2'
      await newUser.save()

      let token = await auth.generate(newUser)

      let newUserId = {
        user_id: newUser.id
      }

      // Append token to user
      Object.assign(newUserId, token)

      return response.json(newUserId)
    }

    //User sudah ada
    else {
      const user_id = user.id

      //get latest result
      let latestResult = await Database //return array of object
        .select('*')
        .from('tkm_results')
        .where('user_id', '=', 44)
        .orderBy('created_at', 'desc')
        .limit(1)

      //ada latestResult (sudah pernah test)
      if (Array.isArray(latestResult) && latestResult.length) {

        let resultDate = moment(latestResult[0].created_at)
        let nowDate = moment()
        let daysDifference = nowDate.diff(resultDate, 'days') + 1

        //apabila jarak test kurang dari 10 hari
        if (daysDifference <= 10) {

          let payload = {
            allow: 0,
            messages: 'Difference between test is less than 10 days'
          }
          return response.status(402).send(payload)
        }
        //jarak test lebih dari 10 hari
        else {
          let token = await auth.generate(user)
          let userId = {
            user_id: newUser.id
          }

          // Append token to user
          Object.assign(userId, token)
          return response.json(userId)
        }
      }
      //User sudah ada, belum pernah tes tkm
      else {

        let token = await auth.generate(user)

        let userId = {
          user_id: user.id
        }


        // Append token to user
        Object.assign(userId, token)

        return response.json(userId)
      }


    }
    }

    async checkUser({response, params}){

      console.log(params)

      let userId = params.userId

      let user = await User.find(userId) //cari user

      if (user == null){ //apabila tidak ada user
        return response.badRequest('User not found')
      }
      else{ //apabila ada user

        if(user.birthdate == null){
          var status = 0
        }
        else if(user.birthdate != null){
         var status = 1
        }

        let data = {
          status : status,
          user_id : user.id
        }

        return response.json(data)
      }

    }

    async register({request, response}){

      let payload = request.all()

      const rules = {
        'user_id' : 'required|integer',
        'provinsi' : 'required',
        'kabupaten': 'required',
        'kecamatan': 'required',
        'alamat' : 'required',
        'name'  : 'required',
        'nik' : 'required',
        'phone' : 'required',
        'gender' : 'required',
        'birthdate' : 'required|date'
      }
      //date di navicat = YYYY/MM/DD
      //Format date yang dibutuhkan fungsi ini = YYYY/MM/DD
      const validation = await validate(payload, rules)

      if (validation.fails()) {
        return response.badRequest(validation.messages())
      } else {
        let user = await User.find(payload.user_id)

        //bila ga ada user
        if (user == null) {
          return response.badRequest('User not found')
        } else {

          let address = payload.provinsi + ';' + payload.kabupaten+ ';' + payload.kecamatan + ';' + payload.alamat

          user.address = address
          user.name = payload.name
          user.nik = payload.nik
          user.phone = payload.phone
          user.gender = payload.gender
          user.birthdate = payload.birthdate

          await user.save()
          return response.json({
            user_id: payload.user_id,
            messages: 'Request success'
          })
        }
      }

    }


  // This should work in node.js and other ES5 compliant implementations.
  isEmptyObject(obj) {
  return !Object.keys(obj).length;
}


}

module.exports = AuthController
