import Mailchimp from 'mailchimp-api-v3'

import { Log } from '../log'
import { getEnv } from '../env'


const log = new Log('[Mailchimp]')

const MAILCHIMP_API_KEY = getEnv('MAILCHIMP_API_KEY')

let client = null
try {
  client = new Mailchimp(MAILCHIMP_API_KEY)
} catch(error) {
  // Invalid API_KEY
}


/**
 * Mailchimp client, uses `mailchimp-api-v3` behind the scenes {@link https://developer.mailchimp.com/}
 * @namespace
 */
const mailchimp = {
  /**
   * Register a user to a Mailchimp list.
   * @param  {string} email  - User email
   * @param  {string} [listId] - The list you want to register the user to. It'll try to use MAILCHIMP_LIST_ID if it's not defined
   * @return {Promise<boolean>} - True if the operation was successfull
   */
  subscribe: (email, listId) => {
    if (! listId) {
      listId = getEnv('MAILCHIMP_LIST_ID', () => {
        throw new Error('Missing Mailchimp List Id: MAILCHIMP_LIST_ID')
      })
    }

    return client.post(`/lists/${listId}/members`, {
      email_address: email,
      status: 'subscribed',
    }).then(function(response) {
      if (response.error) {
        return false
      }

      log.info(`Subscribed ${email} to list ${listId}`)
      return true

    }).catch(error => {
      if (error.title === 'Member Exists') {
        return true
      }

      log.error(`Error trying to subscribe ${email} to list ${listId}`, error)
      return false
    })
  }
}

export default mailchimp

