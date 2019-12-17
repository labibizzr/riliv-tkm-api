'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with tkms
 */
const {
  validate
} = use('Validator')
const User = use('App/Models/User')

class TkmController {

  async getSoal({
    response
  }) {

    const tkmQuestion = use('App/Models/TkmQuestion')

    const soal = await tkmQuestion.all()

    return soal
  }

  async store({request,response}) {


    const tkmResult = use('App/Models/TkmResult')
    const tkmQuestion = use('App/Models/TkmQuestion')
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

        let scores = this.evaluateScores(payload.soal)

        console.log(scores)

        tkm_result.depression_score= scores.depression_score
        tkm_result.anxiety_score= scores.anxiety_score
        tkm_result.stress_score= scores.stress_score
        await tkm_result.save()
        let tkmAnswer = use('App/Models/TkmAnswer')

        // console.log(payload.soal[0])
        let answerData = []
          payload.soal.forEach((item,index)=>{
            answerData.push({
              question_id : item.id,
              score : item.answer,
              result_id: tkm_result.id
            })
        })
        await tkmAnswer.createMany(answerData)


        return response.status(201).send('Created')

      }
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
