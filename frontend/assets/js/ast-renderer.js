'use strict';

let buffers = {};
let elem = document.getElementById('MathMLexamples');
let formats = {cmml:{},pmml:{}};


/**
 * from http://codemirror.net/demo/buffers.html
 * @param {CodeMirror} editor
 * @param {string} name
 */
function selectBuffer(editor, name) {
  let buf = buffers[name];
  if (buf.getEditor()) {
    buf = buf.linkedDoc({ sharedHist: true });
  }
  let old = editor.swapDoc(buf);
  let linked;
  old.iterLinkedDocs(doc => linked = doc);
  if (linked) {
    // Make sure the document in buffers is the one the other view is looking at
    const keys = Object.keys(buffers);
    for (const key of keys) {
      if (buffers[key] === old) {
        buffers[key] = linked;
      }
    }
    old.unlinkDoc(linked);
  }
  editor.focus();
}

document.addEventListener('astRendered', (e) => {
  document.querySelector('.btn-download').style.display = 'block';
});

function callAPI(evt) {
  if (evt) {
    evt.preventDefault();
  }
  Object.keys(formats).forEach((f)=>{
    selectBuffer(formats[f].cm, elem.options[elem.selectedIndex].label);
  });
  const scriptTag = document.createElement('script');
  scriptTag.setAttribute('type', 'application/javascript');
  scriptTag.setAttribute('src', '/widgets/formula-ast-widget.js');
  scriptTag.setAttribute('mathml', formats.cmml.cm.getValue());

  const container = document.querySelector('.abstract-syntax-tree');
  container.innerHTML = "";
  container.appendChild(scriptTag);
}

window.onload = function init() {

  Object.keys(formats).forEach((f)=>{
    const mml = document.getElementById(f);
    formats[f].cm = CodeMirror(mml, { lineNumbers: true });
  });

  [].forEach.call(
    elem.options,
    o => buffers[o.label] = CodeMirror.Doc(o.value, 'application/xml')
  );

  callAPI();

  elem.addEventListener('change', function(){
    callAPI();
  });
  window.formats = formats;
//  window.cm.scrollIntoView({line:52,ch:1});
};

const renderPNG = () => {
  const canvas = document.querySelector('iframe').contentDocument.querySelectorAll('canvas')[2];
  document.querySelector('.btn-download').href = canvas.toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');
};
