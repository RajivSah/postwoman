export default function ({ store, redirect }) {
  if (store.getters["postwoman/user"] == null) {
    return redirect("/login")
  }
}
