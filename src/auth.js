
import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

const region = import.meta.env.VITE_COGNITO_REGION
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID
const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN
const redirectUri = import.meta.env.VITE_REDIRECT_URI
const logoutUri = import.meta.env.VITE_LOGOUT_URI

if (!region || !userPoolId || !clientId || !cognitoDomain) {
  console.warn('Cognito configuration is incomplete. Check .env.local.')
}

const authority = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`

export const userManager = new UserManager({
  authority,
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: 'openid email',
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
  metadata: {
    issuer: authority,
    authorization_endpoint: `${cognitoDomain}/oauth2/authorize`,
    token_endpoint: `${cognitoDomain}/oauth2/token`,
    userinfo_endpoint: `${cognitoDomain}/oauth2/userInfo`,
    end_session_endpoint: `${cognitoDomain}/logout`,
  },
})

export async function signIn() {
  await userManager.signinRedirect()
}

let signInCallbackPromise = null

export async function completeSignIn() {
  if (!signInCallbackPromise) {
    signInCallbackPromise = userManager.signinRedirectCallback()
  }

  try {
    return await signInCallbackPromise
  } catch (error) {
    signInCallbackPromise = null
    throw error
  }
}

export async function signOut() {
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID
  const logoutUri = import.meta.env.VITE_LOGOUT_URI
  await userManager.removeUser()

  const logoutUrl = new URL(
    `${import.meta.env.VITE_COGNITO_DOMAIN}/logout`
  )
  logoutUrl.searchParams.set('client_id', clientId)
  logoutUrl.searchParams.set('logout_uri', logoutUri)

  window.location.assign(logoutUrl.toString())
}

export async function getCurrentUser() {
  const user = await userManager.getUser()

  if (!user || user.expired) {
    return null
  }

  return user
}

export async function getAccessToken() {
  const user = await userManager.getUser()

  if (!user || user.expired || !user.access_token) {
    throw new Error(
      'Unable to find a valid Cognito access token. Please sign in again.'
    )
  }

  return user.access_token
}
