class Popup extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();

    // Create a shadow root
    var shadow = this.attachShadow({mode: 'closed'});

    /*
    const doc = document.createElement('div');
    doc.innerHTML = "Hello from Custom Element!"; */

    const wrapper = document.createElement('div');
    wrapper.className = 'bap-wrapper';
    wrapper.setAttribute('class', 'bap-wrapper');

    // Header element
    const header = wrapper.appendChild(document.createElement('div'));
    header.className = 'bap-header';
    const headerText = header.appendChild(document.createElement('h6'));
    headerText.className = 'bap-header-text';
    headerText.innerText = "Baywheels Analysis Popup"
    const spacing = header.appendChild(document.createElement('span'));
    spacing.className = 'bap-spacer'
    const closeButton = header.appendChild(document.createElement('span'));
    closeButton.className = 'bap-close';
    closeButton.onclick = () => this.remove();

    //
    const body = wrapper.appendChild(document.createElement('div'));
    body.className = 'bap-body';
    body.innerHTML = getData();
    const logo = wrapper.appendChild(document.createElement('div'));
    logo.className = 'bap-sf-lineart';

    const style = document.createElement('link');
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('href', chrome.extension.getURL('style.css'),);
    shadow.appendChild(style)

    // Add the element to the shadow root.
    shadow.appendChild(wrapper);
  }
}

// Define the new element
customElements.define('baywheels-analysis-popup', Popup);

// Append the new element in the context of the host page.
if (! document.getElementsByTagName('baywheels-analysis-popup').length) {
  const popup = document.createElement('baywheels-analysis-popup')
  popup.setAttribute('style', 'position: fixed; top: 10px; right: 25px; z-index: 2147483647;');
  document.body.appendChild(popup);
}

