const { Octokit } = require("@octokit/rest");

// v3: Add extensive logging and simplify commit logic
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

        const octokit = new Octokit({ auth: token });
        const owner = 'rchadgray';
        const repo = 'OnStepX-Builder';
        const branch = 'main';

        const commitFiles = async (files) => {
            console.log(`Getting latest commit SHA for branch: ${branch}`);
            const { data: refData } = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
            const parentSha = refData.object.sha;
            console.log("Parent SHA:", parentSha);

            console.log("Creating blobs for file content...");
            const blobPromises = files.map(file => 
                octokit.rest.git.createBlob({ owner, repo, content: file.content, encoding: 'base64' })
                    .then(blob => ({ path: file.path, sha: blob.data.sha, mode: '100644', type: 'blob' }))
            );
            const tree = await Promise.all(blobPromises);
            console.log("Blobs created:", tree.map(t => t.path).join(', '));

            console.log("Creating new tree...");
            const { data: newTree } = await octokit.rest.git.createTree({ owner, repo, tree, base_tree: parentSha });
            console.log("New tree SHA:", newTree.sha);

            const commitMessage = `feat: Upload configuration files from web UI\n\n${tree.map(t => t.path).join('\n')}`;
            console.log("Creating new commit...");
            const { data: newCommit } = await octokit.rest.git.createCommit({ owner, repo, message: commitMessage, tree: newTree.sha, parents: [parentSha] });
            console.log("New commit SHA:", newCommit.sha);

            console.log("Updating branch reference...");
            await octokit.rest.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: newCommit.sha });
            console.log("Branch reference updated successfully.");
        };

        const filesToCommit = [{ path: 'Config.h', content: configFileContent }];
        if (extendedConfigFileContent) {
            console.log("extended.config.h content found.");
            filesToCommit.push({ path: 'extended.config.h', content: extendedConfigFileContent });
        }

        await commitFiles(filesToCommit);

        console.log("Function executed successfully.");
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Files committed successfully!" }),
        };

    } catch (error) {
        console.error("CRITICAL: An error occurred in the handler.", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Error: ${error.message}` }),
        };
    }
};
