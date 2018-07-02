const admin = require('firebase-admin')
const functions = require('firebase-functions')

admin.initializeApp(functions.config().firebase)

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// exports.sendCreateWebTool = functions.firestore.document('web-tools/{webToolId}').onCreate((snap, context) => {
exports.sendCreatePost = functions.firestore.document('posts/{id}').onCreate((snap, context) => {
  // var { title, version } = snap.data()
  var { title, body } = snap.data()
  admin.firestore().collection('subscribers').get().then(snapshot => snapshot.forEach(doc => {
    var { token } = doc.data()
    var payload = {
      notification: {
        title,
        icon: '/img/icons/android-chrome-192x192.png',
        body
      }
    }

    admin.messaging().sendToDevice(token, payload).then(response => response.results.forEach(result => {
      if (result.error) {
        console.error('Failed delivery to', token, result.error)

        // Prepare unused tokens for removal
        if (result.error.code === 'messaging/invalid-registration-token' || result.error.code === 'messaging/registration-token-not-registered') {
          doc.delete()
          console.info('Was removed:', token)
        }
      } else {
        console.info('Notification sent to', token)
      }
    })).catch(error => error)
  })).catch(error => error)
  // })).catch(error => {
  //   console.error('Unable to send notification', error)
  // })
})
