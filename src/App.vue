<template>
  <div id="app">
    Token: {{ userToken }}<br>
    <button v-if="userToken === null" @click="subscribe">Subscribe</button>
    <button v-if="userToken !== null" @click="unsubscribe">Unsubscribe</button>
    <br>
    <button @click="post">Post</button>
    <br>
    <p v-for="subscriber in subscribers" :key="subscriber.id">{{ subscriber.token }}</p>
    <p v-for="post in posts" :key="post.id">
      <strong>{{ post.title }}</strong>
      {{ post.body }}
    </p>
  </div>
</template>

<script>
import Firebase from './services/firebase'

const messaging = Firebase.messaging()
const database = Firebase.firestore()

messaging.usePublicVapidKey(process.env.VUE_APP_FIREBASE_PUBLIC_VAPID_KEY)

export default {
  name: 'app',
  data () {
    return {
      userToken: window.localStorage.getItem('pushToken') || null,
      posts: [],
      subscribers: []
    }
  },
  firestore () {
    return {
      posts: database.collection('posts').orderBy('title'),
      subscribers: database.collection('subscribers')
    }
  },
  created () {
    messaging.onMessage(payload => {
      // alert user on focus
      console.log('Focus payload', payload)
    })
  },
  methods: {
    post () {
      database.collection('posts').add({title: `Title-${Math.random()}`, body: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.`})
    },
    subscribe () {
      messaging.requestPermission().then(() => messaging.getToken()).then(token => {
        window.localStorage.setItem('pushToken', token)
        database.collection('subscribers')
          .add({ token })
          .then(subscriber => {
            console.log('Subscribed', subscriber)
          })
        this.userToken = token
      }).catch(err => {
        console.error('Denied', err)
      })
    },
    unsubscribe () {
      messaging.getToken().then(userToken => {
        messaging.deleteToken(userToken).then(() => {
          window.localStorage.removeItem('pushToken')
          database.collection('subscribers')
            .doc(this.subscribers.find(subscriber => subscriber.token === userToken).id)
            .delete()
            .then(() => {
              console.log('Unubscribed', userToken)
            })
          this.userToken = null
        }).catch(err => {
          console.error('Error unsubscribing', err)
        })
      })
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
