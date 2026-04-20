const { Octokit } = require("@octokit/rest");

// v4: Refactor to use repository_dispatch instead of committing files
exports.handler = async function(event) {
    console.log("Function starting...");

    if (event.httpMethod !== "POST") {
        console.log("Method not allowed:", event.httpMethod);
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        console.log("Parsing event body...");
        const { configFileContent, extendedConfigFileContent } = JSON.parse(event.body);
        
        const token = process.env.GITHUB_PAT;

        if (!token) {
            console.error("CRITICAL: GITHUB_PAT environment variable not found.");
            throw new Error("GitHub PAT is not configured on the server.");
        }
        console.log("GITHUB_PAT found.");
        
        if (!configFileContent) {
            console.error("CRITICAL: configFileContent is missing from the request body.");
            return { statusCode: 400, body: JSON.stringify({ message: "Config.h content is missing."}) };
        }
        console.log("Config.h content found.");

        // Decode Base64 content received from web UI
        console.log("Decoding Base64 content...");
        const decodedConfigContent = Buffer.from(configFileContent, 'base64').toString('utf-8');
        console.log("Decoded Config.h length:", decodedConfigContent.length, "bytes");
        if (decodedConfigContent.length < 100) {
            console.warn("WARNING: Config.h content seems very short:", decodedConfigContent.substring(0, 100));
        }
        
        let decodedExtendedConfigContent = '';
        if (extendedConfigFileContent) {
            decodedExtendedConfigContent = Buffer.from(extendedConfigFileContent, 'base64').toString('utf-8');
            console.log("Decoded extended.config.h length:", decodedExtendedConfigContent.length, "bytes");
        }
        console.log("Base64 content decoded successfully.");

        const octokit = new Octokit({ auth: token });
        const owner = 'rchadgray';
        const repo = 'OnStepX-Builder';

        console.log(`Triggering repository_dispatch event 'trigger-onstepx-build' on ${owner}/${repo}`);
        
        await octokit.rest.repos.createDispatchEvent({
            owner,
            repo,
            event_type: 'trigger-onstepx-build',
            client_payload: {
                config_h: decodedConfigContent,
                extended_config_h: decodedExtendedConfigContent
            }
        });

        console.log("Repository dispatch event triggered successfully.");
        
        console.log("Function executed successfully.");
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Build successfully triggered via repository_dispatch!" }),
        };

    } catch (error) {
        console.error("CRITICAL: An error occurred in the handler.", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Error: ${error.message}` }),
        };
    }
};
