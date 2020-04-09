const fs = require('fs');
const path = require('path');
const YAML = require('yaml')
const prettier = require('prettier');
const UTF8 = 'utf-8';

const template = fs.readFileSync('././scenario-testing/test.template.js', UTF8);

run = () => {
    const YML_EXTENSION = ".yml";
    const filesPath = getAllFiles("././scenario-testing/scenarios/")
        .filter(file => file.lastIndexOf(YML_EXTENSION) === file.length - 4);


    filesPath.forEach(filePath => {
        const fileName = filePath.substring(filePath.lastIndexOf("/") + 1, filePath.lastIndexOf(YML_EXTENSION));
        const scenarioFile = fs.readFileSync(filePath, UTF8);
        const scenarios = YAML.parse(scenarioFile);

        const tests = Object.keys(scenarios).map(scenarioName => {
            const scenario = scenarios[scenarioName];
            return buildScenario(scenario, scenarioName);
        }).join("");


        const describeBlock = `describe(${raw(fileName)}, () => {
            ${tests}
            });`;

        testFile = template.replace("//{{TEST_GOES_HERE}}", describeBlock);
        const formattedFile = prettier.format(testFile, { parser: "babel" });
        fs.writeFileSync(`././scenario-testing/generated/${fileName}.js`, formattedFile, { encoding: UTF8, flag: 'w' });
    });
}

buildScenario = (scenario, name) => {
    return scenario.map((step, stepId) => {
        return step.user.map((userPhrase, phraseId) => {
            const stepResultVariable = `step_${stepId}_${phraseId}_result`;

            let testTemplate = `it("Scenario ${stepId}-${phraseId} - ${name}", async () => {
                const sessionId = uuid.v4();
                const session = sessionClient.sessionPath(credentials.project_id, sessionId);`;
            testTemplate += `\nconst ${stepResultVariable} = await getResult(session, ${raw(userPhrase)});`;
            testTemplate += `\nassertTextResponse(${stepResultVariable}, ${raw(step.agent)});`;
            if (step.intent) {
                testTemplate += `\nassertIntent(${stepResultVariable}, ${raw(step.intent)});`;
            }
            if (step.outputContext) {
                //assert.equal(getOutputContextName(initResult.outputContexts[0]), 'bmr');
            }

            if (step.inputContext) {

            }

            testTemplate += "\n});\n";
            return testTemplate;
        }).join("");
    }).join("");
}

// describe("Calculate BMR", () => {

//     const sessionId = uuid.v4();
//     const session = sessionClient.sessionPath(credentials.project_id, sessionId);

//     it("BMR flow 1", async () => {
//         const initResult = await getResult(session, 'Calculate my BMR');
//         assertIntent(initResult, 'bmr.init');
//         assertTextResponse(initResult, 'Sure thing, so, how much do your weight?');
//         assert.equal(getOutputContextName(initResult.outputContexts[0]), 'bmr');

//         const weightResult = await getResult(session, 'I weight 67 kg');
//         assertIntent(weightResult, 'bmr.weight');
//         assertTextResponse(weightResult, 'Great, now, how about your height?');
//         assert.equal(getOutputContextName(weightResult.outputContexts[0]), 'bmr');

//         const heightResult = await getResult(session, 'I am 155 cm tall');
//         assertIntent(heightResult, 'bmr.height');
//         assertTextResponse(heightResult, 'Your bmr is about ...');
//         const finalContext = heightResult.outputContexts[0];
//         assert.equal(getOutputContextName(finalContext), 'bmr');
//         assert.equal(finalContext.parameters.fields["unit-weight"].structValue.fields.unit.stringValue, 'kg');
//         assert.equal(finalContext.parameters.fields["unit-weight"].structValue.fields.amount.numberValue, 67);
//         assert.equal(finalContext.parameters.fields["unit-length"].structValue.fields.unit.stringValue, 'cm');
//         assert.equal(finalContext.parameters.fields["unit-length"].structValue.fields.amount.numberValue, 155);
//     });
// });

raw = (val) => JSON.stringify(val);

getAllFiles = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {

        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));

    });
    return filelist;
}

run();