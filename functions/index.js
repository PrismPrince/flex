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
  var { title, body } = snap.data()

  return admin.firestore().collection('subscribers').get().then(snapshot => snapshot.forEach(doc => {
    var { token } = doc.data()
    var payload = {
      notification: {
        title,
        body,
        icon: '/img/icons/android-chrome-192x192.png',
        click_action: '/post/id'
      },
      data: {
        badge: '/img/icons/android-chrome-192x192.png'
      }
    }

    admin.messaging().sendToDevice(token, payload).then(response => response.results.forEach(result => {
      console.log('Success delivery to', token, result)

      if (result.error) {
        console.error('Failed delivery to', token, result.error)

        // Prepare unused tokens for removal
        if (result.error.code === 'messaging/invalid-registration-token' || result.error.code === 'messaging/registration-token-not-registered') {
          doc.delete()
          console.info('Was removed:', token)
        }
      } else console.info('Notification sent to', token)
    })).catch(error => { console.error('Error sending to', token, error) })
  })).catch(error => { console.error('Error getting subscribers', error) })
  // })).catch(error => {
  //   console.error('Unable to send notification', error)
  // })
})
