<template>
  <div>
    <div>
      <button class="icon" @click="signInWithGoogle" v-close-popover>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" class="material-icons">
          <path
            d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
          />
        </svg>
        <span>Google</span>
      </button>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app"
import { fb } from "~/helpers/fb"

export default {
  data() {
    return {
      fb,
      test: JSON.parse(JSON.stringify(this.$store.state)),
    }
  },
  methods: {
    showLoginSuccess() {
      this.$toast.info(this.$t("login_success"), {
        icon: "vpn_key",
      })
    },
    signInWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider()
      const self = this
      firebase
        .auth()
        .signInWithPopup(provider)
        .then(({ additionalUserInfo }) => {
          this.$store.commit("postwoman/setUser", additionalUserInfo)
          if (additionalUserInfo.isNewUser) {
            self.$toast.info(`${self.$t("turn_on")} ${self.$t("sync")}`, {
              icon: "sync",
              duration: null,
              closeOnSwipe: false,
              action: {
                text: self.$t("yes"),
                onClick: (e, toastObject) => {
                  fb.writeSettings("syncHistory", true)
                  fb.writeSettings("syncCollections", true)
                  fb.writeSettings("syncEnvironments", true)
                  self.$router.push({ path: "/settings" })
                  toastObject.remove()
                },
              },
            })
          }
          this.$router.push("/")
          self.showLoginSuccess()
        })
        .catch((err) => {
          console.log(err)
          // An error happened.
          if (err.code === "auth/account-exists-with-different-credential") {
            // Step 2.
            // User's email already exists.
            // The pending Google credential.
            const pendingCred = err.credential
            // The provider account's email address.
            const email = err.email
            // Get sign-in methods for this email.
            firebase
              .auth()
              .fetchSignInMethodsForEmail(email)
              .then((methods) => {
                // Step 3.
                // If the user has several sign-in methods,
                // the first method in the list will be the "recommended" method to use.
                if (methods[0] === "password") {
                  // Asks the user their password.
                  // In real scenario, you should handle this asynchronously.
                  const password = promptUserForPassword() // TODO: implement promptUserForPassword.
                  auth
                    .signInWithEmailAndPassword(email, password)
                    .then((
                      user // Step 4a.
                    ) => user.linkWithCredential(pendingCred))
                    .then(() => {
                      // Google account successfully linked to the existing Firebase user.
                      self.showLoginSuccess()
                    })
                  return
                }

                self.$toast.info(`${self.$t("login_with")}`, {
                  icon: "vpn_key",
                  duration: null,
                  closeOnSwipe: false,
                  action: {
                    text: self.$t("yes"),
                    onClick: (e, toastObject) => {
                      // All the other cases are external providers.
                      // Construct provider object for that provider.
                      // TODO: implement getProviderForProviderId.
                      const provider = new firebase.auth.GithubAuthProvider()
                      // At this point, you should let the user know that they already has an account
                      // but with a different provider, and let them validate the fact they want to
                      // sign in with this provider.
                      // Sign in to provider. Note: browsers usually block popup triggered asynchronously,
                      // so in real scenario you should ask the user to click on a "continue" button
                      // that will trigger the signInWithPopup.
                      firebase
                        .auth()
                        .signInWithPopup(provider)
                        .then(({ user }) => {
                          // Remember that the user may have signed in with an account that has a different email
                          // address than the first one. This can happen as Firebase doesn't control the provider's
                          // sign in flow and the user is free to login using whichever account they own.
                          // Step 4b.
                          // Link to Google credential.
                          // As we have access to the pending credential, we can directly call the link method.
                          user.linkAndRetrieveDataWithCredential(pendingCred).then((usercred) => {
                            // Google account successfully linked to the existing Firebase user.
                            self.showLoginSuccess()
                          })
                        })

                      toastObject.remove()
                    },
                  },
                })
              })
          }
        })
    },
    signInWithGithub() {
      const provider = new firebase.auth.GithubAuthProvider()
      const self = this
      firebase
        .auth()
        .signInWithPopup(provider)
        .then(({ additionalUserInfo }) => {
          if (additionalUserInfo.isNewUser) {
            self.$toast.info(`${self.$t("turn_on")} ${self.$t("sync")}`, {
              icon: "sync",
              duration: null,
              closeOnSwipe: false,
              action: {
                text: self.$t("yes"),
                onClick: (e, toastObject) => {
                  fb.writeSettings("syncHistory", true)
                  fb.writeSettings("syncCollections", true)
                  fb.writeSettings("syncEnvironments", true)
                  self.$router.push({ path: "/settings" })
                  toastObject.remove()
                },
              },
            })
          }
          self.showLoginSuccess()
        })
        .catch((err) => {
          // An error happened.
          if (err.code === "auth/account-exists-with-different-credential") {
            // Step 2.
            // User's email already exists.
            // The pending Google credential.
            const pendingCred = err.credential
            // The provider account's email address.
            const email = err.email
            // Get sign-in methods for this email.
            firebase
              .auth()
              .fetchSignInMethodsForEmail(email)
              .then((methods) => {
                // Step 3.
                // If the user has several sign-in methods,
                // the first method in the list will be the "recommended" method to use.
                if (methods[0] === "password") {
                  // Asks the user their password.
                  // In real scenario, you should handle this asynchronously.
                  const password = promptUserForPassword() // TODO: implement promptUserForPassword.
                  firebase
                    .auth()
                    .signInWithEmailAndPassword(email, password)
                    .then((
                      user // Step 4a.
                    ) => user.linkWithCredential(pendingCred))
                    .then(() => {
                      // Google account successfully linked to the existing Firebase user.
                      self.showLoginSuccess()
                    })
                  return
                }

                self.$toast.info(`${self.$t("login_with")}`, {
                  icon: "vpn_key",
                  duration: null,
                  closeOnSwipe: false,
                  action: {
                    text: self.$t("yes"),
                    onClick: (e, toastObject) => {
                      // All the other cases are external providers.
                      // Construct provider object for that provider.
                      // TODO: implement getProviderForProviderId.
                      const provider = new firebase.auth.GoogleAuthProvider()
                      // At this point, you should let the user know that they already has an account
                      // but with a different provider, and let them validate the fact they want to
                      // sign in with this provider.
                      // Sign in to provider. Note: browsers usually block popup triggered asynchronously,
                      // so in real scenario you should ask the user to click on a "continue" button
                      // that will trigger the signInWithPopup.
                      firebase
                        .auth()
                        .signInWithPopup(provider)
                        .then(({ user }) => {
                          // Remember that the user may have signed in with an account that has a different email
                          // address than the first one. This can happen as Firebase doesn't control the provider's
                          // sign in flow and the user is free to login using whichever account they own.
                          // Step 4b.
                          // Link to Google credential.
                          // As we have access to the pending credential, we can directly call the link method.
                          user.linkAndRetrieveDataWithCredential(pendingCred).then((usercred) => {
                            self.showLoginSuccess()
                          })
                        })

                      toastObject.remove()
                    },
                  },
                })
              })
          }
        })
    },
  },
}
</script>
