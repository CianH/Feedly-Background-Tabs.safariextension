if (document.location.host == 'feedly.com') {
  // Request the shortcut key setting from the global script; this injected
  // script lacks access to the extension settings object.
  var shortcutKey = 'v'.charCodeAt(0);
  safari.self.tab.dispatchMessage('getSettingValue', 'key');
  safari.self.addEventListener('message', function (event) {
    if (event.name === 'settingValueIs')
      shortcutKey = event.message.charCodeAt(0);
  }, false);

  document.addEventListener('keypress', function (event) {
    // Ignore keypresses on some common form elements.
    var tag = event.target.tagName;
    if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') {
      return;
    }

    // Catch the shortcut key, but ignore modified key presses.
    if (event.which === shortcutKey && !event.ctrlKey && !event.metaKey) {
      var item = null;
      var selectedElements = document.getElementsByClassName('u0Entry selectedEntry');
      if (!selectedElements || !selectedElements[0]) {
        // can't find 'u0Entry selectedEntry', fall back to search for 'inlineFrame noAnimation'
        var inlineFrames = document.getElementsByClassName('inlineFrame noAnimation');
        if (!inlineFrames || !inlineFrames[0]){
          // can't find 'inlineFrame noAnimation', means nothing is visibly selected.
          // TODO: Noticed an odd state sometimes where nothing is selected
          //       but v still works and doesn't background. Needs more investigation.
          return;
        }
        item = inlineFrames[0].getElementsByClassName('u100Entry')[0];
        if (!item){
          // haven't seen this state, but better safe than sorry.
          return;
        }
      }
      else{
        item = selectedElements[0];
      }
      event.stopPropagation();
      event.preventDefault();
      safari.self.tab.dispatchMessage('openBackgroundTab',
        item.attributes.getNamedItem('data-alternate-link').value);
    }
  }, true);
}
