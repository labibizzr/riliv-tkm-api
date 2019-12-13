'use strict'
const User = use('App/Models/User')
class AuthController {


  async login({ request, auth, response }){


    let data = request.all()

    let userData =
      {
        email : data.email,
        image : data.avatar,
        name : data.name,
        roleId : '2'
      }

    let user = await User.findOrCreate(userData)

    let token = await auth.generate(user)

    Object.assign(user,token)

    return response.json(user)

  }


}

module.exports = AuthController
