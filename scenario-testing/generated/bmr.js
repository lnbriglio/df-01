/**
 * Automatically generated file.
 */

var assert = require("assert");
const dialogflow = require("dialogflow");
const credentials = require("../credentials.json");
const sessionClient = new dialogflow.SessionsClient({
  credentials: credentials,
});
const uuid = require("uuid");

describe("bmr", () => {
  it("Scenario 0-0 - case 1 - single input and single responses", async () => {
    const sessionId = uuid.v4();
    const session = sessionClient.sessionPath(
      credentials.project_id,
      sessionId
    );
    const step_0_0_result = await getResult(
      session,
      'I say this "Name" is Sass\'y'
    );
    assertTextResponse(step_0_0_result, ["We say your are bad"]);
    assertIntent(step_0_0_result, "bmr.init");
  });
  it("Scenario 0-0 - case 2 - inputs and multiple responses", async () => {
    const sessionId = uuid.v4();
    const session = sessionClient.sessionPath(
      credentials.project_id,
      sessionId
    );
    const step_0_0_result = await getResult(
      session,
      'I say this "Name" is Sass\'y'
    );
    assertTextResponse(step_0_0_result, [
      "We say your are bad",
      "We say your are bad",
    ]);
  });
  it("Scenario 0-0 - case 3 - contexts", async () => {
    const sessionId = uuid.v4();
    const session = sessionClient.sessionPath(
      credentials.project_id,
      sessionId
    );
    const step_0_0_result = await getResult(
      session,
      'I say this "Name" is Sass\'y'
    );
    assertTextResponse(step_0_0_result, [
      "We say your are bad",
      "We say your are bad",
    ]);
  });
  it("Scenario 0-0 - case 3 - context with parameters", async () => {
    const sessionId = uuid.v4();
    const session = sessionClient.sessionPath(
      credentials.project_id,
      sessionId
    );
    const step_0_0_result = await getResult(
      session,
      'I say this "Name" is Sass\'y'
    );
    assertTextResponse(step_0_0_result, [
      "We say your are bad",
      "We say your are bad",
    ]);
  });
});

/**
 * HELPER TEST FUNCTIONS
 */

buildRequest = (session, text, languageCode = "en-US") => {
  return {
    session: session,
    queryInput: {
      text: {
        text: text,
        languageCode: languageCode,
      },
    },
  };
};

getResult = async (session, message) => {
  const responses = await sessionClient.detectIntent(
    buildRequest(session, message)
  );
  return responses[0].queryResult;
};

getOutputContextName = (context) =>
  context.name.substring(context.name.lastIndexOf("/") + 1);

assertIntent = (result, expectedIntent) =>
  assert.equal(result.intent.displayName, expectedIntent);

assertTextResponse = (result, possibleMessages) =>
  assert.include(possibleMessages, result.fulfillmentText);
