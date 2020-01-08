'use strict'
const User = use('App/Models/User')
const Database = use('Database')
const moment = use('Moment')

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
          user_id:user.id
        }


        // Append token to user
        Object.assign(userId, token)

        return response.json(userId)
      }


    }


    }

  // This should work in node.js and other ES5 compliant implementations.
  isEmptyObject(obj) {
  return !Object.keys(obj).length;
}


}

module.exports = AuthController
