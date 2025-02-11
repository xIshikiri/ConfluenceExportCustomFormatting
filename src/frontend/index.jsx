import React, {Fragment, useEffect, useState} from 'react';
// Import required components from UI Kit
import ForgeReconciler, {Button, Select, Text, TextArea, useProductContext} from '@forge/react';
// Import required for calling resolver
import {invoke} from '@forge/bridge';

// Function to convert Confluence storage format to Markdown
const convertToMarkdown = (storageFormat) => {
    // Convert known HTML tags to Markdown equivalents
    return storageFormat
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')  // Convert bold
        .replace(/<em>(.*?)<\/em>/g, '*$1*')  // Convert italics
        .replace(/<u>(.*?)<\/u>/g, '__$1__')  // Convert underline
        .replace(/<del>(.*?)<\/del>/g, '\~\~$1\~\~') // Convert strikethrough
        .replace(/<code>(.*?)<\/code>/g, '`$1`')  // Convert inline code
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')  // Convert headers
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n') // Convert headers
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n')  // Convert headers
        .replace(/<ul>/g, '').replace(/<\/ul>/g, '')  // Convert lists
        .replace(/<li>(.*?)<\/li>/g, '- $1\n')  // Bullet points
        .replace(/<\/p>/g, '\n')    // Paragraph end to newline
        .replace(/<br\s*\/?>/g, '\n')   // <br> to newline
        .replace(/<\/?[^>]+>/g, '');    // Delete remaining tags
};

// Function to convert Confluence storage format to SteamBB
const convertToSteamBB = (storageFormat) => {
    // Convert known HTML tags to SteamBB equivalents
    return storageFormat
        .replace(/<strong>(.*?)<\/strong>/g, '[b]$1[/b]')  // Convert bold
        .replace(/<em>(.*?)<\/em>/g, '[i]$1[/i]')  // Convert italics
        .replace(/<u>(.*?)<\/u>/g, '[u]$1[/u]')  // Convert underline
        .replace(/<del>(.*?)<\/del>/g, '[strike]$1[/strike]') // Convert strikethrough
        .replace(/<code>(.*?)<\/code>/g, '[code]$1[/code]')  // Convert inline code
        .replace(/<h1>(.*?)<\/h1>/g, '[h1]$1[/h1]\n')  // Convert headers
        .replace(/<h2>(.*?)<\/h2>/g, '[h2]$1[/h2]\n') // Convert headers
        .replace(/<h3>(.*?)<\/h3>/g, '[h3]$1[/h3]\n')  // For SteamBB headers
        .replace(/<ul>/g, '[list]').replace(/<\/ul>/g, '[/list]')  // Convert lists
        .replace(/<li>(.*?)<\/li>/g, '[*] $1\n')  // Bullet points
        .replace(/<\/p>/g, '\n')    // Paragraph end to newline
        .replace(/<br\s*\/?>/g, '\n')   // <br> to newline
        .replace(/<\/?[^>]+>/g, '');    // Delete remaining tags
};


const App = () => {
    const [data, setData] = useState(null);
    const [format, setFormat] = useState("");
    const [convertedText, setConvertedText] = useState("");
    const context = useProductContext();
    const contentId = context?.extension?.content?.id;

    useEffect(() => {
        if (contentId) {
            invoke('getContent', { contentId }).then((fetchedData) => {
                setData(fetchedData);
                console.log(contentId, fetchedData);  // Log fetched data after setting it
            }).catch((error) => {
                console.error("Error fetching content:", error);
            });
        }
    }, [contentId]);

    const exportContent = () => {
        if (!data || !data.body || !data.body.storage.value) {
            console.error("No storage format found");
            return;
        }

        const storageFormat = data.body.storage.value;
        const output = format === 'markdown' ? convertToMarkdown(storageFormat) : convertToSteamBB(storageFormat);
        console.log('Converted output: \n', output);
        setConvertedText(output);
    };

/*
    const exportContentClipboard = async () => {
        try {
            await exportContent();
            focus();
            await navigator.clipboard.writeText(convertedText);
            console.log("Content copied to clipboard");
        } catch (error) {
            console.error("Error copying content:", error);
        }
    };
*/


    return (
        <Fragment>
            <Select appearance="default" placeholder="Choose formatting style" options={[
                {label: 'Markdown', value: 'markdown'},
                {label: 'SteamBB', value: 'steambb'},
            ]} onChange={({value}) => setFormat(value)} />
            <br/>
            <Button appearance="primary" onClick={exportContent}>Export</Button>
            <br/>
            {/*<Button appearance="primary" onClick={exportContentClipboard}>Export to Clipboard</Button>*/}
            {convertedText && (
                <TextArea isReadOnly={true} value={convertedText}></TextArea>
            )}
        </Fragment>
    );
};

ForgeReconciler.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);