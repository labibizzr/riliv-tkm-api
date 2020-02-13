'use strict'
const fs            = require('fs'),
Env                 = use('Env'),
{GoogleSpreadsheet} = require('google-spreadsheet')


class SheetController {

  async write(){

  // var creds = fs.readFileSync('././client_secret.json','utf-8')
     // Identifying which document we'll be accessing/reading from
  const doc = new GoogleSpreadsheet('17FyL08Kut3x5hCPgr3jfgnv3Fhhp612RC07w5q0vF0Q');

  // console.log(doc)
  // Authentication
  // await doc.useServiceAccountAuth(creds)
  console.log(Env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL'))
  console.log(Env.get('GOOGLE_PRIVATE_KEY'))
  await doc.useServiceAccountAuth({
    client_email: Env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
    private_key: Env.get('GOOGLE_PRIVATE_KEY')
  })
console.log(doc)
  await doc.loadInfo(); // loads document properties and worksheets
  console.log(doc.title);
  // const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]
  // console.log(sheet.title);
  // console.log(sheet.rowCount);



  // const sheet = await doc.addSheet({ headers: ['name', 'email'], title: 'Data' });

  const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]
  const larryRow = await sheet.addRow({ name: 'Larry Page', email: 'larry@google.com' })
  // const moreRows = await sheet.addRows([
  //   { name: 'Sergey Brin', email: 'sergey@google.com' },
  //   { name: 'Eric Schmidt', email: 'eric@google.com' },
  // ])

  // read rows
  const rows = await sheet.getRows(); // can pass in { limit, offset }

  console.log(rows)

  }

 
}

  



module.exports = SheetController
