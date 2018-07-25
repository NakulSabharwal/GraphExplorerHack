// ------------------------------------------------------------------------------
//  Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.  See License in the project root for license information.
// ------------------------------------------------------------------------------

import { Component, AfterViewInit } from '@angular/core';

import { GraphRequestHeader } from "./base";
import { GraphExplorerComponent } from "./GraphExplorerComponent";
import { getRequestBodyEditor, initializeAceEditor } from "./api-explorer-jseditor";
import {generate} from "./code-generator";

@Component({
  selector: 'request-editors',
  styleUrls: ['./request-editors.component.css'],
  templateUrl: './request-editors.component.html',
})
export class RequestEditorsComponent extends GraphExplorerComponent implements AfterViewInit {
    ngAfterViewInit(): void {
        this.addEmptyHeader();
        this.initPostBodyEditor();
        this.bindEvents();
    }
    bindEvents(): void {
        let tabList = document.getElementById("requestTabList");
        let codeSnippet = document.getElementById("codeSnippet");
        tabList.addEventListener("click", (event) => {
            let target = event.target,
                tabId = target.getAttribute("data-content");
            if(tabId === "code") {
                let languageList = document.getElementById("languageList");
                this.handleOnChange(languageList.value);
            }
        });
        let copyButton = document.getElementById("copyCode");
        copyButton.addEventListener("click", (event) => {
            this.copyCode(codeSnippet);
        });
    }

    copyCode(codeSnippet: HTMLElement): void {
        let target = document.getElementById("copySnippetTextArea");
        if(!target) {
            target = document.createElement("textarea");
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = "0";
            target.id = "copySnippetTextArea";
            document.body.appendChild(target);
        }
        target.textContent = codeSnippet.textContent;
        
        // select the content
        var currentFocus = document.activeElement;
        target.focus();
        target.setSelectionRange(0, target.value.length);

        // copy the selection
        document.execCommand("copy");

        // restore original focus
        if (currentFocus && typeof currentFocus.focus === "function") {
            currentFocus.focus();
        }
        
        // clear temporary content
        target.textContent = "";
    }

    initPostBodyEditor() {
        const postBodyEditor = getRequestBodyEditor()
        initializeAceEditor(postBodyEditor, this.getStr("Request body editor"));
    }

    isLastHeader(header:GraphRequestHeader) {
        return header === this.getLastHeader();
    }

    getPlaceholder(header:GraphRequestHeader) {
        if (this.getLastHeader() === header) {
            return this.getStr("Enter new header");
        }
    }

    /**
     * Check the keyboard input and remove the header if Enter/Return 
     * is selected when the button is the active element.
     * @param e The event arguments.
     * @param header The header key to remove from the request UI.
     */
    removeHeaderKeyDown(e: any, header: GraphRequestHeader) {
        // Enter/return
        if (e.keyCode === 13) {
            this.removeHeader(header);
        }
    }

    /**
     * Remove a header from the request UI.
     * @param header The header key to remove from the request UI.
     */
    removeHeader(header:GraphRequestHeader) {
        let idx = this.explorerValues.headers.indexOf(header);

        if (idx !== -1) {
            this.explorerValues.headers.splice(idx, 1);
        } else {
            console.error("Can't remove header", header)
        }
    }

    createNewHeaderField() {
        if (this.getLastHeader().name !== "") {
            this.addEmptyHeader()
        }

        // setTimeout(() => {
        //     mwf.ComponentFactory.create([{
        //         component: mwf.AutoSuggest,
        //         callback: (autoSuggests) => {
        //             if (!autoSuggests)
        //                 return;

        //             for (let autoSuggest of autoSuggests) {
        //                 if (autoSuggests[1].element.parentElement.className.indexOf("header-autocomplete") == -1) continue;
        //                 autoSuggest.subscribe({
        //                     onMatchPatternChanged: (notification) => {
        //                         autoSuggest.updateSuggestions(CommonHeaders.filter((s => s.toLowerCase().indexOf(notification.pattern.toLowerCase()) != -1 )).map((s) => { return { type: 'string', value: s }}));
        //                     }
        //                 });
        //             }

        //         }
        //     }]);
        // }, 0);
    }
    handleOnChange(language: string) {
        let snippet: string = generate(language.toLowerCase());
        document.getElementById("codeSnippet").innerText = snippet;
    }
}
