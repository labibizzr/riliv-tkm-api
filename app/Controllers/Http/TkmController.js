'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with tkms
 */
const { validate }        = use('Validator')
const User                = use('App/Models/User')
const tkmResult           = use('App/Models/TkmResult')
const tkmQuestion         = use('App/Models/TkmQuestion')
const Database            = use('Database')
const Env                 = use('Env')
const {GoogleSpreadsheet} = require('google-spreadsheet')
const moment = require('moment');

class TkmController {

  async getSoal({response}) {

    const tkmQuestion = use('App/Models/TkmQuestion')

    const soal = await tkmQuestion.all()

    return soal
  }

  async storeAddress({request, response}){

    let payload = request.all()

    const rules = {
      user_id: 'required|integer',
      provinsi: 'required',
      'kabupaten': 'required',
      'kecamatan': 'required',
      'alamat': 'required'
    }

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
        await user.save()
        return response.json({
          user_id: payload.user_id,
          messages: 'Request success'
        })
      }
    }

  }

  //menyimpan jawaban user sekaligus memberikan nilai terhadap jawaban tersebut
  async store({request,response}) {

    let payload = request.all()

    const rules = {
      user_id: 'required|integer',
      'soal.*.answer': 'required|integer|under:4' //tiap array di ke 'soal' harus punya key 'answer' dengan rule integer & under 4
    }

    const validation = await validate(payload, rules)

    const user = await User.find(payload.user_id)


    if (validation.fails()) {
      return response.badRequest(validation.messages())
    } else if (!user) {
      return response.badRequest("No user with requested user ID presents in table")
    }
    else {


        let tkm_result = new tkmResult()

        tkm_result.user_id = payload.user_id

        let answer_packet = payload.soal //answer_packet = semua jawaban yang diisi user dikirim melalui JSON

        // loop semua answer packet
        for (let item of answer_packet){
          let id_soal = item.id

          let soal = await tkmQuestion.find(id_soal)

          item.type = soal.type
        }

        console.log(answer_packet)
        let scores = this.evaluateScores(answer_packet)

        console.log(scores)

        tkm_result.depression_score= scores.depression_score
        tkm_result.anxiety_score= scores.anxiety_score
        tkm_result.stress_score= scores.stress_score
        await tkm_result.save()
        let tkmAnswer = use('App/Models/TkmAnswer')

        // console.log(payload.soal[0])
        let answerData = []
          answer_packet.forEach((item,index)=>{
            answerData.push({
              question_id : item.id,
              score : item.answer,
              result_id: tkm_result.id
            })
        })
        await tkmAnswer.createMany(answerData)

        if(user.kabupaten != null){
            if(user.kabupaten.toLowerCase() == 'kota surabaya'){
            let level = this.evaluateLevel(tkm_result)

            var sheetData = {
            user_id : payload.user_id,
            depression_score: tkm_result.depression_score,
            anxiety_score: tkm_result.anxiety_score,
            stress_score: tkm_result.stress_score,
            depression_level : level.depression,
            anxiety_level : level.anxiety,
            stress_level : level.stress
            }

            this.publishSheet(sheetData)
            console.log("published to sheet")
          }
        }
        return response.status(201).send('Created')

      }
    }

  //fungsi ambil result sesuai id_user (ambil paling akhir)
  async publishSheet(data){

      const user = await User.find(data.user_id)

      const doc = new GoogleSpreadsheet(Env.get('SPREADSHEET_ID'));

      await doc.useServiceAccountAuth({
        client_email: Env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
        private_key: Env.get('GOOGLE_PRIVATE_KEY')
      })

      await doc.loadInfo()

      var rowData = {
        email : user.email,
        alamat : user.address,
        kecamatan : user.kecamatan,
        nik : user.nik,
        'jenis kelamin' : user.gender,
        'tgl lahir' : moment(user.bornday).format("D/MM/YYYY"),
        'nilai depresi' : data.depression_score,
        'level depresi' : data.depression_level,
        'nilai kecemasan' : data.anxiety_score,
        'level kecemasan' : data.anxiety_level,
        'nilai stres' : data.stress_score,
        'level stres' : data.stress_level,
      }

      // console.log(doc.title)

      const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]

      var newRow = await sheet.addRow(rowData)

      return newRow

  }

   async getResult({ response, params, auth}){

    let user = await auth.getUser()

    let isCorrectUserId = (user.id == params.userId)

    if(isCorrectUserId){

      let resultDataQuery = await Database
        .select('*')
        .from('tkm_results')
        .where('user_id', '=' ,user.id)
        .orderBy('id','desc')
        .limit(1)
      let resultData = resultDataQuery[0]

      let level = this.evaluateLevel(resultData)

      let data = {
        user_id: user.id,
        depression_score: resultData.depression_score,
        anxiety_score: resultData.anxiety_score,
        stress_score: resultData.stress_score,
        depression_level : level.depression,
        anxiety_level : level.anxiety,
        stress_level : level.stress
      }
      return data
    }
      //user id request tidak sama dengan token (unauthorized)
    else{
        let messages = {
          message : 'unauthorized user',
          isAllowed : false
        }
        return response.status(401).send(messages)
    }
  }



  //input object JSON dengan nilai score DAS
  //output object JSOn dengan LEVEL DAS
  evaluateLevel(payload){

    let level = {}

    let d_score = payload.depression_score
    let a_score = payload.anxiety_score
    let s_score = payload.stress_score

    if(d_score<=9)
    level.depression="Normal"
    else if(d_score<=13)
    level.depression="Ringan"
    else if(d_score<=20)
    level.depression="Sedang"
    else if(d_score<=27)
    level.depression="Parah"
    else if(d_score>=28)
    level.depression="Sangat Parah"

    if(a_score<=9)
    level.anxiety="Normal"
    else if(a_score<=13)
    level.anxiety="Ringan"
    else if(a_score<=20)
    level.anxiety="Sedang"
    else if(a_score<=27)
    level.anxiety="Parah"
    else if(a_score>=28)
    level.anxiety="Sangat Parah"

    if(s_score<=9)
    level.stress="Normal"
    else if(s_score<=13)
    level.stress="Ringan"
    else if(s_score<=20)
    level.stress="Sedang"
    else if(s_score<=27)
    level.stress="Parah"
    else if(s_score>=28)
    level.stress="Sangat Parah"

    return level

  }

  //function to ngitung nilai
  evaluateScores(questions){
    let depression_score_sum = 0, anxiety_score_sum = 0, stress_score_sum = 0

    questions.forEach((item,index) => {
      if(item.type == "d")
      depression_score_sum+=(item.answer)
      else if(item.type == "a")
      anxiety_score_sum+=(item.answer)
        else
        stress_score_sum+=(item.answer)
    })

     depression_score_sum = depression_score_sum* 2
     anxiety_score_sum = anxiety_score_sum * 2
     stress_score_sum = stress_score_sum * 2

    let scores = {
      depression_score : depression_score_sum,
      anxiety_score : anxiety_score_sum,
      stress_score : stress_score_sum
    }

    console.log(scores)
    return scores
  }

}

module.exports = TkmController
