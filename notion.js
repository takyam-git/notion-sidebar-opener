(function () {
    // add button to right bottom
    const icon = window.document.createElement('img')
    icon.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAAwUlEQVRYw+2XQQ6EIAxF34pLeAQOy4YrcAxvoUfQlSvdmnTWOoIRaCYT+WxpX/JpmwJNTbXVEZiR04npfG8m0KXTL19BTwCCsKQQ4TLkGUAIccBUBTBxG5Cr2/gGeDnA4hjZ2Bhx2LoAg2c/1PqOx9RywNBfNlR/gciSj3Ss4GuktydzjkbZcoCLphcEVw4YkoChHLAmAesfANQtUn9k9TJVb7Sqo0J92P1sXJc60ABvAqgvv+rru/oHRP0L1dSUow8pEvbUIZqYTQAAAABJRU5ErkJggg==';
    icon.style.width = '20px';
    icon.style.height = '20px';
    const span = window.document.createElement('span')
    span.innerText = 'EXPAND'
    span.style.fontSize = '0.8rem';
    const button = window.document.createElement('button')
    button.style.zIndex = '9999';
    button.style.position = 'fixed';
    button.style.bottom = '60px';
    button.style.left = '10px';
    button.style.width = '150px';
    button.style.height = '40px';
    button.style.border = 'none';
    button.style.borderRadius = '8px';
    button.style.background = 'white';
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.fontWeight = 'normal';
    button.style.fontSize = '1.2rem';
    button.style.boxShadow = 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 2px 4px';
    button.style.gap = '5px';
    button.append(icon)
    button.append(span)

    button.addEventListener('mouseout', function () {
        button.style.background = 'rgb(239,239,238)'
    });
    button.addEventListener('mouseleave', function () {
        button.style.background = 'white';
    });

    window.setInterval(function() {
        const sidebar = window.document.body.querySelector('#notion-app .notion-sidebar-container .notion-sidebar')
        if (!sidebar) {
            return
        }
        const isFullSideBarHidden = sidebar.style.opacity === '0' || sidebar.style.height === 'auto'
        const isButtonHidden = button.style.display === 'none'
        if (isFullSideBarHidden && !isButtonHidden) {
            button.style.display = 'none'
        }
        if (!isFullSideBarHidden && isButtonHidden) {
            button.style.display = 'flex';
        }
    }, 500);

    const fetchPageId = function () {
        return window.location.pathname.slice(-32).replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
    }

    const createMap = function (id, blocks, ids) {
        const block = blocks.find(function (block) {
            return block.value.id === id
        })
        if (!block) {
            return ids
        }

        ids.push(id)

        return createMap(block.value.parent_id, blocks, ids)
    }

    const fetchBackLinks = async function (pageId) {
        const response = await fetch('https://www.notion.so/api/v3/getBacklinksForBlock', {
            method: 'POST',
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({block: {id: pageId}})
        })
        const data = await response.json()
        const blocks = data.recordMap.block
        const collection = data.recordMap.collection
        const objects = []
        if (typeof blocks !== 'undefined') {
            objects.push(...Object.values(blocks))
        }
        if (typeof collection !== 'undefined') {
            objects.push(...Object.values(collection))
        }
        return createMap(pageId, objects, [])
    }

    // recursive sidebar link opener
    const searchAndOpen = function (ids) {
        if (ids.length === 0) {
            return;
        }

        // shift head path
        const id = ids.shift()
        const shortId = id.replace(/-/g, '')


        // find sidebar navigation link
        const sidebarLink = window.document.querySelector(`#notion-app div.notion-sidebar-container nav .notion-page-block a[href*="${shortId}"]`)
        if (!sidebarLink) {
            searchAndOpen(ids)
            return;
        }

        // find opener
        const opener = sidebarLink.querySelector('div div div[role="button"]')
        if (!opener) {
            return
        }

        // skip when opened
        const svg = opener.querySelector('svg')
        if (svg && !svg.style.transform.includes('-90deg')) {
            searchAndOpen(ids)
            return
        }

        // click
        opener.click()

        // wait 500ms
        setTimeout(function () {

            // open next
            searchAndOpen(ids)
        }, 500)
    }

    button.addEventListener('click', async function (event) {
        event.preventDefault();
        event.stopPropagation();

        const pageId = fetchPageId()
        if (!pageId) {
            return
        }
        const ids = (await fetchBackLinks(pageId)).reverse()


        // execute open
        searchAndOpen(ids)
    });

    // add button to body
    window.document.body.append(button)
})();