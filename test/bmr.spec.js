var assert = require('assert');
const dialogflow = require('dialogflow');
const credentials = require('../credentials.json');
const sessionClient = new dialogflow.SessionsClient({ credentials: credentials });
const uuid = require('uuid');

describe("Calculate BMR", () => {

    const sessionId = uuid.v4();
    const session = sessionClient.sessionPath(credentials.project_id, sessionId);

    it("BMR flow 1", async () => {
        const initResult = await getResult(session, 'Calculate my BMR');
        assertIntent(initResult, 'bmr.init');
        assertTextResponse(initResult, 'Sure thing, so, how much do your weight?');
        assert.equal(getOutputContextName(initResult.outputContexts[0]), 'bmr');

        const weightResult = await getResult(session, 'I weight 67 kg');
        assertIntent(weightResult, 'bmr.weight');
        assertTextResponse(weightResult, 'Great, now, how about your height?');
        assert.equal(getOutputContextName(weightResult.outputContexts[0]), 'bmr');

        const heightResult = await getResult(session, 'I am 155 cm tall');
        assertIntent(heightResult, 'bmr.height');
        assertTextResponse(heightResult, 'Your bmr is about ...');
        const finalContext = heightResult.outputContexts[0];
        assert.equal(getOutputContextName(finalContext), 'bmr');
        assert.equal(finalContext.parameters.fields["unit-weight"].structValue.fields.unit.stringValue, 'kg');
        assert.equal(finalContext.parameters.fields["unit-weight"].structValue.fields.amount.numberValue, 67);
        assert.equal(finalContext.parameters.fields["unit-length"].structValue.fields.unit.stringValue, 'cm');
        assert.equal(finalContext.parameters.fields["unit-length"].structValue.fields.amount.numberValue, 155);
    });
});


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

assertTextResponse = (result, expectedMessage) => assert.equal(result.fulfillmentText, expectedMessage);