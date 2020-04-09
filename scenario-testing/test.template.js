/**
 * Automatically generated file.
 */

var assert = require('assert');
const dialogflow = require('dialogflow');
const credentials = require('../credentials.json');
const sessionClient = new dialogflow.SessionsClient({ credentials: credentials });
const uuid = require('uuid');

//{{TEST_GOES_HERE}}

/**
 * HELPER TEST FUNCTIONS
 */

buildRequest = (session, text, languageCode = 'en-US') => {
    return {
        session: session,
        queryInput: {
            text: {
                text: text,
                languageCode: languageCode
            }
        }
    }
}

getResult = async (session, message) => {
    const responses = await sessionClient.detectIntent(buildRequest(session, message));
    return responses[0].queryResult;
}

getOutputContextName = context => context.name.substring(context.name.lastIndexOf('/') + 1);

assertIntent = (result, expectedIntent) => assert.equal(result.intent.displayName, expectedIntent);

assertTextResponse = (result, possibleMessages) => assert.include(possibleMessages, result.fulfillmentText);