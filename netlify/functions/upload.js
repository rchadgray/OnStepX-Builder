const { Octokit } = require("@octokit/rest");

exports.handler = async function(event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { configFileContent, extendedConfigFileContent } = JSON.parse(event.body);
        const token = process.env.GITHUB_PAT;

        if (!token) {
            throw new Error("GitHub PAT is not configured on the server.");
        }
        
        if (!configFileContent) {
            return { statusCode: 400, body: JSON.stringify({ message: "Config.h content is missing."}) };
        }

        const octokit = new Octokit({ auth: token });
        const owner = 'rchadgray';
        const repo = 'OnStepX-Builder';
        const branch = 'main';

        const uploadFile = async (path, content) => {
            let sha;
            try {
                const { data } = await octokit.rest.repos.getContent({ owner, repo, path, ref: branch });
                sha = data.sha;
            } catch (error) {
                // If the file doesn't exist, it's fine. We'll create it.
                if (error.status !== 404) {
                    throw error;
                }
            }
            
            await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path,
                message: `Upload ${path} via web UI`,
                content: content,
                branch: branch,
                sha: sha
            });
        };

        await uploadFile('Config.h', configFileContent);
        if (extendedConfigFileContent) {
            await uploadFile('extended.config.h', extendedConfigFileContent);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Files committed successfully!" }),
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Error: ${error.message}` }),
        };
    }
};
