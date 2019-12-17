'use strict'
const User = use('App/Models/User')
class AuthController {


  async login({ request, auth, response }){


    let data = request.all()

    // return data
    let userData =
      {
        email : data.email,
        image : data.avatar,
        name : data.name,
        roleId : '2'
      }

    let user = await User.findOrCreate(userData)

    let token = await auth.generate(user)

    let userId = {
      user_id : user.id
    }


    // Append token to user
    Object.assign(userId,token)

    return response.json(userId)

  }


}

module.exports = AuthController
