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

        const { data: refData } = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
        const baseCommitSha = refData.object.sha;

        const { data: baseTreeData } = await octokit.rest.git.getCommit({ owner, repo, commit_sha: baseCommitSha });
        const baseTreeSha = baseTreeData.tree.sha;

        const createBlob = async (content) => {
            const { data } = await octokit.rest.git.createBlob({ owner, repo, content, encoding: 'base64' });
            return data;
        };

        const configBlob = await createBlob(configFileContent);
        const fileBlobs = [{ path: 'Config.h', sha: configBlob.sha, mode: '100644', type: 'blob' }];

        if (extendedConfigFileContent) {
            const extendedConfigBlob = await createBlob(extendedConfigFileContent);
            fileBlobs.push({ path: 'extended.config.h', sha: extendedConfigBlob.sha, mode: '100644', type: 'blob' });
        }
        
        const { data: newTree } = await octokit.rest.git.createTree({ owner, repo, base_tree: baseTreeSha, tree: fileBlobs });
        const { data: newCommit } = await octokit.rest.git.createCommit({ owner, repo, message: 'Upload configuration files from web UI', tree: newTree.sha, parents: [baseCommitSha] });

        await octokit.rest.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: newCommit.sha });

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
