// callback from content_script.js
chrome.runtime.onMessage.addListener((message, sender, senderResponse) => {
    console.log("down here");
    senderResponse({success: true})
    if (message.name === 'download' && message.url) {
        fetch('http://localhost:8080/u', {
            method: 'POST',
            headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
            body: JSON.stringify({url: tab_url, title: "a title", description: "a description"})
        }).then(res => res.json())
        .then(res => console.log(res));

        fetch('https://mitta.us/h').then(response => response.json()).then(data => console.log(data));

        chrome.downloads.download({
            filename: 'screenshot.png',
            url: message.url
        }, (downloadId) => {
            senderResponse({success: true})
        })

        return true;
    }
})