// mitta screenshot 0.1.0
var tab_url = "";
var title = "";

function dataUrltoBlob(dataUrl) {
    var byteString;
    if (dataUrl.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(dataUrl.split(',')[1]);
    } else {
        byteString = unescape(dataUrl.split(',')[1]);
    }
    // separate out the mime component
    var mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];

    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

// handle click of icon
chrome.action.onClicked.addListener(function (tab) {
    tab_url = tab.url;
    title = tab.title;

    chrome.tabs.captureVisibleTab({format: "png"},(dataUrl) => {
        if (dataUrl && dataUrl.length) {
            setTimeout(() => {
                //var domain = "https://mitta.us";
                var domain = "http://localhost:8080";
                var blob = dataUrltoBlob(dataUrl);
                var fd = new FormData();
                fd.append("data", blob, "data");
                
                fetch(domain+'/p/sidekick', {
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    } 
                }).then(result => result.json())
                .then((result) => {
                    var sidekick = result.setting.value;
                    var request_url = domain + "/s/" + sidekick + '?line=!search url_str:"' + tab_url + '"';
                    fetch(request_url, {
                        headers: {
                            'Accept': 'application/json, text/plain, */*',
                            'Content-Type': 'application/json'
                        }  
                    }).then(result => result.json())
                    .then((result) => {
                        if (result.response.docs[0]) {
                            // found an existing indexed page
                            var spool = result.response.docs[0].spool;
                            var document_id = result.response.docs[0].document_id;
                            var upload_url = domain + "/u/" + spool + "?document_id=" + document_id;

                            fetch(upload_url, {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json, text/plain, */*'
                                },
                                body: fd
                            }).then(result => result.json())
                            .then(result => {
                                console.log("saved")
                            });
                        } else {
                             // no page found
                            var request_url = domain + "/u";
                            fetch(request_url, {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json, text/plain, */*',
                                    'Content-Type': 'application/json'  
                                },
                                body: JSON.stringify({url: tab_url, title: ""})
                            }).then(result => result.json())
                            .then(result => {
                                var index_url = domain + "/i/" + sidekick;

                                fetch(index_url, {
                                    method: 'POST',
                                    headers: {
                                        'Accept': 'application/json, text/plain, */*',
                                        'Content-Type': 'application/json'  
                                    },
                                    body: JSON.stringify({url: tab_url, title: title, spool: result.name, line: "!crawl " + tab_url})
                                }).then(result => result.json())
                                .then(result => {
                                    var document_id = result.docs[0].document_id;
                                    var spool = result.docs[0].spool;
                                    var upload_url = domain + "/u/" + spool + "?document_id=" + document_id;
                                        
                                    fetch(upload_url, {
                                        method: 'POST',
                                        headers: {
                                            'Accept': 'application/json, text/plain, */*'
                                        },
                                        body: fd
                                    }).then(result => result.json())
                                    .then(result => {
                                        console.log("saved");
                                    });
                                })
                            });
                        }
                    })
                })
            }, 123)            
        } else {
            console.log("no image");
        }
    });
})