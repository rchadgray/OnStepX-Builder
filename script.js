document.getElementById('upload-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const configFile = document.getElementById('config-h').files[0];
    const extendedConfigFile = document.getElementById('extended-config-h').files[0];
    const statusDiv = document.getElementById('status');

    if (!configFile) {
        statusDiv.textContent = 'Please select a Config.h file.';
        return;
    }

    statusDiv.textContent = 'Starting upload...';

    try {
        const configFileContent = await readFileAsBase64(configFile);
        let extendedConfigFileContent = null;
        if (extendedConfigFile) {
            extendedConfigFileContent = await readFileAsBase64(extendedConfigFile);
        }

        const response = await fetch('/.netlify/functions/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                configFileContent: configFileContent,
                extendedConfigFileContent: extendedConfigFileContent
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'An unknown error occurred.');
        }

        statusDiv.innerHTML = `
            <p><strong>Files uploaded successfully! Your build has started.</strong></p>
            <p>It may take a minute or two for the build to appear. Click the link below and look for the latest workflow run at the top of the list.</p>
            <p>Once the build is complete, you can download your firmware from the "Artifacts" section on the summary page.</p>
            <a href="https://github.com/rchadgray/OnStepX_Platformio/actions" target="_blank" rel="noopener noreferrer">Go to Build Results Page</a>
        `;

    } catch (error) {
        statusDiv.textContent = `Error: ${error.message}`;
        console.error(error);
    }
});

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // result is "data:;base64,xxxxxx...", we only want the xxxxxx part
            resolve(reader.result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
