const fs = require('fs');
const path = require('path');
const dialogflow = require('dialogflow');
const credentials = require('./credentials.json');
const agentsClient = new dialogflow.v2.AgentsClient({ credentials: credentials });
const entitiesClient = new dialogflow.v2.EntityTypesClient({ credentials: credentials });
const intentsClient = new dialogflow.v2.IntentsClient({ credentials: credentials });
const contextsClient = new dialogflow.v2.ContextsClient({ credentials: credentials });
const uuid = require('uuid');

const project = credentials.project_id;
const formattedParent = entitiesClient.projectAgentPath(project);

dropAgent = () => {
    const agent = require("./dialogflow-elements/agent.json");
    return new Promise((res, rej) => {
        agentsClient.getAgent({
            parent: agentsClient.projectPath(credentials.project_id)
        })
            .then(agent => {
                if (agent) {
                    agentsClient.deleteAgent({
                        parent: agentsClient.projectPath(credentials.project_id)
                    });
                }
                return res();
            })
            .catch(err => {
                if (err.code === 5) {
                    //NOT FOUND
                    res();
                } else {
                    rej(err);
                }
            });
    });
}

createAgent = () => {
    const agent = require("./dialogflow-elements/agent.json");
    agent.parent = agentsClient.projectPath(credentials.project_id);
    return agentsClient.setAgent({
        agent: agent
    });
}


walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {

        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));

    });
    return filelist;
}

loadIntents = () => {
    const TRAINING_FILE_TRAILING = ".training.json";
    const RESPONSE_FILE_TRAILING = ".response.json";
    const sessionId = uuid.v4();

    return walkSync('././dialogflow-elements/intents/')
        .filter(file => !file.startsWith(TRAINING_FILE_TRAILING, file.lastIndexOf(TRAINING_FILE_TRAILING)) &&
            !file.startsWith(RESPONSE_FILE_TRAILING, file.lastIndexOf(RESPONSE_FILE_TRAILING)))
        .map(baseFile => {
            const intent = JSON.parse(fs.readFileSync(baseFile, "UTF-8"));
            const training = JSON.parse(fs.readFileSync(baseFile.substring(0, baseFile.lastIndexOf(".json")) + TRAINING_FILE_TRAILING, "UTF-8"));
            const messages = JSON.parse(fs.readFileSync(baseFile.substring(0, baseFile.lastIndexOf(".json")) + RESPONSE_FILE_TRAILING, "UTF-8"));
            intent.trainingPhrases = training;
            intent.messages = messages;

            intent.outputContexts = intent.outputContexts ? intent.outputContexts
                .map(context => {
                    context.name = contextsClient.contextPath(credentials.project_id, sessionId, context.name);
                    return context;
                }) : [];

            intent.inputContextNames = intent.inputContextNames ? intent.inputContextNames
                .map(contextName => contextsClient.contextPath(credentials.project_id, sessionId, contextName)) : [];

            return intent;
        });
}

loadEntities = () => {
    return walkSync('././dialogflow-elements/entities/')
        .map(baseFile => JSON.parse(fs.readFileSync(baseFile, "UTF-8")));
}

batchLoadEntityTypes = () => {
    const entityTypes = loadEntities();

    return entitiesClient.batchUpdateEntityTypes(
        {
            parent: formattedParent,
            entityTypeBatchInline: {
                entityTypes: entityTypes
            }
        }
    )
}

batchLoadIntents = () => {
    const intents = loadIntents();
    return intentsClient.batchUpdateIntents({
        parent: formattedParent,
        intentBatchInline: {
            intents: intents
        }
    });
}

loadAgent = () => {
    console.log("Recreating agent");
    console.log("Attempting to drop agent");
    dropAgent()
        .then(_ => {
            console.log("Create new agent");
            createAgent()
                .then(x => {
                    console.log("Agent created");
                    console.log("Loading entity types");
                    batchLoadEntityTypes();
                    console.log("Loading intents");
                    batchLoadIntents();
                    console.log("Process finished")
                }).catch(console.log)
        }).catch(console.log);
}

loadAgent();

module.exports.loadAgent = this.loadAgent;